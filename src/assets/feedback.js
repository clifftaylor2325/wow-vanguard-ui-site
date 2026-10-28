// The /feedback/ form: switch between bug and feature, check the fields, show
// the exact report (built by the same code the Pages Function uses), run the
// Turnstile check, send it to POST /api/feedback, and show the reference.
// Nothing the player typed is cleared until a report is sent.
import { english, readFields, validate } from "./feedback/fields.js";
import { bugIssue, featureIssue } from "./feedback/body.js";
import { parseFeedback } from "./feedback/fill.js";

const PLACEHOLDER_REF = "VG-??????";
const TURNSTILE_JS = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const $ = (sel) => document.querySelector(sel);
const form = $("#fb-form");
const preview = $("#fb-preview");
const done = $("#fb-done");
const status = $("#fb-status");
const sendError = $("#fb-send-error");
const sendBtn = $("#fb-send");
const filled = $("#fb-filled");
const t0 = Date.now();
let config = null;
let widget = null;
let token = "";

// The page's translations of this script's messages, keyed by the English (none on the English page).
const MESSAGES = JSON.parse(($("#fb-messages") || {}).textContent || "{}");
// A message in the page's language, its {slots} filled and its numbers written as the language writes them.
const tr = (text, values) => english(MESSAGES[text] ?? text, values, document.documentElement.lang || "en-US");

// The chosen kind: "bug" or "feature".
// A form control by name (form.title would be the form's own title attribute).
const el = (name) => form.elements.namedItem(name);

const kind = () => (form.querySelector("input[name=kind]:checked") || {}).value || "";

// Every allowed "Part of Vanguard" value, and the label of one.
const areaValues = () => Array.from(el("area").options, (o) => o.value).filter(Boolean);
const areaLabel = (value) => (Array.from(el("area").options).find((o) => o.value === value) || {}).textContent || "";

// The form's values, as the Function reads them.
function values() {
  const data = { kind: kind() };
  for (const control of form.elements) {
    if (!control.name || control.name === "kind" || control.matches(":disabled")) continue;
    data[control.name] = control.type === "checkbox" ? control.checked : control.value;
  }
  return data;
}

// Shows the bug or feature fields (the other set is disabled, so it isn't sent or checked).
function showKind() {
  for (const group of form.querySelectorAll("[data-kind]")) {
    const on = group.getAttribute("data-kind") === kind();
    group.hidden = !on;
    group.disabled = !on;
  }
}

// Shows or hides the contact box.
function showContact() {
  form.querySelector(".fb-contact").hidden = !el("contact_ok").checked;
}

// Puts each field's message under it (and clears the rest); focuses the first.
function showErrors(errors) {
  let first = null;
  for (const box of form.querySelectorAll("[data-field]")) {
    const name = box.getAttribute("data-field");
    const err = box.querySelector(".err");
    const input = box.querySelector("input, textarea, select");
    const msg = errors[name] || "";
    if (err) {
      err.textContent = msg;
      err.hidden = !msg;
    }
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg && !first && !box.closest("[hidden]")) first = input;
  }
  if (first) first.focus();
  return !first;
}

// The fields a /vg feedback block fills, in the form's order.
const FILLED = ["title", "did", "expected", "happened", "want", "why", "report"];

// Fills the form from a /vg feedback block pasted into `box` (the paste box,
// or the report box): the kind, every text the block has, and the area when
// it is one the form offers. The paste box is emptied; the report box keeps
// only the /vg report. Text pasted that holds no block is left alone.
function fillFrom(box) {
  const parsed = parseFeedback(box.value);
  if (!parsed) return;
  if (parsed.kind) {
    form.querySelector(`input[name=kind][value=${parsed.kind}]`).checked = true;
    showKind();
  }
  for (const name of FILLED) if (parsed[name]) el(name).value = parsed[name];
  if (parsed.area && areaValues().includes(parsed.area)) el("area").value = parsed.area;
  box.value = box === el("report") ? parsed.report : "";
  showErrors({});
  say(filled, tr("Filled in from what you pasted. Check the fields, then Preview."));
}

// A notice line in an alert box (empty text hides it).
function say(box, text, tone) {
  box.textContent = text;
  box.hidden = !text;
  box.classList.toggle("bad", tone === "bad");
}

// The issue the Function would file for these fields (with a placeholder reference).
async function issueFor(f) {
  return f.kind === "bug" ? bugIssue(f, PLACEHOLDER_REF) : featureIssue(f, areaLabel(f.area), PLACEHOLDER_REF);
}

// One step showing: "form", "preview" or "done".
function step(name) {
  form.hidden = name !== "form";
  preview.hidden = name !== "preview";
  done.hidden = name !== "done";
  const heading = { form: null, preview: "#fb-preview-h", done: "#fb-done-h" }[name];
  if (heading) $(heading).focus();
}

// Loads Turnstile's script once; resolves when window.turnstile is there.
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_JS;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
}

// Shows the Turnstile check on the preview step (once), managed mode.
async function showTurnstile() {
  if (!config || !config.accepting) return;
  try {
    await loadTurnstile();
  } catch {
    return say(sendError, tr("The spam check couldn't load. Check your connection, then try again."), "bad");
  }
  if (widget !== null) return;
  widget = window.turnstile.render("#fb-turnstile", {
    sitekey: config.sitekey,
    theme: "dark",
    callback: (t) => { token = t; },
    "expired-callback": () => { token = ""; },
    "error-callback": () => { token = ""; },
  });
}

// A fresh Turnstile check after a failed send (tokens work once).
function resetTurnstile() {
  token = "";
  if (window.turnstile && widget !== null) window.turnstile.reset(widget);
}

// Preview: check the fields, then show exactly what will be sent.
async function onPreview(e) {
  e.preventDefault();
  const f = readFields(values());
  if (!showErrors(validate(f, areaValues(), tr))) return;
  const issue = await issueFor(f);
  $("#fb-preview-title").textContent = issue.title;
  $("#fb-preview-labels").textContent = issue.labels.join(", ");
  $("#fb-preview-body").textContent = issue.body;
  const kept = f.contact ? `${tr("Your contact details are not in the report: they're kept privately for 90 days.")} ` : "";
  $("#fb-preview-note").textContent = kept + tr("The reference ({ref} above) is filled in when you send. If this matches a bug that's already been reported, your notes are added to that report instead.", { ref: PLACEHOLDER_REF });
  say(sendError, "");
  step("preview");
  await showTurnstile();
}

// The message for a failed send, from the Function's answer.
function failure(res, data) {
  if (res.status === 400 && data.fields) return tr("Some fields need another look: go back with Edit.");
  if (res.status === 429) return data.message || tr("You've sent several reports in a short time. Please wait a while before sending another.");
  return (data && data.message) || tr("Reports can't be sent right now. Your text is still here: try again later, or copy it to keep it.");
}

// Send: post the fields and the Turnstile token; show the reference.
async function onSend() {
  if (!config || !config.accepting) return say(sendError, tr("Reports can't be sent right now. Copy the report text to keep it, and try again later."), "bad");
  if (!token) return say(sendError, tr("Please finish the spam check above first."), "bad");
  sendBtn.disabled = true;
  say(sendError, "");
  let res;
  let data = {};
  try {
    res = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values(), turnstile: token, t0, t1: Date.now() }) });
    data = await res.json().catch(() => ({}));
  } catch {
    res = { ok: false, status: 0 };
  }
  sendBtn.disabled = false;
  if (res.ok && data.reference) return sent(data);
  resetTurnstile();
  if (res.status === 400 && data.fields) showErrors(data.fields);
  say(sendError, failure(res, data), "bad");
}

// The confirmation: the reference only.
function sent(data) {
  $("#fb-ref").textContent = data.reference;
  $("#fb-done-dup").textContent = data.duplicate ? tr("Another player reported the same error, so your notes were added to that report. This reference is yours alone.") : "";
  step("done");
}

// Start over with an empty form.
function again() {
  form.reset();
  resetTurnstile();
  showKind();
  showContact();
  showErrors({});
  step("form");
  el("title").focus();
}

// Whether reports can be sent, and the Turnstile sitekey.
async function loadConfig() {
  try {
    const res = await fetch("/api/feedback", { headers: { accept: "application/json" } });
    config = res.ok ? await res.json() : null;
  } catch {
    config = null;
  }
  if (!config || !config.accepting) say(status, tr("Reports can't be sent from this page right now. You can still fill in the form and preview your report, then copy it to keep it until sending works again."));
}

if (form) {
  form.addEventListener("change", (e) => {
    if (e.target.name === "kind") showKind();
    if (e.target.name === "contact_ok") showContact();
  });
  form.addEventListener("input", (e) => {
    if (e.target.id === "fb-paste" || e.target.name === "report") fillFrom(e.target);
  });
  form.addEventListener("submit", onPreview);
  sendBtn.addEventListener("click", onSend);
  $("#fb-edit").addEventListener("click", () => { step("form"); el("title").focus(); });
  $("#fb-again").addEventListener("click", again);
  showKind();
  showContact();
  loadConfig();
}
