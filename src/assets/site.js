// Vanguard site: the sidebar drawer, the "show what's coming" switch, list
// filtering (Commands, Settings), collapsed sections, copy buttons and the
// language switchers.
// Everything is in the HTML already; without JS every section and the full
// lists still show.
(function () {
  "use strict";

  var PREF = "vg-show-next";
  var searches = [];
  var small = window.matchMedia ? window.matchMedia("(max-width: 559px)") : { matches: false };

  // The page's own words when it isn't in English: the JSON the build writes
  // into #vg-strings (scripts/lib/i18n-site.mjs). An English page has none.
  function readStrings() {
    var el = document.getElementById("vg-strings");
    try { return el ? JSON.parse(el.textContent) : {}; } catch (e) { return {}; }
  }
  var STRINGS = readStrings();
  var plurals = window.Intl && Intl.PluralRules ? new Intl.PluralRules(document.documentElement.lang || "en") : null;

  // One of the page's strings (the English fallback when it has none), with each {name} filled in.
  function say(key, english, values) {
    var text = STRINGS[key] || english;
    return text.replace(/\{(\w+)\}/g, function (all, name) { return values && values[name] !== undefined ? String(values[name]) : all; });
  }

  // Whether a section marked open by default should be open now: on a phone
  // every section starts folded, so the page fits the screen.
  function openByDefault(el) {
    return el.hasAttribute("data-open") && !small.matches;
  }
  function foldForSmall() {
    if (!small.matches) return;
    var open = document.querySelectorAll("main details[data-open]");
    for (var i = 0; i < open.length; i++) open[i].open = false;
  }

  // Lowercase text of an element's search data.
  function hay(el) {
    return (el.getAttribute("data-search") || el.textContent || "").toLowerCase();
  }

  // Reads one search form: <div class="search" data-target="#list" data-items=".item">.
  function searchState(box) {
    var list = document.querySelector(box.getAttribute("data-target"));
    var itemSel = box.getAttribute("data-items");
    return {
      box: box, list: list, itemSel: itemSel, groupSel: box.getAttribute("data-groups"),
      input: box.querySelector("input[type=search]"), count: box.querySelector(".count"),
      filters: box.querySelectorAll("input[type=checkbox][data-filter]"),
      items: list ? list.querySelectorAll(itemSel) : []
    };
  }

  // Whether an item passes the version boxes (an unticked box hides its data-avail).
  function allowed(filters, el) {
    for (var i = 0; i < filters.length; i++) {
      var f = filters[i];
      if (!f.checked && el.getAttribute("data-avail") === f.getAttribute("data-filter")) return false;
    }
    return true;
  }

  // Shows the items that pass the boxes and hold every word; returns how many
  // real entries (data-count: not headings or notes) are shown.
  function filterItems(s, words) {
    var shown = 0;
    for (var i = 0; i < s.items.length; i++) {
      var text = hay(s.items[i]);
      var ok = allowed(s.filters, s.items[i]) && words.every(function (w) { return text.indexOf(w) >= 0; });
      s.items[i].hidden = !ok;
      if (ok && s.items[i].hasAttribute("data-count")) shown++;
    }
    return shown;
  }

  // Hides each group (a settings page, a command group) with no visible entry
  // left. While words are typed, groups with a match open so it can be seen;
  // when the box is emptied they go back to how they started.
  function hideEmptyGroups(s, searching) {
    var groups = s.list.querySelectorAll(s.groupSel);
    for (var g = 0; g < groups.length; g++) {
      var has = !!groups[g].querySelector(s.itemSel + ":not([hidden]):not(.h)");
      groups[g].hidden = !has;
      setOpen(groups[g], searching ? has : openByDefault(groups[g]));
    }
  }

  // Opens or closes a collapsed group: a <details>, or a table row group with a button.
  function setOpen(group, open) {
    if (group.tagName === "DETAILS") { group.open = open; return; }
    var btn = group.querySelector("button[aria-expanded]");
    group.classList.toggle("collapsed", !open);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // True when any version box is unticked.
  function anyUnticked(filters) {
    for (var i = 0; i < filters.length; i++) if (!filters[i].checked) return true;
    return false;
  }

  // The counter line: "1 setting shown", "12 settings shown". Another language
  // has one form per plural category of its own.
  function countText(box, shown) {
    var one = box.getAttribute("data-noun-one") || "item";
    var many = box.getAttribute("data-noun") || "items";
    var forms = STRINGS["count." + many];
    if (!forms) return shown + " " + (shown === 1 ? one : many) + " shown";
    var form = forms[plurals ? plurals.select(shown) : "other"] || forms.other;
    return form.replace("{n}", String(shown));
  }

  // Makes the message shown under the list when nothing matches (hidden until then).
  function makeEmpty(list) {
    var empty = document.createElement("div");
    empty.className = "notice search-empty";
    empty.hidden = true;
    empty.innerHTML = '<p></p><button class="search-clear" type="button"></button>';
    empty.querySelector("button").textContent = say("clear", "Clear search");
    list.parentNode.insertBefore(empty, list.nextSibling);
    return empty;
  }

  // Fills in or hides the no-match message: what was searched, and what to try.
  function showEmpty(s, shown, query) {
    s.empty.hidden = shown > 0;
    if (shown > 0) return;
    var noun = s.box.getAttribute("data-noun") || "items";
    var what = query ? say("noMatch", "No {noun} match \u201c{q}\u201d.", { noun: noun, q: query }) : say("noneShown", "No {noun} to show.", { noun: noun });
    var boxes = anyUnticked(s.filters);
    var hint = query
      ? (boxes ? say("spellingOrBoxes", "Check the spelling, or tick the Show boxes above.") : say("spellingOrFewer", "Check the spelling, or try fewer words."))
      : (boxes ? say("tickBoxes", "Tick the Show boxes above.") : "");
    // Chinese puts no space after a full stop.
    s.empty.querySelector("p").textContent = what + (hint ? (/[\u3002\uff01\uff1f]$/.test(what) ? "" : " ") + hint : "");
  }

  // Filters the list by the search words and boxes, then updates the counter and the no-match message.
  function apply(s) {
    var query = s.input.value.trim();
    var shown = filterItems(s, query.toLowerCase().split(/\s+/).filter(Boolean));
    if (s.groupSel) hideEmptyGroups(s, query !== "");
    if (s.count) s.count.textContent = countText(s.box, shown);
    showEmpty(s, shown, query);
  }

  // Wires one search form to its list, with a Clear search button in its no-match message.
  function wireSearch(box) {
    var s = searchState(box);
    if (!s.input || !s.list) return;
    s.empty = makeEmpty(s.list);
    var run = function () { apply(s); };
    s.input.addEventListener("input", run);
    for (var i = 0; i < s.filters.length; i++) s.filters[i].addEventListener("change", run);
    s.empty.querySelector("button").addEventListener("click", function () { s.input.value = ""; run(); s.input.focus(); });
    searches.push(s);
    run();
  }

  // The "show what's coming in the next release" switch: one choice for the
  // whole site, kept in the browser. It drives the sidebar switch, the version
  // box in each search form, and everything marked data-avail="next".
  function prefOn() {
    try { return localStorage.getItem(PREF) === "1"; } catch (e) { return false; }
  }
  function prefBoxes() {
    return document.querySelectorAll('input[data-pref="next"], input[data-filter="next"]');
  }
  function setPref(on) {
    try { localStorage.setItem(PREF, on ? "1" : "0"); } catch (e) { /* kept for this page only */ }
    document.documentElement.classList.toggle("show-next", on);
    var boxes = prefBoxes();
    for (var i = 0; i < boxes.length; i++) boxes[i].checked = on;
    for (var j = 0; j < searches.length; j++) apply(searches[j]);
  }
  function wirePref() {
    var on = prefOn();
    document.documentElement.classList.toggle("show-next", on);
    var boxes = prefBoxes();
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].checked = on;
      boxes[i].addEventListener("change", function (e) { setPref(e.target.checked); });
    }
  }

  // Opens every collapsed section around the element a link points to, so a
  // deep link (/settings/#general, /features/#raid-frames) lands on it.
  function openForHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var el;
    try { el = document.getElementById(decodeURIComponent(id)); } catch (e) { el = null; }
    if (!el) return;
    for (var d = el.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
    var group = el.closest("tbody");
    if (group && group.classList.contains("collapsed")) setOpen(group, true);
    var inner = el.querySelector && el.querySelector("details");
    if (inner && el.matches(".mod, .help-entry")) inner.open = true;
    el.scrollIntoView({ block: "start" });
  }

  // The folded sections of the page (nested ones too), for Expand all and printing.
  function sections() {
    return document.querySelectorAll("main details.disclosure");
  }

  // Expand all / Collapse all, in the corner of an inner page's title block, on
  // pages with two or more folded sections. It reads "Collapse all" once every
  // section is open, however they got there.
  function wireExpandAll() {
    var hero = document.querySelector("main .page-hero");
    var all = sections();
    if (!hero || all.length < 2) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "expand-all";
    var allOpen = function () { for (var i = 0; i < all.length; i++) if (!all[i].open) return false; return true; };
    var label = function () { btn.textContent = allOpen() ? say("collapse", "Collapse all") : say("expand", "Expand all"); };
    btn.addEventListener("click", function () {
      var open = !allOpen();
      for (var i = 0; i < all.length; i++) all[i].open = open;
      label();
    });
    for (var i = 0; i < all.length; i++) all[i].addEventListener("toggle", label);
    label();
    hero.appendChild(btn);
  }

  // Printing shows every folded section, then puts them back as they were.
  function wirePrint() {
    var was = [];
    window.addEventListener("beforeprint", function () {
      var all = sections();
      was = [];
      for (var i = 0; i < all.length; i++) { was.push(all[i].open); all[i].open = true; }
    });
    window.addEventListener("afterprint", function () {
      var all = sections();
      for (var i = 0; i < all.length && i < was.length; i++) all[i].open = was[i];
    });
  }

  // The buttons that open and close a group of table rows (Commands).
  function wireGroups() {
    var btns = document.querySelectorAll("tbody button[aria-expanded]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (e) {
        var group = e.currentTarget.closest("tbody");
        setOpen(group, group.classList.contains("collapsed"));
      });
    }
  }

  // Copies text and briefly says so on the button.
  function copyText(btn) {
    var text = btn.getAttribute("data-copy");
    var src = btn.getAttribute("data-copy-from");
    if (src) {
      var el = document.querySelector(src);
      text = el ? el.textContent : "";
    }
    var done = function () {
      var old = btn.textContent;
      btn.textContent = say("copied", "Copied");
      setTimeout(function () { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else {
      fallback(text);
      done();
    }
  }

  // Copy for older browsers and plain-http previews.
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* nothing else to try */ }
    document.body.removeChild(ta);
  }

  // The Menu button: opens the nav as a drawer on narrow screens, with a
  // backdrop; Escape, the backdrop or the button close it.
  function wireNav() {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    var backdrop = null;
    var open = function (on) {
      nav.classList.toggle("open", on);
      document.documentElement.classList.toggle("nav-open", on);
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      if (on && !backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "nav-backdrop";
        backdrop.addEventListener("click", function () { open(false); btn.focus(); });
        nav.parentNode.insertBefore(backdrop, nav);
      }
      if (backdrop) backdrop.hidden = !on;
      if (on) { var first = nav.querySelector("a"); if (first) first.focus(); }
    };
    btn.addEventListener("click", function () { open(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { open(false); btn.focus(); }
    });
    if (window.matchMedia) {
      window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) { if (e.matches) open(false); });
    }
  }

  // The language a reader picked (or turned down an offer of), kept in the browser.
  var LANG = "vg-lang";
  function remember(lang) {
    try { localStorage.setItem(LANG, lang); } catch (e) { /* kept for this page only */ }
  }
  function remembered() {
    try { return localStorage.getItem(LANG); } catch (e) { return null; }
  }

  // The switcher's option for one language the browser asks for: the same
  // language and region, else the same language ("pt-PT" gets Brazilian
  // Portuguese); Chinese for Taiwan, Hong Kong, Macau or zh-Hant is Traditional;
  // Spanish from any region but Spain (es-419, es-AR, es-CO...) is Latin American.
  function optionFor(sel, want) {
    var w = String(want).toLowerCase();
    if (/^zh-(hant|tw|hk|mo)/.test(w)) w = "zh-tw";
    else if (/^zh/.test(w)) w = "zh-cn";
    else if (/^es-/.test(w) && w !== "es-es") w = "es-mx";
    var same = null;
    for (var i = 0; i < sel.options.length; i++) {
      var lang = sel.options[i].lang.toLowerCase();
      if (lang === w) return sel.options[i];
      if (!same && lang.split("-")[0] === w.split("-")[0]) same = sel.options[i];
    }
    return same;
  }

  // The option for the browser's first language the site has, or null.
  function browserOption(sel) {
    var wants = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < wants.length; i++) {
      var opt = optionFor(sel, wants[i]);
      if (opt) return opt;
    }
    return null;
  }

  // Once, a small note in the reader's own language offering this page in it.
  // It never redirects; following it or turning it down is remembered.
  function offerLang(sel) {
    if (remembered()) return;
    var opt = browserOption(sel);
    if (!opt || opt.selected) return;
    var box = document.createElement("div");
    box.className = "lang-offer";
    box.lang = opt.lang;
    var link = document.createElement("a");
    link.href = opt.value + location.hash;
    link.textContent = opt.getAttribute("data-offer");
    link.addEventListener("click", function () { remember(opt.lang); link.href = opt.value + location.hash; });
    var no = document.createElement("button");
    no.type = "button";
    no.textContent = opt.getAttribute("data-dismiss");
    no.addEventListener("click", function () { remember(document.documentElement.lang); box.remove(); });
    box.appendChild(link);
    box.appendChild(no);
    document.body.appendChild(box);
  }

  // Back or Forward can show this page again with the select still on the language
  // that was picked; it goes back to this page's own language, so picking that one
  // again is a change.
  function resetLangSelect(sel) {
    window.addEventListener("pageshow", function () {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].defaultSelected) sel.selectedIndex = i;
      }
    });
  }

  // The language select at the sidebar's foot: picking one opens this page in it.
  function wireLang() {
    var sel = document.querySelector("select[data-lang-switch]");
    if (!sel) return;
    resetLangSelect(sel);
    sel.addEventListener("change", function () {
      var opt = sel.options[sel.selectedIndex];
      remember(opt.lang);
      location.href = opt.value + location.hash;
    });
    offerLang(sel);
  }

  // The header's language button: a pick is remembered and keeps the section link; a tap
  // outside the list or Escape closes it.
  function wireLangMenu() {
    var menu = document.querySelector("details[data-lang-menu]");
    if (!menu) return;
    menu.querySelectorAll("a[lang]").forEach(function (a) {
      var page = a.getAttribute("href");
      a.addEventListener("click", function () { remember(a.lang); a.href = page + location.hash; });
    });
    document.addEventListener("click", function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
    });
  }

  // An amount of time in the page's language ("7 days"), from the browser's own unit names.
  function unitText(lang, n, unit) {
    try { return new Intl.NumberFormat(lang, { style: "unit", unit: unit, unitDisplay: "long" }).format(n); } catch (e) { return n + " " + unit + (n === 1 ? "" : "s"); }
  }

  // The time left until `ms` from now: days and hours, hours and minutes, or minutes.
  function timeLeft(lang, ms) {
    var m = Math.max(1, Math.ceil(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    var parts = d ? [unitText(lang, d, "day"), unitText(lang, h, "hour")] : h ? [unitText(lang, h, "hour"), unitText(lang, m % 60, "minute")] : [unitText(lang, m, "minute")];
    try { return new Intl.ListFormat(lang, { style: "long", type: "unit" }).format(parts); } catch (e) { return parts.join(" "); }
  }

  // Home's countdown to WoW Forever's launch: the time left and the launch on the reader's own
  // clock, then "is live" until the week after, then nothing. Without scripts the built UTC line stays.
  function wireCountdown() {
    var el = document.querySelector("[data-launch]");
    if (!el || !window.Intl) return;
    var at = Date.parse(el.getAttribute("data-launch")), until = Date.parse(el.getAttribute("data-until"));
    var lang = document.documentElement.lang || "en";
    var when = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(at));
    function tick() {
      var now = Date.now();
      if (now >= until) { el.hidden = true; return; }
      el.textContent = now >= at ? el.getAttribute("data-live") : el.getAttribute("data-soon").replace("{time}", timeLeft(lang, at - now)).replace("{when}", when);
      setTimeout(tick, 30000);
    }
    tick();
  }

  document.documentElement.classList.add("js");
  foldForSmall();
  wireNav();
  wireLang();
  wireLangMenu();
  wirePref();
  document.querySelectorAll(".search[data-target]").forEach(wireSearch);
  wireGroups();
  openForHash();
  wireExpandAll();
  wirePrint();
  wireCountdown();
  window.addEventListener("hashchange", openForHash);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button.copy");
    if (btn) copyText(btn);
  });
})();
