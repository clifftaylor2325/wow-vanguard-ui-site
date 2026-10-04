// ForeverUI site: list filtering (Commands, Settings) and copy buttons.
// Everything is in the HTML already; without JS the full lists still show.
(function () {
  "use strict";

  // Lowercase text of an element's search data.
  function hay(el) {
    return (el.getAttribute("data-search") || el.textContent || "").toLowerCase();
  }

  // Wires one search form: <div class="search" data-target="#list" data-items=".item">.
  function wireSearch(box) {
    var input = box.querySelector("input[type=search]");
    var count = box.querySelector(".count");
    var list = document.querySelector(box.getAttribute("data-target"));
    var itemSel = box.getAttribute("data-items");
    var groupSel = box.getAttribute("data-groups");
    var filterBoxes = box.querySelectorAll("input[type=checkbox][data-filter]");
    if (!input || !list) return;
    var items = list.querySelectorAll(itemSel);
    var noun = box.getAttribute("data-noun") || "items";

    function allowed(el) {
      for (var i = 0; i < filterBoxes.length; i++) {
        var f = filterBoxes[i];
        if (!f.checked && el.getAttribute("data-avail") === f.getAttribute("data-filter")) return false;
      }
      return true;
    }

    function apply() {
      var words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      var shown = 0;
      for (var i = 0; i < items.length; i++) {
        var text = hay(items[i]);
        var ok = allowed(items[i]) && words.every(function (w) { return text.indexOf(w) >= 0; });
        items[i].hidden = !ok;
        if (ok && !items[i].classList.contains("h")) shown++;
      }
      if (groupSel) {
        var groups = list.querySelectorAll(groupSel);
        for (var g = 0; g < groups.length; g++) {
          var any = groups[g].querySelector(itemSel + ":not([hidden]):not(.h)");
          groups[g].hidden = !any;
        }
      }
      if (count) count.textContent = shown + " " + noun + " shown";
    }

    input.addEventListener("input", apply);
    for (var i = 0; i < filterBoxes.length; i++) filterBoxes[i].addEventListener("change", apply);
    if (location.hash === "" && input.value) apply();
    apply();
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
