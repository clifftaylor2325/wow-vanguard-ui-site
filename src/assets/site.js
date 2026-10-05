// Vanguard site: list filtering (Commands, Settings) and copy buttons.
// Everything is in the HTML already; without JS the full lists still show.
(function () {
  "use strict";

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

  // Hides each group (a settings page) with no visible entry left.
  function hideEmptyGroups(s) {
    var groups = s.list.querySelectorAll(s.groupSel);
    for (var g = 0; g < groups.length; g++) {
      groups[g].hidden = !groups[g].querySelector(s.itemSel + ":not([hidden]):not(.h)");
    }
  }

  // True when any version box is unticked.
  function anyUnticked(filters) {
    for (var i = 0; i < filters.length; i++) if (!filters[i].checked) return true;
    return false;
  }

  // The counter line: "1 setting shown", "12 settings shown".
  function countText(box, shown) {
    var one = box.getAttribute("data-noun-one") || "item";
    var many = box.getAttribute("data-noun") || "items";
    return shown + " " + (shown === 1 ? one : many) + " shown";
  }

  // Makes the message shown under the list when nothing matches (hidden until then).
  function makeEmpty(list) {
    var empty = document.createElement("div");
    empty.className = "notice search-empty";
    empty.hidden = true;
    empty.innerHTML = '<p></p><button class="search-clear" type="button">Clear search</button>';
    list.parentNode.insertBefore(empty, list.nextSibling);
    return empty;
  }

  // Fills in or hides the no-match message: what was searched, and what to try.
  function showEmpty(s, shown, query) {
    s.empty.hidden = shown > 0;
    if (shown > 0) return;
    var noun = s.box.getAttribute("data-noun") || "items";
    var what = query ? "No " + noun + " match \u201c" + query + "\u201d." : "No " + noun + " to show.";
    var boxes = anyUnticked(s.filters) ? "tick the Show boxes above" : "";
    var hint = query ? " Check the spelling" + (boxes ? ", or " + boxes : ", or try fewer words") : (boxes ? " Tick the Show boxes above" : "");
    s.empty.querySelector("p").textContent = what + hint + (hint ? "." : "");
  }

  // Filters the list by the search words and boxes, then updates the counter and the no-match message.
  function apply(s) {
    var query = s.input.value.trim();
    var shown = filterItems(s, query.toLowerCase().split(/\s+/).filter(Boolean));
    if (s.groupSel) hideEmptyGroups(s);
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
    run();
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
      btn.textContent = "Copied";
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

  // The mobile menu button: shows and hides the nav list.
  function wireNav(nav) {
    var btn = nav.querySelector(".nav-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  document.documentElement.classList.add("js");
  document.querySelectorAll(".nav").forEach(wireNav);
  document.querySelectorAll(".search[data-target]").forEach(wireSearch);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button.copy");
    if (btn) copyText(btn);
  });
})();
