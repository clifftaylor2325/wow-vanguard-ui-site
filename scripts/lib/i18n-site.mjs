// The site's own words in every language, and the helpers that pick them.
//
// English stays at the site root; each other language gets a folder with the
// same paths below it (/de/settings/). A language is published only when its
// code is in `locales` in site.config.json (SITE_LOCALES overrides it for
// tests and previews): until a native speaker has reviewed its strings, the
// list leaves it out and the live site doesn't change.
//
// Two kinds of words:
//   - the site's own (the sidebar, header, footer, buttons, the Settings,
//     Commands and Features page text around the addon's): STRINGS below, one
//     table per language, every table holding every key (test/i18n.test.mjs).
//   - the addon's (option captions, page titles, help lines, module names):
//     read from the addon's Locales/<locale>.lua at build time, English when a
//     text has no translation, the same fallback as the game.
//
// A string is a template: `code` and **strong** become markup (md()), and
// {name} is filled with the value given, which the caller has made HTML.
// A plural string is an object with one template per plural category of its
// language (Intl.PluralRules), each with {n}.
// The translations below are first drafts, not reviewed (plan D6).
import { md } from "./html.mjs";
import { STRINGS_DE, STRINGS_FR, STRINGS_ES, STRINGS_ES_MX, STRINGS_IT, STRINGS_PT_BR } from "./i18n-strings-latin.mjs";
import { STRINGS_RU, STRINGS_KO, STRINGS_ZH_CN, STRINGS_ZH_TW } from "./i18n-strings-other.mjs";

// The English strings: what the site says today, and every key a language must have.
export const ENGLISH_STRINGS = {
  "skip": "Skip to content",
  "menu": "Menu",
  "nextSwitch": "Show what's coming in the next release",
  "supportButton": "♥ Support",
  "supportLine": "Support Vanguard: {links}",
  "support.Ko-fi": "a one-off tip",
  "footer.about": "Vanguard is an addon for WoW Forever, made by {author}. It is an early release: not everything has been checked in the game yet, and some features are still being polished.",
  "footer.release": "Current release: Vanguard {version} · {curseforge} and {wago} · {copyright}",
  "footer.on": "on {store}",
  "footer.soon": "coming soon on {store}",
  "footer.discord": "Questions, bug reports and ideas: {discord}",
  "lang.label": "Language",
  "lang.offer": "Read this site in English",
  "lang.dismiss": "No thanks",
  "group.Get started": "Get started",
  "group.Learn": "Learn",
  "group.Reference": "Reference",
  "group.Help": "Help",
  "group.About": "About",
  "nav./": "Home",
  "nav./install/": "Install",
  "nav./start/": "Getting started",
  "nav./features/": "Features",
  "nav./screenshots/": "Screenshots",
  "nav./commands/": "Commands",
  "nav./settings/": "Settings",
  "nav./profiles/": "Profiles & sharing",
  "nav./help/": "Troubleshooting",
  "nav./feedback/": "Feedback",
  "nav./changelog/": "Changelog",
  "nav./credits/": "Credits & license",
  "nav./support/": "Support",
  "title./": "Vanguard: All-in-One UI Addon for WoW Forever",
  "title./install/": "Install & Update",
  "title./start/": "Getting started",
  "title./features/": "Features",
  "title./screenshots/": "Screenshots",
  "title./commands/": "Commands",
  "title./settings/": "Settings",
  "title./profiles/": "Profiles & sharing",
  "title./help/": "Troubleshooting & FAQ",
  "title./feedback/": "Feedback",
  "title./changelog/": "Changelog",
  "title./credits/": "Credits & license",
  "title./support/": "Support Vanguard",
  "notFound.title": "Page not found",
  "notFound.lede": "Try the {home}.",
  "notFound.home": "home page",
  "badge.next": "Next release",
  "badge.old": "v{version} only",
  "badge.reload": "Needs reload",
  "source": "Source",
  "source.line": "Source: {files} in the Vanguard addon repository.",
  "copy": "Copy",
  "copy.label": "Copy {text}",
  "glance.more": "**{n}** more in the next release",
  "group.moreNext": "{n} next release",
  "area.General": "General",
  "area.Unit frames": "Unit frames",
  "area.Raid and group": "Raid and group",
  "area.Action bars": "Action bars",
  "area.Map and HUD": "Map and HUD",
  "area.Chat": "Chat",
  "area.Items and money": "Items and money",
  "area.Quests": "Quests",
  "area.Comfort and more": "Comfort and more",
  "area.Other": "Other",
  "js.copied": "Copied",
  "js.expand": "Expand all",
  "js.collapse": "Collapse all",
  "js.clear": "Clear search",
  "js.noMatch": "No {noun} match “{q}”.",
  "js.noneShown": "No {noun} to show.",
  "js.spellingOrBoxes": "Check the spelling, or tick the Show boxes above.",
  "js.spellingOrFewer": "Check the spelling, or try fewer words.",
  "js.tickBoxes": "Tick the Show boxes above.",
  "js.count.settings": { one: "{n} setting shown", other: "{n} settings shown" },
  "js.count.commands": { one: "{n} command shown", other: "{n} commands shown" },
  "js.count.modules": { one: "{n} module shown", other: "{n} modules shown" },
  "cmd.description": "Every /vg command with its help text, verbatim from the addon.",
  "cmd.lede": "One chat command, `/vg` (or `/vanguard`), followed by a word. The help text is quoted exactly as the addon prints it with `/vg help`.",
  "cmd.words": { one: "**{n}** command word in v{version}", other: "**{n}** command words in v{version}" },
  "cmd.unknown": "An unknown word prints “{text}”",
  "cmd.search": "Search commands",
  "cmd.placeholder": "for example: reset, profile, errors",
  "cmd.showOld": "Show v{version}-only commands",
  "cmd.caption": "Every command, grouped by the part of Vanguard it needs",
  "cmd.col.command": "Command",
  "cmd.col.what": "What it does",
  "cmd.count": { one: "{n} command", other: "{n} commands" },
  "cmd.nextReads": "In the next release the help line reads:",
  "cmd.opens": "Opens (or closes) the options window.",
  "cmd.also": "Also {list}.",
  "cmd.firstLine": "The help's first line says: “{text}”",
  "cmd.helpPrints": "Prints the list of commands in chat: the help lines quoted on this page.",
  "cmd.needs": "Needs {modules}",
  "set.description": "Every page and setting in the Vanguard options window, with defaults.",
  "set.lede": "Every page of the options window (`/vg`) and every setting on it, with the caption exactly as the addon shows it. Open a page below to see its settings.",
  "set.inRelease": { one: "**{n}** setting in v{version}", other: "**{n}** settings in v{version}" },
  "set.inNext": "**{n}** in the next release",
  "set.pages": { one: "**{n}** page", other: "**{n}** pages" },
  "set.search": "Search settings",
  "set.placeholder": "for example: raid, tooltip, chat",
  "set.showOld": "Show v{version}-only settings",
  "set.col.setting": "Setting",
  "set.col.values": "Values",
  "set.col.default": "Default",
  "set.col.notes": "Notes",
  "kind.check": "Switch",
  "kind.cycle": "Choice",
  "kind.slider": "Slider",
  "kind.button": "Button",
  "kind.visibility": "Visibility",
  "set.on": "On",
  "set.off": "Off",
  "set.range": "{min} to {max}",
  "set.defaultNext": "({value} in the next release)",
  "set.repeatEach": "The rows below repeat for each {variable} from {from} to {to}",
  "set.repeatOf": "The rows below repeat for each of {from} to {to}",
  "set.modulesRow": "Then one switch per module (it applies after a reload): {modules}.",
  "set.moduleNext": "(next release)",
  "set.count": { one: "{n} setting", other: "{n} settings" },
  "set.aboutTitle": "About reloads, defaults and what's not listed",
  "set.aboutReload": "Settings marked {badge} apply after a reload: the window says “{prompt}” and offers **{reloadNow}**. Defaults are shown where the addon's code states one; where it doesn't, none is shown.",
  "set.combatReload": "WoW Forever lets an addon reload only from a click on a secure button, so that's what **{reloadNow}** and the **{reload}** button in Vanguard's reload prompt are. That secure part can't be built during a fight: a {reload} button made in combat gets it when the fight ends. Until then, clicking it doesn't reload; it says “{line}”",
  "set.aboutClients": "Some rows only appear on some clients (for example the Specialization card on the Profiles page needs a client with specializations; the game's own click bindings need a client that has them). Lists that you fill in yourself (your profiles, your chat watch phrases, the bindings grid) aren't listed row by row.",
  "feat.description": "Every Vanguard module: what it does, where its settings are, and its commands.",
  "feat.lede": "Vanguard is built from modules. Each one replaces or adds one piece of the game's interface, and each can be turned off on its own under **/vg → {modules}**.",
  "feat.englishNote": "",
  "feat.inRelease": { one: "**{n}** module in v{version}", other: "**{n}** modules in v{version}" },
  "feat.offBadge": "Off until you switch it on",
  "feat.everyOn": "Every module is on unless marked {badge}",
  "feat.search": "Search modules",
  "feat.placeholder": "Search modules, for example: raid, bags, cast bar",
};

// The languages the site can be built in besides English: the folder each is
// under, its HTML lang (also its hreflang), the addon locale whose Locales/
// file translates the addon's words, its own name, and its strings.
export const LOCALES = [
  { code: "de", lang: "de", addon: "deDE", name: "Deutsch", strings: STRINGS_DE },
  { code: "fr", lang: "fr", addon: "frFR", name: "Français", strings: STRINGS_FR },
  { code: "es", lang: "es", addon: "esES", name: "Español (España)", strings: STRINGS_ES },
  { code: "es-mx", lang: "es-MX", addon: "esMX", name: "Español (México)", strings: STRINGS_ES_MX },
  { code: "it", lang: "it", addon: "itIT", name: "Italiano", strings: STRINGS_IT },
  { code: "pt-br", lang: "pt-BR", addon: "ptBR", name: "Português (Brasil)", strings: STRINGS_PT_BR },
  { code: "ru", lang: "ru", addon: "ruRU", name: "Русский", strings: STRINGS_RU },
  { code: "ko", lang: "ko", addon: "koKR", name: "한국어", strings: STRINGS_KO },
  { code: "zh-cn", lang: "zh-CN", addon: "zhCN", name: "简体中文", strings: STRINGS_ZH_CN },
  { code: "zh-tw", lang: "zh-TW", addon: "zhTW", name: "繁體中文", strings: STRINGS_ZH_TW },
];

// English, at the site root.
export const ENGLISH = { code: "en", lang: "en", addon: "enUS", name: "English", strings: ENGLISH_STRINGS };

// The languages a build publishes: English, then each listed code in LOCALES
// order. An unknown code is an error, so a typo can't silently drop a language.
export function publishedLocales(codes = []) {
  const unknown = codes.filter((c) => !LOCALES.some((l) => l.code === c));
  if (unknown.length) throw new Error(`unknown site locale(s): ${unknown.join(", ")} (known: ${LOCALES.map((l) => l.code).join(", ")})`);
  return [ENGLISH, ...LOCALES.filter((l) => codes.includes(l.code))];
}

// ------------------------------------------------------------------ the addon's own words

// The text of a quoted Lua string literal (the escapes the addon's locale files use).
function luaUnquote(quoted) {
  const escapes = { n: "\n", t: "\t", "\\": "\\", '"': '"', "'": "'" };
  return quoted.slice(1, -1).replace(/\\(.)/g, (_, c) => escapes[c] ?? c);
}

// One translation line of a locale file: L["English"] = "Translation".
const ENTRY = /^L\[("(?:[^"\\\n]|\\.)*")\]\s*=\s*("(?:[^"\\\n]|\\.)*")\s*$/;

// The translations in one locale file's Lua text: Map English -> translation.
export function parseLocaleLua(text) {
  const entries = new Map();
  for (const line of String(text || "").split(/\r?\n/)) {
    const m = line.trim().match(ENTRY);
    if (m) entries.set(luaUnquote(m[1]), luaUnquote(m[2]));
  }
  return entries;
}

// The addon's translations for one locale, from each reader's Locales/<addon>.lua
// (the current release first, then the newer source, whose rows win). Empty for English.
export function addonTranslations(readers, addonLocale) {
  const out = new Map();
  if (addonLocale === ENGLISH.addon) return out;
  const file = `Locales/${addonLocale}.lua`;
  for (const reader of readers) {
    if (!reader.list("Locales").includes(`${addonLocale}.lua`)) continue;
    for (const [k, v] of parseLocaleLua(reader.readBuffer(file).toString("utf8"))) out.set(k, v);
  }
  return out;
}

// ------------------------------------------------------------------ the page context

// A template with each {name} replaced by values[name] (a name values lacks stays as written).
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (all, name) => (values[name] !== undefined ? String(values[name]) : all));
}

// "a", "a and b", "a, b and c": the site's English list, without a serial comma.
function englishList(items) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// The page context every localised generator takes: which language, its
// folder, and how to say things in it.
//   t(key, values)     the site string as HTML
//   text(key, values)  the site string as plain text (attributes; escape it)
//   n(key, count, v)   the plural site string for count, as HTML
//   addon(text)        the addon's own text in this language, English when untranslated
//   href(path)         a site path in this language's folder
//   list(items)        "a, b and c" in this language
export function siteLocale(locale = ENGLISH, translations = new Map()) {
  const strings = locale.strings;
  const rules = new Intl.PluralRules(locale.lang);
  const raw = (key) => {
    if (!(key in strings)) throw new Error(`site string "${key}" missing for ${locale.code}`);
    return strings[key];
  };
  const prefix = locale === ENGLISH ? "" : `/${locale.code}`;
  const conj = new Intl.ListFormat(locale.lang, { type: "conjunction" });
  return {
    ...locale,
    english: locale === ENGLISH,
    prefix,
    t: (key, values = {}) => fill(md(raw(key)), values),
    text: (key, values = {}) => fill(raw(key), values),
    n: (key, count, values = {}) => {
      const forms = raw(key);
      return fill(md(forms[rules.select(count)] ?? forms.other), { ...values, n: count });
    },
    addon: (text) => translations.get(text) ?? text,
    href: (path) => `${prefix}${path}`,
    list: (items) => (locale === ENGLISH ? englishList(items) : conj.format(items)),
  };
}

// The English context, for generators called without one.
export const EN = siteLocale();

// The strings site.js needs, as a JSON script for a non-English page (English
// pages have none: site.js keeps its English). Plural counts become one
// template per category, picked in the browser with Intl.PluralRules.
export function scriptStrings(loc) {
  if (loc.english) return "";
  const keys = Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith("js."));
  const data = Object.fromEntries(keys.map((k) => [k.slice(3), loc.strings[k]]));
  return `<script type="application/json" id="vg-strings">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n`;
}

// Every internal link in some HTML moved into the language's folder
// (href="/settings/" -> href="/de/settings/"); assets, fonts and the API stay put.
export function localiseLinks(html, loc) {
  if (loc.english) return html;
  return html.replace(/href="\/(?!\/|assets\/|fonts\/|api\/)/g, `href="${loc.prefix}/`);
}

// Every published language's copy of a page: the language with the page's
// site path (href) and full URL (url) in it.
export function alternates(locales, path, base = "") {
  return locales.map((l) => {
    const href = `${l === ENGLISH ? "" : `/${l.code}`}${path}`;
    return { ...l, href, url: `${base}${href}` };
  });
}
