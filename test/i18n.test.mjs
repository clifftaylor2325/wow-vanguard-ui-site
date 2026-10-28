// The site in other languages (scripts/lib/i18n-site.mjs): every language has
// every string and every Troubleshooting and Support text, the addon's own
// translations reach the Settings, Commands and Troubleshooting pages, and a build with every language switched on gives each page its lang,
// hreflang, sitemap entry and translated shell, with no English left in it.
// The live site publishes only the languages in `locales` (site.config.json);
// this test builds them all into a temporary folder. Run after a build, with
// the same FUI_SRC (it reads the addon checkout).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig, root } from "../scripts/lib/config.mjs";
import { NAV, menuPaths } from "../scripts/lib/html.mjs";
import { ENGLISH, ENGLISH_STRINGS, LOCALES, publishedLocales, parseLocaleLua, parseCsv, parseDraftCsv, addonTranslations, siteLocale, localiseLinks, proseOf, proseProblems } from "../scripts/lib/i18n-site.mjs";
import { MESSAGES } from "../functions/_lib/handler.js";
import { commandWords, commandsIn } from "../scripts/lib/commands.mjs";
import { ENGLISH_HELP } from "../scripts/lib/help-content.mjs";
import { helpPage, supportPage, SUPPORT_PAGE } from "../scripts/lib/pages-more.mjs";
import { gitReader } from "../scripts/lib/source.mjs";
import { extractAddon, specReader } from "../scripts/lib/extract.mjs";
import { buildModel, AREAS } from "../scripts/lib/model.mjs";
import { FALLBACK_AREAS } from "../src/feedback/fields.js";
import { settingsPage, commandsPage, startPage } from "../scripts/lib/pages-main.mjs";

const cfg = loadConfig();
const placeholders = (s) => [...new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
const marks = (s) => [(String(s).match(/`/g) || []).length, (String(s).match(/\*\*/g) || []).length];
// Every template of a string: the string, or each plural form.
const forms = (v) => (typeof v === "string" ? [v] : Object.values(v));

for (const loc of LOCALES) {
  test(`${loc.code} has every site string, and only those`, () => {
    assert.deepEqual(Object.keys(loc.strings).sort(), Object.keys(ENGLISH_STRINGS).sort());
  });

  test(`${loc.code} strings keep English's placeholders, markup and plural categories`, () => {
    const categories = new Intl.PluralRules(loc.lang).resolvedOptions().pluralCategories.sort();
    for (const [key, en] of Object.entries(ENGLISH_STRINGS)) {
      const v = loc.strings[key];
      assert.equal(typeof v, typeof en, `${key}: a ${typeof en === "string" ? "string" : "plural"}`);
      if (typeof en !== "string") assert.deepEqual(Object.keys(v).sort(), categories, `${key}: one form per ${loc.lang} plural category`);
      const want = placeholders(forms(en).join(" ")).filter((p) => p !== "noun");
      for (const f of forms(v)) {
        assert.ok(f.trim() !== "", `${key}: not empty`);
        assert.deepEqual(placeholders(f).filter((p) => p !== "noun"), want, `${key}: placeholders in “${f}”`);
        assert.deepEqual(marks(f), marks(forms(en)[0]), `${key}: the same \`code\` and **strong** marks as English`);
      }
    }
  });
}

// ------------------------------------------------------------------ Troubleshooting and Support

const ENGLISH_PAGES = { help: ENGLISH_HELP, support: SUPPORT_PAGE };
// Every text of a page table by its path ("help.entries.look.a"); the question count's forms aside.
function pageTexts(table, at = "") {
  return Object.entries(table).flatMap(([k, v]) => {
    if (`${at}${k}` === "help.page.questions") return [];
    return typeof v === "string" ? [[`${at}${k}`, v]] : pageTexts(v, `${at}${k}.`);
  });
}
// What a Help or Support text must keep from English, sorted: its {fact}s, {ui:Text}s and
// badges; its tags with their attributes; and what each <code> holds (commands are typed as in English).
const slots = (s) => (s.match(/\{[^}]+\}/g) || []).sort();
const tags = (s) => (s.match(/<[^>]+>/g) || []).sort();
const codes = (s) => (s.match(/<code>[\s\S]*?<\/code>/g) || []).sort();

for (const loc of LOCALES) {
  test(`${loc.code} has every Troubleshooting and Support text, and only those`, () => {
    assert.deepEqual(pageTexts(loc.pages).map(([k]) => k).sort(), pageTexts(ENGLISH_PAGES).map(([k]) => k).sort());
  });

  test(`${loc.code} Troubleshooting and Support texts keep English's quotes, names, tags and commands`, () => {
    const own = new Map(pageTexts(loc.pages));
    for (const [key, en] of pageTexts(ENGLISH_PAGES)) {
      const t = own.get(key);
      assert.ok(t.trim() !== "" && (t !== en || key === "help.page.quote"), `${key}: translated`);
      assert.deepEqual(slots(t), slots(en), `${key}: the same {fact}s and {ui:...} names`);
      assert.deepEqual(tags(t), tags(en), `${key}: the same tags and links`);
      assert.deepEqual(codes(t), codes(en), `${key}: commands as typed in English`);
    }
  });

  test(`${loc.code} counts questions in each of its plural categories`, () => {
    const forms = loc.pages.help.page.questions;
    assert.deepEqual(Object.keys(forms).sort(), new Intl.PluralRules(loc.lang).resolvedOptions().pluralCategories.sort());
    for (const f of Object.values(forms)) assert.ok(f.includes("{n}"), f);
  });
}

test("English plurals have one and other", () => {
  for (const [key, v] of Object.entries(ENGLISH_STRINGS)) if (typeof v !== "string") assert.deepEqual(Object.keys(v).sort(), ["one", "other"], key);
});

test("the published languages: English first, then the listed codes; an unknown code fails", () => {
  assert.deepEqual(publishedLocales([]), [ENGLISH]);
  assert.deepEqual(publishedLocales(["ru", "de"]).map((l) => l.code), ["en", "de", "ru"]);
  assert.throws(() => publishedLocales(["deDE"]), /unknown site locale/);
  const raw = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));
  assert.ok(Array.isArray(raw.locales), "site.config.json lists `locales`");
  publishedLocales(raw.locales);
});

test("a locale file's translations are read as the addon's import writes them", () => {
  const lua = [
    "-- German (deDE) translations, written by `node scripts/i18n.mjs import deDE <file.csv>`:",
    'L["Not this"] = "comment"',
    "local L = ns.NewLocale(\"deDE\")",
    "if not L then return end",
    "",
    'L["Bags"] = "Taschen"',
    'L["Say \\"hi\\"\\nnow"] = "Sag \\"hallo\\"\\njetzt"',
  ].join("\n");
  const t = parseLocaleLua(lua);
  assert.equal(t.get("Bags"), "Taschen");
  assert.equal(t.get('Say "hi"\nnow'), 'Sag "hallo"\njetzt');
  assert.equal(t.size, 3, "every L[...] = line, comments aside (the header line has no L[ at its start)");
  assert.equal(parseLocaleLua('ns.NewLocale("frFR")\n').size, 0, "a locale with no reviewed rows yet");
});

// A reader with only a Locales/ folder, for addonTranslations.
function fakeReader(files) {
  return { list: (dir) => (dir === "Locales" ? Object.keys(files) : []), readBuffer: (f) => Buffer.from(files[f.replace("Locales/", "")]) };
}

test("the addon's translations: the newer source's rows win; no file or English gives none", () => {
  const rel = fakeReader({ "deDE.lua": 'L["Bags"] = "Beutel"\nL["Chat"] = "Chat"\n' });
  const next = fakeReader({ "deDE.lua": 'L["Bags"] = "Taschen"\n' });
  const t = addonTranslations([rel, next], "deDE");
  assert.equal(t.get("Bags"), "Taschen");
  assert.equal(t.get("Chat"), "Chat");
  assert.equal(addonTranslations([rel, next], "frFR").size, 0);
  assert.equal(addonTranslations([rel], "enUS").size, 0);
});

test("internal links move into the language's folder; assets, fonts and the API stay", () => {
  const de = siteLocale(LOCALES.find((l) => l.code === "de"));
  const html = '<a href="/settings/#x"></a><a href="/"></a><img src="/assets/a.webp"><a href="/assets/shots/b.webp"></a><a href="/fonts/f.ttf"></a><a href="/api/feedback"></a><a href="https://ko-fi.com/x"></a><a href="#top"></a>';
  assert.equal(localiseLinks(html, de), '<a href="/de/settings/#x"></a><a href="/de/"></a><img src="/assets/a.webp"><a href="/assets/shots/b.webp"></a><a href="/fonts/f.ttf"></a><a href="/api/feedback"></a><a href="https://ko-fi.com/x"></a><a href="#top"></a>');
  assert.equal(localiseLinks(html, siteLocale()), html);
});

// ------------------------------------------------------------------ the addon's words on the pages

const relTag = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8")).current;
const relReader = gitReader(cfg.sourcePath, relTag);
const nextReader = gitReader(cfg.sourcePath, cfg.sourceRef);
const model = buildModel({ rel: extractAddon(relReader), next: extractAddon(nextReader), release: { tag: relTag }, releases: { releases: [] } });
const read = { rel: specReader(relReader), next: specReader(nextReader) };
const DE = LOCALES.find((l) => l.code === "de");

test("Settings shows the addon's translation of a caption, page title and choice, English where it has none", () => {
  const p = model.pages.find((x) => x.rows.some((r) => r.kind === "cycle" && r.choices?.length));
  const row = p.rows.find((r) => r.kind === "cycle" && r.choices?.length);
  const other = p.rows.find((r) => r.kind === "check" && r.caption !== row.caption);
  const t = new Map([[p.title, "TEST-ONLY Seite"], [row.caption, "TEST-ONLY Zeile"], [row.choices[0][1], "TEST-ONLY Wahl"]]);
  const html = settingsPage(model, read, siteLocale(DE, t)).body;
  assert.ok(html.includes(`<h2 id="${p.id}">TEST-ONLY Seite</h2>`), "the page title, its id still the English one");
  assert.ok(html.includes(">TEST-ONLY Zeile"), "the caption");
  assert.ok(html.includes("TEST-ONLY Wahl"), "the choice");
  assert.ok(html.includes(`>${other.caption.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}`), "an untranslated caption stays English");
  assert.ok(html.includes("TEST-ONLY Zeile") && /data-search="[^"]*TEST-ONLY Zeile/.test(html), "the search matches the translation");
});

test("Settings translates a caption written with {slots} by its game key, and shows its slots as <slot>", () => {
  const row = model.pages.flatMap((p) => p.rows).find((r) => r.key && r.key.includes("{n}"));
  assert.ok(row, "the addon has a caption with a {n} slot");
  const html = settingsPage(model, read, siteLocale(DE, new Map([[row.key, row.key.replace("{n}", "{n} TEST-ONLY")]]))).body;
  const shown = `${row.caption.replace("<n>", "&lt;n&gt; TEST-ONLY")}`;
  assert.ok(html.includes(`>${shown}`), `the caption “${shown}”`);
  assert.ok(new RegExp(`data-search="[^"]*${shown}`).test(html), "the search matches it too");
});

test("{ui:Text} in a prose line is the addon's own words, in English where it has none", () => {
  const t = new Map([["Reload now", "TEST-ONLY Neu laden"]]);
  const line = "Click <strong>{ui:Reload now}</strong> or <strong>{ui:Run setup}</strong> in {ui:General} → {ui:Layout} & {name}.";
  assert.equal(siteLocale(DE, t).p(line, { name: "x" }), "Click <strong>TEST-ONLY Neu laden</strong> or <strong>Run setup</strong> in General → Layout & x.");
  assert.equal(siteLocale().p(line, { name: "x" }), "Click <strong>Reload now</strong> or <strong>Run setup</strong> in General → Layout & x.");
  const own = siteLocale(DE, new Map([["Reload now", "A & <B>"]]));
  assert.equal(own.p("{ui:Reload now}"), "A &amp; &lt;B&gt;", "the addon's words are HTML-safe");
  const prose = new Map([["{ui:Reload now} please", "Bitte {ui:Reload now}"]]);
  assert.equal(siteLocale(DE, t, prose).p("{ui:Reload now} please"), "Bitte TEST-ONLY Neu laden", "a translation keeps the token and gets the addon's words");
});

test("a prose translation keeps every {ui:Text} of its English line", () => {
  assert.deepEqual(proseProblems("Click {ui:Reload now}.", "Klick {ui:Reload now}.", "de", words), []);
  assert.match(proseProblems("Click {ui:Reload now}.", "Klick „Neu laden“.", "de", words).join(), /slots\} differ/);
});

// The addon's own words, as the Locales files hold them: every English text the addon translates.
const addonKeys = [...addonTranslations([relReader, nextReader], "deDE").keys()];

test("prose never types a button, switch, message or page name the addon has; it uses {ui:Text}", () => {
  const typed = [];
  const literal = (key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const line of used.keys()) {
    for (const m of line.matchAll(/<strong>([^<{]+)<\/strong>|“([^”{]+)”|\\?"([^"{<\\]+)\\?"/g)) {
      const quoted = (m[1] || m[2] || m[3]).trim();
      if (/ /.test(quoted) && addonKeys.includes(quoted)) typed.push(`“${quoted}” in: ${line.slice(0, 80)}`);
    }
    const bare = line.replace(/\{ui:[^}]+\}/g, "");
    for (const key of addonKeys) {
      if (key.length < 3 || !(bare.includes(`${key} → `) || bare.includes(` → ${key}`))) continue;
      if (new RegExp(`(^|[^\\p{L}])${literal(key)} → |(^|[^\\p{L}]) → ${literal(key)}([^\\p{L}]|$)`, "u").test(bare)) typed.push(`${key} → in: ${line.slice(0, 80)}`);
    }
  }
  assert.deepEqual(typed, []);
});

test("the addon's words used in {ui:Text} need no HTML escaping", () => {
  const tokens = new Set([...used.keys()].flatMap((k) => [...k.matchAll(/\{ui:([^}]+)\}/g)].map((m) => m[1])));
  assert.ok(tokens.size > 10);
  for (const l of LOCALES) {
    const tr = addonTranslations([relReader, nextReader], l.addon);
    for (const token of tokens) assert.ok(!/[&<>"]/.test(tr.get(token) ?? token), `${l.code}: ${token}`);
  }
});

test("Commands shows the addon's translation of a help line, with the command typed as in English", () => {
  const e = model.commands.entries.find((x) => x.relLines?.length && !x.changed && x.relLines[0].text);
  const l = e.relLines[0];
  const t = new Map([[l.line, `${l.syntax}  TEST-ONLY Hilfe`]]);
  const html = commandsPage(model, siteLocale(DE, t)).body;
  assert.ok(html.includes(`/vg ${l.syntax.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span><br>TEST-ONLY Hilfe`), "the help text, after the English syntax");
});

test("Troubleshooting quotes the addon's translation of a message and a button name, English where it has none", () => {
  const t = new Map([["Setup opens when combat ends.", "TEST-ONLY Kampf"], ["Run setup", "TEST-ONLY Einrichten"]]);
  const html = helpPage(model, read, siteLocale(DE, t)).body;
  assert.ok(html.includes("„TEST-ONLY Kampf“"), "the quoted message, in the language's quotation marks");
  assert.ok(html.includes("<strong>TEST-ONLY Einrichten</strong>"), "the button's name");
  assert.ok(html.includes("„<span lang=\"en\">Unlocked: drag the handles. /vg lock when done.</span>“"), "an untranslated message stays English, marked lang=en");
  assert.ok(html.includes("„TEST-ONLY Kampf“") && !html.includes("<span lang=\"en\">TEST-ONLY"), "a translated message is not marked");
  assert.ok(/„<span lang="en">Turn any module off under Modules to keep the default one\.<\/span>“/.test(html), "a README sentence is never translated, so it is marked");
  assert.ok(!helpPage(model, read, siteLocale()).body.includes("lang=\"en\""), "an English page marks nothing");
  assert.ok(html.includes(DE.pages.help.entries.setup.q), "the German question");
});

test("Troubleshooting quotes a message with values by its Locales key, the values shown as <name>", () => {
  const t = new Map([
    ["This character will use profile {profile} after the reload.", "TEST-ONLY Profil {profile}"],
    ["Profile {profile} uses Edit Mode layout {layout}, which this account doesn't have.", "TEST-ONLY {layout} fehlt für {profile}"],
    ["{count} errors caught this session: click to list them", "TEST-ONLY {count} Fehler"],
    ["opens the errors Vanguard caught this session, with stacks and counts, in the copy window (for a bug report); clear empties the list", "TEST-ONLY Fehlerliste"],
  ]);
  const html = helpPage(model, read, siteLocale(DE, t)).body;
  assert.ok(html.includes("„TEST-ONLY Profil &lt;name&gt;“"), "the profile switch message");
  assert.ok(html.includes("„TEST-ONLY &lt;layout&gt; fehlt für &lt;name&gt;“"), "slots by their place in the English text, not the translation's");
  assert.ok(html.includes("„TEST-ONLY &lt;n&gt; Fehler“"), "the footer line");
  assert.ok(html.includes("„TEST-ONLY Fehlerliste“"), "the /vg errors help line");
  const english = helpPage(model, read, siteLocale()).body;
  assert.ok(english.includes("“&lt;n&gt; errors caught this session: click to list them”"), "English keeps the whole footer line");
  assert.ok(english.includes("“This character will use profile &lt;name&gt; after the reload.”"), "English keeps <name>");
});

test("every language's Troubleshooting page shows the entries English shows", () => {
  const ids = (h) => [...h.matchAll(/<section class="card help-entry" id="([^"]+)"/g)].map((m) => m[1]);
  const en = ids(helpPage(model, read).body);
  assert.ok(en.length > 10);
  for (const l of LOCALES) assert.deepEqual(ids(helpPage(model, read, siteLocale(l)).body), en, l.code);
});

test("Support speaks the language and keeps its Ko-fi link", () => {
  const de = supportPage(siteLocale(DE)).body;
  const en = supportPage().body;
  assert.ok(de.includes(DE.pages.support.paysTitle) && !de.includes(SUPPORT_PAGE.paysTitle));
  assert.deepEqual(de.match(/href="[^"]+"/g), en.match(/href="[^"]+"/g));
});

// ------------------------------------------------------------------ /vg commands stay as typed

const words = commandWords(nextReader.read("Core/Slash.lua"));

test("a command is read with its own words, placeholders and groups, and stops at prose", () => {
  assert.deepEqual(commandsIn("Type /vg move, then /vg reset <frame|all> and /vg opens the window.", words), ["/vg", "/vg move", "/vg reset <frame|all>"]);
  assert.deepEqual(commandsIn("<code>/vg profile new &lt;name&gt;</code>", words), ["/vg profile new <name>"]);
  assert.notDeepEqual(commandsIn("/vg zurücksetzen <Rahmen|jeden>", words), commandsIn("/vg reset <frame|all>", words));
});

test("a menu path shows /vg as a command, apart from the translated page names; attributes keep theirs", () => {
  assert.equal(menuPaths('<p data-search="/vg → Módulos">Bajo <strong>/vg → Módulos</strong>.</p>'), '<p data-search="/vg → Módulos">Bajo <strong><code>/vg</code> → Módulos</strong>.</p>');
});

// Every translated text in a language with the English it translates: site strings (each plural
// form), Troubleshooting and Support texts, and the page prose.
function translatedPairs(loc) {
  const strings = Object.entries(ENGLISH_STRINGS).flatMap(([k, en]) => forms(loc.strings[k]).map((t) => [k, forms(en)[0], t]));
  const own = new Map(pageTexts(loc.pages));
  const pages = pageTexts(ENGLISH_PAGES).map(([k, en]) => [k, en, own.get(k)]);
  const prose = [...proseOf(loc.code)].flatMap(([en, t]) => forms(t).map((f) => [en, en, f]));
  return [...strings, ...pages, ...prose];
}

for (const loc of LOCALES) {
  test(`${loc.code} types every /vg command as English does`, () => {
    for (const [key, en, t] of translatedPairs(loc)) assert.deepEqual(commandsIn(t, words), commandsIn(en, words), `${key}: “${t}”`);
  });
}

// Every page line the build looked up (.cache/prose.json), translated in each published language,
// keeping its slots, tags and commands; a translation no page uses any more is removed.
const used = new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(cfg.cacheDir, "prose.json"), "utf8"))));

for (const loc of publishedLocales(cfg.locales).slice(1)) {
  test(`${loc.code} translates every page line, keeping its slots, tags and commands`, () => {
    const own = proseOf(loc.code);
    assert.deepEqual([...used.keys()].filter((k) => !own.has(k)), [], "untranslated (node scripts/prose.mjs lists them)");
    assert.deepEqual([...own.keys()].filter((k) => !used.has(k)), [], "no page uses these any more");
    for (const [k, t] of own) assert.deepEqual(proseProblems(used.get(k), t, loc.lang, words), [], k);
  });
}

// ------------------------------------------------------------------ the addon's unreviewed drafts (previews)

test("a CSV's quoted fields keep their commas, quotes and line breaks", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi""\nnow"\r\nlast,\n'), [["a", "b"], ["x, y", 'say "hi"\nnow'], ["last", ""]]);
  assert.deepEqual(parseCsv("no,newline"), [["no", "newline"]]);
});

test("a draft CSV gives its filled translations, by English key", () => {
  const t = parseDraftCsv("\uFEFFkey,english,translation,context,note\nBags,Bags,Taschen,Core/X.lua:1,machine\nChat,Chat,,Core/X.lua:2,\n");
  assert.deepEqual([...t], [["Bags", "Taschen"]]);
  assert.equal(parseDraftCsv("").size, 0);
});

test("SITE_ADDON_DRAFTS lays a locale's draft under the addon's own rows, which win", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vg-drafts-"));
  fs.writeFileSync(path.join(dir, "deDE.csv"), "key,english,translation,context,note\nBags,Bags,Beutel (draft),x,machine\nChat,Chat,Plaudern (draft),x,machine\n");
  const reader = fakeReader({ "deDE.lua": 'L["Bags"] = "Taschen"\n' });
  const t = addonTranslations([reader], "deDE", dir);
  assert.equal(t.get("Bags"), "Taschen", "a reviewed row in Locales/ wins");
  assert.equal(t.get("Chat"), "Plaudern (draft)", "the draft fills the gap");
  assert.equal(addonTranslations([reader], "frFR", dir).size, 0, "no draft for that locale");
  assert.equal(addonTranslations([reader], "deDE").get("Chat"), undefined, "no drafts without the folder");
  fs.rmSync(dir, { recursive: true, force: true });
});

// ------------------------------------------------------------------ a build in every language

const out = fs.mkdtempSync(path.join(os.tmpdir(), "vg-site-i18n-"));
execFileSync(process.execPath, [path.join(root, "scripts/build.mjs")], { env: { ...process.env, SITE_LOCALES: "all", SITE_OUT: out }, stdio: ["ignore", "ignore", "inherit"] });
process.on("exit", () => fs.rmSync(out, { recursive: true, force: true }));
const html = (dir, p) => fs.readFileSync(path.join(out, dir, p, "index.html"), "utf8");
const ALL = [ENGLISH, ...LOCALES];
const base = cfg.siteUrl.replace(/\/+$/, "");
const folder = (l) => (l === ENGLISH ? "" : l.code);

// Visible text of some HTML: tags dropped, entities decoded, whitespace collapsed.
function text(h) {
  return h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

// A page without its language switchers: their names are each in its own language.
function noSwitchers(h) {
  return h.replace(/<div class="nav-lang">[\s\S]*?<\/div>/, "").replace(/<details class="lang-menu"[\s\S]*?<\/details>/, "");
}

// A page without its <main> and its language switchers: the shell the language owns.
function shell(h) {
  return noSwitchers(h).replace(/<main[\s\S]*<\/main>/, "").replace(/<head>[\s\S]*<\/head>/, "");
}

// True when the text holds the phrase as whole words.
function hasPhrase(t, phrase) {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}])${esc}([^\\p{L}]|$)`, "u").test(t);
}

test("every language has every page and its own 404", () => {
  for (const l of ALL) {
    for (const n of NAV) assert.ok(fs.existsSync(path.join(out, folder(l), n.path, "index.html")), `/${folder(l)}${n.path}`);
    assert.ok(fs.existsSync(path.join(out, folder(l), "404.html")), `${l.code} 404.html`);
  }
});

test("every page says its language and links every language's copy, plus x-default", () => {
  for (const l of ALL) {
    for (const n of NAV) {
      const h = html(folder(l), n.path);
      assert.ok(h.includes(`<html lang="${l.lang}">`), `/${folder(l)}${n.path} lang`);
      for (const a of ALL) assert.ok(h.includes(`<link rel="alternate" hreflang="${a.lang}" href="${base}${a === ENGLISH ? "" : `/${a.code}`}${n.path}">`), `/${folder(l)}${n.path} hreflang ${a.lang}`);
      assert.ok(h.includes(`<link rel="alternate" hreflang="x-default" href="${base}${n.path}">`), `/${folder(l)}${n.path} x-default`);
      assert.ok(h.includes(`<link rel="canonical" href="${base}${l === ENGLISH ? "" : `/${l.code}`}${n.path}">`), `/${folder(l)}${n.path} canonical`);
    }
  }
});

test("the sitemap lists every page in every language", () => {
  const xml = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
  const paths = [...NAV.map((n) => n.path), ...AREAS.map(([a]) => `/features/${a.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`)];
  for (const l of ALL) for (const p of paths) assert.ok(xml.includes(`<loc>${base}${l === ENGLISH ? "" : `/${l.code}`}${p}</loc>`), `${l.code} ${p}`);
  assert.equal((xml.match(/<url>/g) || []).length, ALL.length * paths.length);
});

test("the language switcher sits at the sidebar's foot, with this page in every language", () => {
  for (const l of ALL) {
    const h = html(folder(l), "/settings/");
    const nav = h.slice(h.indexOf('<nav class="nav sidebar"'), h.indexOf("</nav>"));
    assert.ok(nav.includes('<select id="lang-select" data-lang-switch autocomplete="off">'), `${l.code} switcher in the sidebar, not restored by the browser after Back`);
    for (const a of ALL) assert.ok(nav.includes(`<option value="${a === ENGLISH ? "" : `/${a.code}`}/settings/" lang="${a.lang}"`), `${l.code} option ${a.code}`);
    assert.ok(nav.includes(`lang="${l.lang}" data-offer="${l.strings["lang.offer"]}"`), `${l.code} offer line`);
    assert.ok(new RegExp(`<option [^>]*lang="${l.lang}"[^>]* selected>`).test(nav), `${l.code} is selected`);
  }
});

test("the sidebar landmark and the link-preview image description are in the page's language", () => {
  for (const l of ALL) {
    const h = html(folder(l), "/settings/");
    assert.ok(h.includes(`<nav class="nav sidebar" aria-label="${l.strings["nav.label"]}" id="site-nav">`), `${l.code} nav label`);
    assert.ok(h.includes(`<meta property="og:image:alt" content="${l.strings["social.imageAlt"].replace(/&/g, "&amp;")}">`), `${l.code} og:image:alt`);
    if (l === ENGLISH) continue;
    assert.notEqual(l.strings["nav.label"], ENGLISH_STRINGS["nav.label"], `${l.code} nav label is translated`);
    assert.notEqual(l.strings["social.imageAlt"], ENGLISH_STRINGS["social.imageAlt"], `${l.code} image description is translated`);
  }
});

test("the header's language button names this language and opens this page in every language", () => {
  for (const l of ALL) {
    const h = html(folder(l), "/settings/");
    const header = h.slice(h.indexOf('<header class="site-header">'), h.indexOf("</header>"));
    const menu = (header.match(/<details class="lang-menu" data-lang-menu>[\s\S]*?<\/details>/) || [""])[0];
    const label = `${siteLocale(l).t("lang.label")}: ${l.name}`;
    assert.ok(menu.includes(`<summary aria-label="${label}" title="${label}">`), `${l.code} button label`);
    assert.ok(menu.includes(`<span class="lang-code" aria-hidden="true">${l.code.split("-")[0].toUpperCase()}</span>`), `${l.code} button code`);
    for (const a of ALL) assert.ok(menu.includes(`<a href="${a === ENGLISH ? "" : `/${a.code}`}/settings/" lang="${a.lang}" hreflang="${a.lang}"`), `${l.code} link ${a.code}`);
    assert.equal((menu.match(/aria-current="true"/g) || []).length, 1, `${l.code} one current`);
    assert.ok(new RegExp(`lang="${l.lang}" hreflang="${l.lang}" aria-current="true"`).test(menu), `${l.code} is current`);
  }
});

test("a language's sidebar, header and footer are in that language, with no English left", () => {
  const phrases = (l) => Object.keys(ENGLISH_STRINGS)
    .filter((k) => /^(nav\.|group\.|skip$|menu$|nextSwitch$|supportButton$|footer\.)/.test(k))
    .map((k) => [k, text(siteLocale(ENGLISH).t(k)).split(/\{\w+\}/)[0].trim(), text(siteLocale(l).t(k))])
    .filter(([, en, own]) => en.length > 3 && !hasPhrase(own, en));
  for (const l of LOCALES) {
    for (const n of NAV) {
      const t = text(shell(html(l.code, n.path)));
      for (const [k, en] of phrases(l)) assert.ok(!hasPhrase(t, en), `/${l.code}${n.path}: English “${en}” (${k}) in the shell`);
      for (const m of NAV) assert.ok(t.includes(text(siteLocale(l).t(`nav.${m.path}`))), `/${l.code}${n.path}: nav label for ${m.path}`);
    }
  }
});

test("every page names its Open Graph locale after its html lang", () => {
  for (const l of ALL) {
    const want = l === ENGLISH ? "en_US" : l.lang.replace("-", "_");
    assert.ok(html(folder(l), "/").includes(`<meta property="og:locale" content="${want}">`), `${l.code} og:locale`);
  }
});

test("the Settings counts line ends with the language's full stop", () => {
  for (const l of ALL) {
    const counts = text(html(folder(l), "/settings/").match(/<p class="counts">([\s\S]*?)<\/p>/)[1]);
    const chinese = l.code.startsWith("zh-");
    assert.ok(counts.endsWith(chinese ? "。" : "."), `${l.code}: “${counts.slice(-12)}”`);
    assert.ok(!chinese || !counts.endsWith("."), `${l.code} has no ASCII full stop`);
  }
});

test("the Feedback form carries a translation of each message the Function can answer with", () => {
  for (const l of LOCALES) {
    const m = html(l.code, "/feedback/").match(/<script type="application\/json" id="fb-messages">([\s\S]*?)<\/script>/);
    const own = JSON.parse(m[1]);
    for (const [code, english] of Object.entries(MESSAGES)) {
      if (code === "invalid") continue;
      assert.ok(own[english] && own[english] !== english, `${l.code}: ${code} translated`);
    }
  }
});

test("a Choice row's Default is one of its Values, in the page's language", () => {
  let checked = 0;
  for (const l of ALL) {
    const own = siteLocale(l);
    const cell = (row, key) => ((row.match(new RegExp(`<td data-label="${own.t(key)}">([\\s\\S]*?)</td>`)) || [])[1] || "");
    for (const row of html(folder(l), "/settings/").match(/<tr class="opt-row opt-item"[\s\S]*?<\/tr>/g)) {
      if (!row.includes(`class="opt-kind">${own.t("kind.cycle")}</span>`)) continue;
      const values = text(cell(row, "set.col.values")).split(" / ");
      const shown = text(cell(row, "set.col.default").replace(/<span[\s\S]*$/, ""));
      if (!shown) continue;
      checked++;
      assert.ok(values.includes(shown), `${l.code}: Default “${shown}” is not among “${values.join(" / ")}”`);
    }
  }
  assert.ok(checked > 100, `only ${checked} Choice rows with a default`);
});

test("every page is translated: no main or Features card list is marked lang=en", () => {
  for (const l of LOCALES) {
    for (const n of NAV) assert.ok(!/<main id="main" tabindex="-1" lang="en">/.test(html(l.code, n.path)), `/${l.code}${n.path} main lang=en`);
    assert.ok(html(l.code, "/features/").includes('<div id="mod-list" class="dis-grid">'), `/${l.code}/features/ cards in the language`);
  }
});

test("no English site string is left on a translated Settings or Commands page", () => {
  // The site's own phrases on each page (the addon's words, in English until translated, aside).
  const own = { "/settings/": /^(set\.|kind\.|badge\.|source)/, "/commands/": /^(cmd\.|badge\.|glance\.|source)/ };
  const keys = (re) => Object.keys(ENGLISH_STRINGS).filter((k) => re.test(k) && typeof ENGLISH_STRINGS[k] === "string" && !placeholders(ENGLISH_STRINGS[k]).length && / /.test(ENGLISH_STRINGS[k]));
  for (const l of LOCALES) {
    for (const [p, re] of Object.entries(own)) {
      const t = text(html(l.code, p).match(/<main[\s\S]*<\/main>/)[0]);
      for (const k of keys(re)) {
        const en = text(siteLocale(ENGLISH).t(k));
        if (hasPhrase(text(siteLocale(l).t(k)), en)) continue;
        assert.ok(!hasPhrase(t, en), `/${l.code}${p}: English “${en}” (${k})`);
      }
    }
  }
});

test("no English question or section title is left on a translated Troubleshooting page", () => {
  for (const l of LOCALES) {
    const headings = [...html(l.code, "/help/").matchAll(/<h[23] id="[^"]+">([^<]+)<\/h[23]>/g)].map((m) => text(m[1]));
    assert.ok(headings.length > 10, l.code);
    const english = [...Object.values(ENGLISH_HELP.entries).map((e) => e.q), ...Object.values(ENGLISH_HELP.sections), ENGLISH_HELP.page.knownTitle];
    for (const h of headings) assert.ok(!english.includes(h), `/${l.code}/help/: “${h}”`);
  }
});

test("the Commands groups are named in the page's language", () => {
  for (const l of LOCALES) {
    const names = [...html(l.code, "/commands/").matchAll(/class="group-toggle" aria-expanded="false">([^<]+)</g)].map((m) => m[1]);
    const own = Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith("area.")).map((k) => siteLocale(l).t(k));
    assert.ok(names.length > 1, l.code);
    for (const n of names) assert.ok(own.includes(n), `${l.code}: group “${n}”`);
  }
});

test("links on a language's pages stay in its folder", () => {
  for (const l of LOCALES) {
    for (const n of NAV) {
      const h = noSwitchers(html(l.code, n.path));
      const stray = [...h.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith(`/${l.code}/`) && !/^\/(assets|fonts|api)\//.test(u));
      assert.deepEqual(stray, [], `/${l.code}${n.path}`);
    }
  }
});

test("a non-English page carries every string site.js needs; an English page none", () => {
  const jsKeys = Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith("js.")).map((k) => k.slice(3)).sort();
  for (const l of LOCALES) {
    const m = html(l.code, "/settings/").match(/<script type="application\/json" id="vg-strings">([\s\S]*?)<\/script>/);
    assert.ok(m, `${l.code} strings`);
    assert.deepEqual(Object.keys(JSON.parse(m[1])).sort(), jsKeys, l.code);
  }
  assert.ok(!html("", "/settings/").includes('id="vg-strings"'));
});

test("the not-found page speaks each language and links that language's home", () => {
  for (const l of LOCALES) {
    const h = fs.readFileSync(path.join(out, l.code, "404.html"), "utf8");
    assert.ok(h.includes(`<h1 class="page-title">${siteLocale(l).t("notFound.title")}</h1>`), l.code);
    assert.ok(h.includes(`<a href="/${l.code}/">${siteLocale(l).t("notFound.home")}</a>`), `${l.code} home link`);
  }
});

test("the site as published today (no `locales` listed) has no language switcher or hreflang", () => {
  if (cfg.locales.length) return;
  const h = fs.readFileSync(path.join(cfg.outDir, "settings", "index.html"), "utf8");
  assert.ok(!h.includes("hreflang") && !h.includes("lang-select") && !h.includes("lang-menu") && !h.includes("vg-strings"));
  assert.ok(!fs.existsSync(path.join(cfg.outDir, "de")));
});

test("the Home tagline is the addon's Notes line up to its colon, full-width or not, with the language's own full stop", () => {
  const hero = (dir) => html(dir, "/").match(/<p class="hero-tagline">([^<]*)<\/p>/)[1];
  const english = hero("");
  for (const l of LOCALES) {
    const notes = model.next.meta[`Notes-${l.addon}`];
    assert.ok(notes, `${l.code}: the TOC has a Notes line`);
    const cut = notes.search(/[:：]/);
    const stop = notes[cut] === "：" ? "。" : ".";
    assert.equal(hero(l.code).replace(/&#39;/g, "'"), `${notes.slice(0, cut).trim()}${stop}`.replace(/&/g, "&amp;"), l.code);
    assert.notEqual(hero(l.code), english, `${l.code}: not the English tagline`);
  }
});

test("every Feedback area option carries the English name the Function files, in every language", () => {
  const options = (h) => [...h.matchAll(/<option value="([^"]+)" data-en="([^"]*)">/g)].map((m) => [m[1], m[2]]);
  const english = options(html("", "/feedback/"));
  assert.ok(english.length > 10 && english.some(([v]) => v === "RaidFrames"));
  const data = JSON.parse(fs.readFileSync(path.join(out, "site-data.json"), "utf8"));
  const names = new Map(data.modules.map((m) => [m.key, m.name]));
  for (const [value, name] of english) assert.ok(names.get(value) === name || FALLBACK_AREAS.some(([v, l]) => v === value && l === name), `${value}: “${name}”`);
  for (const l of LOCALES) assert.deepEqual(options(html(l.code, "/feedback/")), english, `${l.code}: the same English names as the English page`);
});

test("Getting started names the options pages General, Look and Layout in the addon's words for every language", () => {
  const names = new Map([["General", "TEST-ONLY Allgemein"], ["Look", "TEST-ONLY Aussehen"], ["Layout", "TEST-ONLY Anordnung"]]);
  for (const l of LOCALES) {
    const body = startPage(model, read, siteLocale(l, names)).body.replace(/<[^>]+>/g, "");
    assert.ok(body.includes("TEST-ONLY Allgemein → TEST-ONLY Aussehen"), `${l.code}: General → Look`);
    assert.ok(body.includes("TEST-ONLY Allgemein → TEST-ONLY Anordnung"), `${l.code}: General → Layout`);
    assert.ok(!/General → (Look|Layout)/.test(body), `${l.code}: no English page names`);
  }
});

test("a built Getting started page uses each language's own words for General → Look and General → Layout", () => {
  for (const l of LOCALES) {
    const own = addonTranslations([relReader, nextReader], l.addon);
    const body = text(html(l.code, "/start/").match(/<main[\s\S]*<\/main>/)[0]);
    for (const [name, rest] of [["Look", "Look"], ["Layout", "Layout"]]) {
      const want = `${own.get("General") ?? "General"} → ${own.get(rest) ?? name}`;
      assert.ok(body.includes(want), `${l.code}: “${want}”`);
    }
  }
});
