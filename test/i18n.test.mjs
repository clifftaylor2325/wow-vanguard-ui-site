// The site in other languages (scripts/lib/i18n-site.mjs): every language has
// every string, the addon's own translations reach the Settings and Commands
// pages, and a build with every language switched on gives each page its lang,
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
import { NAV } from "../scripts/lib/html.mjs";
import { ENGLISH, ENGLISH_STRINGS, LOCALES, publishedLocales, parseLocaleLua, addonTranslations, siteLocale, localiseLinks } from "../scripts/lib/i18n-site.mjs";
import { gitReader } from "../scripts/lib/source.mjs";
import { extractAddon, specReader } from "../scripts/lib/extract.mjs";
import { buildModel } from "../scripts/lib/model.mjs";
import { settingsPage, commandsPage } from "../scripts/lib/pages-main.mjs";

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

test("English plurals have one and other", () => {
  for (const [key, v] of Object.entries(ENGLISH_STRINGS)) if (typeof v !== "string") assert.deepEqual(Object.keys(v).sort(), ["one", "other"], key);
});

test("the published languages: English first, then the listed codes; an unknown code fails", () => {
  assert.deepEqual(publishedLocales([]), [ENGLISH]);
  assert.deepEqual(publishedLocales(["ru", "de"]).map((l) => l.code), ["en", "de", "ru"]);
  assert.throws(() => publishedLocales(["deDE"]), /unknown site locale/);
  const raw = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));
  assert.ok(Array.isArray(raw.locales), "site.config.json lists `locales` (empty until a language is reviewed)");
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

test("Commands shows the addon's translation of a help line, with the command typed as in English", () => {
  const e = model.commands.entries.find((x) => x.relLines?.length && !x.changed && x.relLines[0].text);
  const l = e.relLines[0];
  const t = new Map([[l.line, `${l.syntax}  TEST-ONLY Hilfe`]]);
  const html = commandsPage(model, siteLocale(DE, t)).body;
  assert.ok(html.includes(`/vg ${l.syntax.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span><br>TEST-ONLY Hilfe`), "the help text, after the English syntax");
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

// A page without its <main> and its language switcher: the shell the language owns.
function shell(h) {
  return h.replace(/<main[\s\S]*<\/main>/, "").replace(/<div class="nav-lang">[\s\S]*?<\/div>/, "").replace(/<head>[\s\S]*<\/head>/, "");
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
  for (const l of ALL) for (const n of NAV) assert.ok(xml.includes(`<loc>${base}${l === ENGLISH ? "" : `/${l.code}`}${n.path}</loc>`), `${l.code} ${n.path}`);
  assert.equal((xml.match(/<url>/g) || []).length, ALL.length * NAV.length);
});

test("the language switcher sits at the sidebar's foot, with this page in every language", () => {
  for (const l of ALL) {
    const h = html(folder(l), "/settings/");
    const nav = h.slice(h.indexOf('<nav class="nav sidebar"'), h.indexOf("</nav>"));
    assert.ok(nav.includes('<select id="lang-select" data-lang-switch>'), `${l.code} switcher in the sidebar`);
    for (const a of ALL) assert.ok(nav.includes(`<option value="${a === ENGLISH ? "" : `/${a.code}`}/settings/" lang="${a.lang}"`), `${l.code} option ${a.code}`);
    assert.ok(nav.includes(`lang="${l.lang}" data-offer="${l.strings["lang.offer"]}"`), `${l.code} offer line`);
    assert.ok(new RegExp(`<option [^>]*lang="${l.lang}"[^>]* selected>`).test(nav), `${l.code} is selected`);
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

test("Settings, Commands and Features are translated; every other page keeps an English body marked lang=en", () => {
  const own = ["/settings/", "/commands/", "/features/"];
  for (const l of LOCALES) {
    for (const n of NAV) {
      const h = html(l.code, n.path);
      const lang = /<main id="main" tabindex="-1" lang="en">/.test(h);
      assert.equal(lang, !own.includes(n.path), `/${l.code}${n.path} main lang=en`);
    }
    assert.ok(html(l.code, "/features/").includes('<div id="mod-list" class="dis-grid" lang="en">'), `/${l.code}/features/ cards marked English`);
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
      const h = html(l.code, n.path).replace(/<div class="nav-lang">[\s\S]*?<\/div>/, "");
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
  assert.ok(!h.includes("hreflang") && !h.includes("lang-select") && !h.includes("vg-strings"));
  assert.ok(!fs.existsSync(path.join(cfg.outDir, "de")));
});
