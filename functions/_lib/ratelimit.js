// Submission caps kept in the FEEDBACK_KV namespace: 5 accepted submissions an
// hour per player and 60 new issues a day for everyone. A player is
// sha256(IP + RL_SALT + today's UTC date), so the key changes every day and no
// IP is stored. KV is eventually consistent, so the caps are approximate.
import { sha256Hex } from "../../src/feedback/report.js";

export const PER_HOUR = 5;
export const PER_DAY = 60;

// "2026-10-05" and "2026-10-05T01" (UTC) for a time in ms.
function stamps(now) {
  const iso = new Date(now).toISOString();
  return { day: iso.slice(0, 10), hour: iso.slice(0, 13) };
}

// The KV keys for this player and today.
export async function capKeys(ip, salt, now) {
  const { day, hour } = stamps(now);
  const who = await sha256Hex(`${ip}${salt}${day}`);
  return { player: `rl:p:${who}:${hour}`, day: `rl:d:${day}` };
}

// Seconds until the next UTC hour, or the next UTC day.
function untilNext(now, unit) {
  const d = new Date(now);
  if (unit === "hour") d.setUTCMinutes(60, 0, 0);
  else d.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((d.getTime() - now) / 1000));
}

// null when this player may send now, else { retryAfter } in seconds.
export async function checkCaps(kv, keys, now) {
  const [player, day] = await Promise.all([kv.get(keys.player), kv.get(keys.day)]);
  if (Number(player) >= PER_HOUR) return { retryAfter: untilNext(now, "hour") };
  if (Number(day) >= PER_DAY) return { retryAfter: untilNext(now, "day") };
  return null;
}

// Adds one to a counter (TTL in seconds; KV's minimum is 60).
async function bump(kv, key, ttl) {
  const n = Number(await kv.get(key)) || 0;
  await kv.put(key, String(n + 1), { expirationTtl: ttl });
}

// Counts an accepted submission, and a new issue when one was made.
export async function countSubmission(kv, keys, createdIssue) {
  await bump(kv, keys.player, 2 * 3600);
  if (createdIssue) await bump(kv, keys.day, 2 * 86400);
}
