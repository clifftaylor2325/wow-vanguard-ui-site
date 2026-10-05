# Feedback parser fixtures

- `fui-status-next.txt`, `fui-errors-next.txt`: `/fui status` and `/fui errors`
  as chat prints them (color codes included), captured from the addon's
  headless test client at wow-forever-ui `bfef4e2` with two errors raised on
  purpose.
- `fui-status-0.3.0.txt`: the two lines `/fui status` prints in v0.3.0 (the
  same format strings in `Core/Slash.lua`).
- `fui-report-v1.txt`: a `/fui report` block in the layout the feedback spike
  (section 4.9) sets out, filled with the lines captured above. No addon
  version has `/fui report` yet (wow-forever-ui issue #103); replace it with
  real output once the command ships.
