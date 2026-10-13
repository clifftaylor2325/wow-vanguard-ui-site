// Vanguard's crest as inline SVG: two swords crossed behind a rimmed, riveted heater shield that
// bears a serif V. The drawing is the addon's `art/brand/vanguard-crest.svg` (1024 x 1024 units);
// the addon draws the same shapes for its addons-list icon. Colours come from the theme's CSS
// variables, so the mark follows the site's accent; `--crest-dark` (site.css) is the darker brass of
// the rim and the grips.

// The heater shield, centred on (512, 518), and the V on it: Cinzel's capital at weight 900 (SIL
// OFL, bundled by the addon), 400 units tall, centred on (512, 500), as an outline.
const SHIELD = "M512 118 L842 212 V530 C842 712 690 850 512 918 C334 850 182 712 182 530 V212 Z";
const LETTER = "M517.0 700.0 326.4 303.3H459.0L565.6 558.6ZM517.0 700.0V613.8L652.9 301.7H697.6L553.4 617.7Q551.2 622.7 546.3 633.4Q541.3 644.2 536.0 656.9Q530.8 669.6 526.9 681.2Q523.0 692.8 521.9 700.0ZM635.8 340.3Q643.5 323.8 634.7 314.6Q625.8 305.5 614.8 305.5H609.8V300.0H733.0V305.5Q733.0 305.5 730.5 305.5Q728.0 305.5 728.0 305.5Q715.9 305.5 702.3 313.5Q688.8 321.5 680.0 340.3ZM474.4 340.3H344.0Q335.2 321.5 321.7 313.5Q308.1 305.5 295.4 305.5Q295.4 305.5 293.2 305.5Q291.0 305.5 291.0 305.5V300.0H500.4V305.5H495.4Q484.9 305.5 476.9 314.6Q468.9 323.8 474.4 340.3Z";

// The rivets around the rim: 41 points along the shield's outline, 58 units apart from the apex.
const STUDS = [[567.8, 133.9], [623.6, 149.8], [679.3, 165.7], [735.1, 181.6], [790.9, 197.4], [842, 216.9], [842, 274.9], [842, 332.9], [842, 390.9], [842, 448.9], [842, 506.9], [840.1, 564.8], [828.6, 621.6], [807.3, 675.4], [777.5, 725.1], [740.8, 770], [698.7, 809.9], [652.6, 845], [603.3, 875.5], [551.5, 901.6], [497.9, 912.4], [445.1, 888.4], [394.5, 860.1], [346.8, 827.2], [302.6, 789.6], [263.2, 747.1], [229.9, 699.6], [204.4, 647.7], [188.1, 592.1], [182, 534.5], [182, 476.5], [182, 418.5], [182, 360.5], [182, 302.5], [182, 244.5], [206.6, 205], [262.3, 189.1], [318.1, 173.2], [373.9, 157.3], [429.7, 141.5], [485.5, 125.6]];

// The colours, as CSS: the theme's slate, brass and text for the ink, the field and the blades.
const C = { ground: "var(--bg)", brass: "var(--accent)", dark: "var(--crest-dark)", steel: "var(--text)", steel2: "var(--text2)" };

// A scale about the shield's centre.
const about = (s) => `translate(512 518) scale(${s}) translate(-512 -518)`;

// One sword, point up, leaning `lean` degrees and crossing the other 270 units up its blade. `full`
// adds the fuller and the grip's wrap; the simple mark leaves them out (under a pixel at 26 px).
function sword(lean, full) {
  return `<g transform="translate(512 560) rotate(${lean}) translate(0 270)">
<path d="M-22 -8 L-13 -740 L0 -800 L13 -740 L22 -8 Z" fill="${C.steel2}" stroke="${C.ground}" stroke-width="8" stroke-linejoin="round"/><path d="M-22 -8 L-13 -740 L0 -800 L0 -8 Z" fill="${C.steel}"/>
${full ? `<path d="M-5 -60 L-2 -670 L2 -670 L5 -60 Z" fill="${C.ground}" opacity="0.55"/>` : ""}<path d="M0 -62 L13 -36 L0 -10 L-13 -36 Z" fill="${C.brass}" stroke="${C.ground}" stroke-width="6" stroke-linejoin="round"/>
<path d="M-104 -24 Q-52 -4 0 0 Q52 -4 104 -24" fill="none" stroke="${C.ground}" stroke-width="34" stroke-linecap="round"/><path d="M-104 -24 Q-52 -4 0 0 Q52 -4 104 -24" fill="none" stroke="${C.brass}" stroke-width="22" stroke-linecap="round"/>
<circle cx="-104" cy="-24" r="15" fill="${C.brass}" stroke="${C.ground}" stroke-width="7"/><circle cx="104" cy="-24" r="15" fill="${C.brass}" stroke="${C.ground}" stroke-width="7"/>
<rect x="-13" y="12" width="26" height="152" fill="${C.dark}" stroke="${C.ground}" stroke-width="8"/>${full ? `<path d="M-13 34 L13 46 M-13 56 L13 68 M-13 78 L13 90 M-13 100 L13 112 M-13 122 L13 134 M-13 144 L13 156" stroke="${C.ground}" stroke-width="5" opacity="0.7"/>` : ""}
<rect x="-19" y="10" width="38" height="16" rx="3" fill="${C.brass}" stroke="${C.ground}" stroke-width="7"/><rect x="-19" y="152" width="38" height="16" rx="3" fill="${C.brass}" stroke="${C.ground}" stroke-width="7"/>
<circle cx="0" cy="198" r="33" fill="${C.brass}" stroke="${C.ground}" stroke-width="8"/><circle cx="0" cy="198" r="12" fill="${C.ground}"/>
</g>`;
}

// The shield with its rim, field, rivets (full only), apex boss and the V (with a bevel shadow, and
// an engraved line when full; `id` keeps the clip's id unique on a page).
function shield(full, id) {
  const studs = full ? `<g transform="${about(0.9625)}" fill="${C.ground}">${STUDS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join("")}</g>` : "";
  const engraved = full ? `<clipPath id="${id}"><path d="${LETTER}"/></clipPath><path d="${LETTER}" fill="none" stroke="${C.brass}" stroke-width="40" clip-path="url(#${id})"/><path d="${LETTER}" fill="none" stroke="${C.ground}" stroke-width="30" clip-path="url(#${id})"/>` : "";
  return `<g transform="translate(512 488) scale(0.74) translate(-512 -518)">
<path d="${SHIELD}" fill="${C.dark}" stroke="${C.ground}" stroke-width="6"/><path d="${SHIELD}" transform="${about(0.925)}" fill="${C.brass}" stroke="${C.ground}" stroke-width="5"/>${studs}
<path d="M512 92 L534 122 L512 152 L490 122 Z" fill="${C.brass}" stroke="${C.ground}" stroke-width="6" stroke-linejoin="round"/><path d="M512 108 L522 122 L512 136 L502 122 Z" fill="${C.ground}"/>
<path d="${LETTER}" transform="translate(6 6)" fill="${C.dark}"/><path d="${LETTER}" fill="${C.ground}"/>${engraved}
</g>`;
}

// The crest as an inline SVG, cropped to the drawing (594 x 870 units). `full` draws every detail
// (the hero); otherwise the simple mark for small sizes (the header). Decorative unless `label` names it.
export function crestSvg({ full = false, cls = "crest", id = "vg-crest-letter", label = "" } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`;
  return `<svg class="${cls}" viewBox="215 115 594 870" ${a11y} focusable="false">${sword(-33, full)}${sword(33, full)}${shield(full, id)}</svg>`;
}

// A hex colour darkened to `f` of its value (the favicon's rim and grips, with no CSS to lean on).
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.round(v * f).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

// The favicon: the crest's shield and V alone (the swords are noise at 16 px), on a rounded slate
// square, in the theme's own colours (a stand-alone file has no CSS variables).
export function faviconSvg(vars) {
  const dark = shade(vars.accent, 0.82);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="180" fill="${vars.bg}"/><g transform="${about(1.15)}"><path d="${SHIELD}" fill="${dark}"/><path d="${SHIELD}" transform="${about(0.925)}" fill="${vars.accent}"/><path d="${LETTER}" transform="translate(6 6)" fill="${dark}"/><path d="${LETTER}" fill="${vars.bg}"/></g></svg>\n`;
}
