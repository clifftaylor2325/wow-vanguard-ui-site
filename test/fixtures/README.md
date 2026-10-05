# Feedback parser fixtures

The `vg-*` files are the current format. The `fui-*` files are the same
lines as the addon printed them before it was renamed from ForeverUI
(0.3.0 and earlier); the parser reads both.

- `vg-status-next.txt`, `vg-errors-next.txt`: `/vg status` and `/vg errors`
  as chat prints them (color codes included), captured from the addon's
  headless test client at wow-forever-ui `bfef4e2` with two errors raised on
  purpose.
- `vg-status-0.3.0.txt`: the two lines `/vg status` prints in v0.3.0 (the
  same format strings in `Core/Slash.lua`).
- `vg-report-v1.txt`: a `/vg report` block in the layout the feedback spike
  (section 4.9) sets out, filled with the lines captured above. No addon
  version has `/vg report` yet (wow-forever-ui issue #103); replace it with
  real output once the command ships.
