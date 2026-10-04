// Merges two extractions into what the site shows: `rel` is the release
// players can download, `next` is the newer source (what the next release
// will hold). Every command, module and setting carries where it exists, so
// the pages can say "In v0.3.0", "Next release" or "v0.3.0 only".
import { slug } from "./html.mjs";
import { defaultLabel } from "./extract.mjs";

// Feature areas for grouping the Features page (plan §3.2). A module that
// isn't listed still shows, under "Other".
export const AREAS = [
  ["Unit frames", ["UnitFrames", "CastBars", "FrameAuras", "PlayerAuras", "ComboPoints", "ClassBars", "PowerTicks", "SwingTimer", "UnitExtras", "PartyExtras"]],
  ["Raid and group", ["RaidFrames", "RaidAuras", "RaidHealing", "RaidStatus", "MainTanks", "RaidTools", "ClickCast"]],
  ["Action bars", ["ActionBars", "SpecialBars", "DataBars"]],
  ["Map and HUD", ["Minimap", "MinimapButtons", "InfoStrip", "MenuStrip"]],
  ["Chat", ["Chat", "ChatExtras", "ChatWatch"]],
  ["Items and money", ["Bags", "Merchant", "VendorMemory", "AuctionHelper", "Errands"]],
  ["Quests", ["QuestDialog", "QuestTracker", "QuestLog", "QuestAuto"]],
  ["Comfort and more", ["AfkScreen", "AutoAccept", "GameAlerts", "GameTools", "FightHistory", "InstancePrep", "Windows", "Tooltips", "Nameplates", "Situations"]],
];

// Help-line entries for one extraction: [{ keys, lines }] in help order.
function entriesOf(cmds) {
  const out = [];
  cmds.lines.forEach((l, i) => {
    if (i === 0) return;
    const keys = cmds.commands.filter((c) => c.helpIndex === i).map((c) => c.key);
    const first = l.syntax.split(/\s+/)[0];
    const owner = !keys.length && out.find((e) => e.keys.includes(first));
    if (owner) owner.lines.push(l);
    else out.push({ keys, lines: [l] });
  });
  return out;
}

// The merged command list.
function mergeCommands(rel, next) {
  const relKeys = new Set(rel.commands.commands.map((c) => c.key));
  const nextKeys = new Set(next.commands.commands.map((c) => c.key));
  const relEntries = entriesOf(rel.commands);
  const nextEntries = entriesOf(next.commands);
  const all = [];
  const lead = ["options", "config", "help"];
  all.push({ id: "fui", keys: ["options", "config"].filter((k) => relKeys.has(k) || nextKeys.has(k)), special: "fui" });
  all.push({ id: "help", keys: ["help"], special: "help" });
  for (const e of nextEntries) {
    const r = relEntries.find((x) => x.keys.some((k) => e.keys.includes(k)));
    all.push({ id: e.keys[0] || slug(e.lines[0].syntax), keys: e.keys, nextLines: e.lines, relLines: r ? r.lines : null });
  }
  for (const r of relEntries) {
    if (all.some((e) => e.keys.some((k) => r.keys.includes(k)))) continue;
    all.push({ id: r.keys[0] || slug(r.lines[0].syntax), keys: r.keys, nextLines: null, relLines: r.lines });
  }
  const covered = new Set(all.flatMap((e) => e.keys));
  for (const k of [...nextKeys, ...relKeys]) {
    if (covered.has(k) || lead.includes(k)) continue;
    all.push({ id: k, keys: [k], nextLines: null, relLines: null });
    covered.add(k);
  }
  const moduleOf = new Map([...rel.commands.commands, ...next.commands.commands].filter((c) => c.module).map((c) => [c.key, c.module]));
  for (const e of all) {
    e.inRel = e.keys.length ? e.keys.every((k) => relKeys.has(k)) : !!e.relLines;
    e.inNext = e.keys.length ? e.keys.every((k) => nextKeys.has(k)) : !!e.nextLines;
    e.modules = [...new Set(e.keys.map((k) => moduleOf.get(k)).filter(Boolean))];
    e.changed = !!(e.relLines && e.nextLines && e.relLines.map((l) => l.line).join("\n") !== e.nextLines.map((l) => l.line).join("\n"));
  }
  return { entries: all, relKeys, nextKeys, slashes: next.commands.slashes, relSlashes: rel.commands.slashes, intro: next.commands.help[0], relIntro: rel.commands.help[0], unknown: next.commands.unknown };
}

// Merged options pages, rows tagged with where they exist and their defaults per version.
function mergePages(rel, next) {
  const pages = [];
  const relByKey = new Map(rel.pages.map((p) => [p.key, p]));
  const rowKey = (r) => `${r.kind}|${r.caption}`;
  for (const np of next.pages) {
    const rp = relByKey.get(np.key);
    const relRows = new Map((rp?.rows || []).map((r) => [rowKey(r), r]));
    const rows = np.rows.map((r) => {
      const old = relRows.get(rowKey(r));
      return { ...r, inNext: true, inRel: !!old, relDefault: old ? defaultLabel(old) : null, nextDefault: defaultLabel(r) };
    });
    for (const r of rp?.rows || []) {
      if (!np.rows.some((x) => rowKey(x) === rowKey(r))) rows.push({ ...r, inNext: false, inRel: true, relDefault: defaultLabel(r), nextDefault: null });
    }
    pages.push({ key: np.key, title: np.title, id: slug(np.title), inRel: !!rp, inNext: true, rows, relTitle: rp?.title });
  }
  for (const rp of rel.pages) {
    if (pages.some((p) => p.key === rp.key)) continue;
    pages.push({ key: rp.key, title: rp.title, id: slug(rp.title), inRel: true, inNext: false, rows: rp.rows.map((r) => ({ ...r, inRel: true, inNext: false, relDefault: defaultLabel(r), nextDefault: null })) });
  }
  return pages;
}

// Merged modules with their display name, description, area, settings pages and commands.
function mergeModules(rel, next, pages, commands) {
  const relNames = new Set(rel.modules.map((m) => m.name));
  const nextNames = new Set(next.modules.map((m) => m.name));
  const keys = [...new Set([...Object.keys(next.moduleInfo), ...next.modules.map((m) => m.name), ...rel.modules.map((m) => m.name)])];
  return keys.map((key) => {
    const info = next.moduleInfo[key] || rel.moduleInfo[key] || [key, ""];
    const area = (AREAS.find(([, list]) => list.includes(key)) || ["Other"])[0];
    const onPages = pages.filter((p) => p.rows.some((r) => r.ref?.scope === key)).map((p) => ({ title: p.title, id: p.id }));
    const cmds = commands.entries.filter((e) => e.modules.includes(key)).map((e) => e.id);
    return { key, name: info[0], desc: info[1], id: slug(info[0]), area, inRel: relNames.has(key), inNext: nextNames.has(key) || key in next.moduleInfo, pages: onPages, commands: cmds };
  });
}

// The model every page is rendered from.
export function buildModel({ rel, next, release, zip, releases }) {
  const commands = mergeCommands(rel, next);
  const pages = mergePages(rel, next);
  const modules = mergeModules(rel, next, pages, commands);
  return { rel, next, release, zip, releases, commands, pages, modules, version: rel.meta.Version, same: rel.commit === next.commit };
}
