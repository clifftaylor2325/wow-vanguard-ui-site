// The issue a report becomes: its title, labels and body, and the comment a
// repeat bug report adds instead. Shared by the /feedback/ page (the preview)
// and the Pages Function (what is posted). Every player string goes through
// sanitize.js: free text and pasted reports go in fenced blocks (so nothing a
// player types can add headings, tables, quotes, lists, HTML or mentions to
// the issue), and one-line values are escaped. The player's contact details
// are never part of any of this.
import { cleanLine, inline, cell, block, fence } from "./sanitize.js";
import { parseReport, fingerprint } from "./report.js";

export const LABELS = { bug: ["bug", "from-site"], feature: ["feature-request", "from-site"] };

// The lines that carry a report's own reference: shown, so a maintainer can
// search for it, and hidden, for tools. Each report (a new issue, or a
// comment on an existing one) has its own.
export function refLine(reference) {
  return `Reference: ${reference}\n<!-- fui-ref ${reference} -->`;
}

// The reference in an issue body, or "" when it has none.
export function refIn(body) {
  const m = String(body ?? "").match(/<!-- fui-ref (FUI-[A-Z0-9]{6}) -->/);
  return m ? m[1] : "";
}

// "raid-frames" for "Raid frames".
function areaSlug(label) {
  return String(label).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "none";
}

// A value from the parsed report for the environment table, or "not found".
function envCell(value) {
  return value ? cell(value) : "not found";
}

// The bug body's environment table.
function envTable(env) {
  const build = env.release || env.build ? `${env.release || "?"} (${env.build || "?"})` : "";
  return [
    "**Environment** (parsed from the report)",
    "| ForeverUI | Client | Build | Interface |",
    "|---|---|---|---|",
    `| ${envCell(env.version)} | ${envCell(env.client)} | ${envCell(build)} | ${envCell(env.iface)} |`,
  ].join("\n");
}

// The pasted report, folded away, or a note that there is none.
function pasted(f) {
  if (!f.report) return "_No report pasted: the player said they're on an old version or couldn't get one._";
  return `<details><summary>/fui report (as pasted)</summary>\n\n${fence(f.report)}\n</details>`;
}

// The bug title: "[Bug] summary", with " (v1.2.3, WoW Forever)" when the report says.
function bugTitle(f, env) {
  const where = [env.version && `v${env.version}`, env.client].filter(Boolean).map(cleanLine).join(", ");
  return `[Bug] ${cleanLine(f.title)}${where ? ` (${where})` : ""}`;
}

// A bug report's issue: { title, body, labels, fp, env }. reference fills the
// hidden reference line (the page's preview passes a placeholder).
export async function bugIssue(f, reference) {
  const env = parseReport(f.report);
  const fp = await fingerprint(env);
  const body = [
    `<!-- fui-feedback v1 kind=bug fp=${fp || "none"} src=site -->`,
    "**What I did**", block(f.did), "",
    "**What I expected**", f.expected ? block(f.expected) : "_not given_", "",
    "**What happened instead**", block(f.happened), "",
    envTable(env), "",
    pasted(f), "",
    "---",
    fp ? `_Sent from the ForeverUI site. Error fingerprint fp:${fp}._` : "_Sent from the ForeverUI site. No error fingerprint: the report has no caught error._",
    refLine(reference),
  ].join("\n");
  return { title: bugTitle(f, env), body, labels: LABELS.bug, fp, env };
}

// A feature request's issue: { title, body, labels }. areaLabel is the chosen
// part of ForeverUI as the form shows it.
export function featureIssue(f, areaLabel, reference) {
  const body = [
    `<!-- fui-feedback v1 kind=feature area=${areaSlug(areaLabel)} src=site -->`,
    "**What I want**", block(f.want), "",
    `**Part of ForeverUI:** ${inline(areaLabel)}`, "",
    "**Why it would help**", block(f.why), "",
    "---",
    "_Sent from the ForeverUI site._",
    refLine(reference),
  ].join("\n");
  return { title: `[Idea] ${cleanLine(f.title)}`, body, labels: LABELS.feature };
}

// The comment a repeat bug report adds to the open issue it matches, with
// the repeat reporter's own reference.
export function duplicateComment(f, env, fp, reference) {
  const first = env.errors[0];
  const build = env.release || env.build ? `${env.release || "?"} (${env.build || "?"})` : "build unknown";
  const head = `Another player hit this. ForeverUI ${inline(env.version || "unknown")}, ${inline(env.client || "client unknown")} ${inline(build)}. Occurrences in their session: ${first ? first.count : "unknown"}.`;
  return [
    head,
    "<details><summary>their notes</summary>", "",
    "**What they did**", block(f.did), "",
    "**What happened instead**", block(f.happened), "",
    "</details>", "",
    refLine(reference),
    `<!-- fui-feedback v1 kind=duplicate fp=${fp} src=site -->`,
  ].join("\n");
}
