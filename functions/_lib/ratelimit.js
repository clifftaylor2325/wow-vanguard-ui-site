// Submission caps kept in the FEEDBACK_KV namespace: 5 sends in any rolling
// hour per player, and 60 new issues per UTC day for everyone.
//
// A player is sha256(IP + RL_SALT + UTC date): the key changes every day and
// no IP is stored. Workers KV has no atomic increment, so instead of a counter
// each send first WRITES its own slot key (time + random id), then LISTS the
// slots and goes ahead only if fewer than the cap are as old as its own or
// older. So of N requests arriving together at most the cap get through, as
// long as KV shows each of them the others' writes (a few that could have
// gone through may be refused: it errs on the side of refusing). KV doesn't
// promise that (it is eventually consistent, and list results can lag by up
// to a minute, more across locations), so this narrows the race a lot but
// can't close it: see README.
// A slot is deleted again when the send is refused or fails, so only accepted
// sends (and only new issues, for the day cap) count.
import { sha256Hex } from "../../src/feedback/report.js";

export const PER_HOUR = 5;
export const PER_DAY = 60;
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const PAD = 15;

// "2026-10-05" (UTC) for a time in ms.
const dayOf = (now) => new Date(now).toISOString().slice(0, 10);

// The KV prefixes: this player's slots (today's key and, for the rolling
// hour across midnight, yesterday's) and today's new-issue slots.
export async function capKeys(ip, salt, now) {
  const [today, yesterday] = await Promise.all([dayOf(now), dayOf(now - DAY)].map((d) => sha256Hex(`${ip}${salt}${d}`)));
  return { player: `rl:p:${today}:`, playerBefore: `rl:p:${yesterday}:`, day: `rl:d:${dayOf(now)}:` };
}

// A slot key: prefix, zero-padded time, random id (so keys sort by time).
function slotKey(prefix, now) {
  const id = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}${String(now).padStart(PAD, "0")}:${id}`;
}

// The time in a slot key.
const slotTime = (name) => Number(name.split(":")[3]);

// Every key name under a prefix (following list cursors).
async function names(kv, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, cursor });
    for (const k of page.keys) out.push(k.name);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

// Writes a slot, re-reads the slots, and keeps ours only when fewer than
// `cap` other slots inside the window are as old as ours or older (a slot
// with the same time counts against us, so a tie can't squeeze past an
// already accepted send). Returns { key } on success, or { retryAfter }
// (seconds) after deleting our slot.
async function takeSlot(kv, prefixes, cap, windowMs, ttl, now, retryAt) {
  const key = slotKey(prefixes[0], now);
  await kv.put(key, "1", { expirationTtl: ttl });
  const all = (await Promise.all(prefixes.map((p) => names(kv, p)))).flat();
  const before = all
    .filter((n) => n !== key && slotTime(n) > now - windowMs && slotTime(n) <= now)
    .sort((a, b) => slotTime(a) - slotTime(b));
  if (before.length < cap) return { key };
  await kv.delete(key);
  return { retryAfter: Math.max(1, Math.ceil((retryAt(before) - now) / 1000)) };
}

// Seconds until the next UTC day.
function nextDay(now) {
  const d = new Date(now);
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

// Reserves this send against both caps. Returns { slots } to pass to
// release() later, or { retryAfter } when a cap is reached (nothing kept).
export async function reserve(kv, keys, now) {
  // The rolling hour frees up when the oldest slot that's in the way turns an hour old.
  const player = await takeSlot(kv, [keys.player, keys.playerBefore], PER_HOUR, HOUR, 2 * 3600, now, (before) => slotTime(before[before.length - PER_HOUR]) + HOUR);
  if (player.retryAfter) return player;
  const day = await takeSlot(kv, [keys.day], PER_DAY, DAY, 2 * 86400, now, () => nextDay(now));
  if (day.retryAfter) {
    await kv.delete(player.key);
    return day;
  }
  return { slots: { player: player.key, day: day.key } };
}

// Gives back slots: all of them when the send failed, or just the day slot
// when no new issue was made (a duplicate became a comment).
export async function release(kv, slots, { failed }) {
  await kv.delete(slots.day);
  if (failed) await kv.delete(slots.player);
}
