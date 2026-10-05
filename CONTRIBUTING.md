# Contributing

## Text encoding (Windows PowerShell)

Every text file in this repo is UTF-8 without a byte-order mark (BOM), with LF line endings. `.editorconfig` tells editors this and `.gitattributes` keeps line endings LF. `npm run check` runs `npm run check:encoding`, which fails on garbled characters (a Greek capital gamma followed by box-drawing or accented letters where `…`, `“`, `”` or `→` belong; `â` followed by a euro sign where a curly quote belongs; a capital A with a tilde or circumflex in front of an accented letter or a middle dot) and on a BOM or a UTF-16 file. It prints the file and line of each one.

Windows PowerShell 5.1 is how garbled text usually gets in. By default it reads a program's output in the console's code page (IBM437), sends text down a pipe as US-ASCII, and writes files as UTF-16 or with a BOM. So, in Windows PowerShell:

- **Don't** redirect gh (or any program) into a file: `gh issue view 23 --json body > issue.json` garbles every non-ASCII character.
- **Don't** save files with `Out-File` or `Set-Content` defaults, or `Get-Content | Set-Content` round trips.
- **Don't** pipe one program into another (`gh ... | node ...`) without switching the session to UTF-8 first. Otherwise every non-ASCII character arrives as `?`, and plain question marks are something the check *can't* catch. Switch once per session:
  `$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false`
  After that, `gh ... --json body | node ...` is safe. PowerShell 7.4 or later and cmd.exe pass the bytes through unchanged.
- **Do** let gh pick the field itself with `-q`/`--jq` (`gh issue view 23 --json body -q .body`) when you only need to read it. To keep the text, write it from node as below.
- **Do** write files from node (UTF-8 without a BOM), for example with node calling gh itself through `execFileSync`. If you must write from PowerShell, use `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))`.
- Use `gh ... --body-file <file>` for bodies you wrote with node or an editor.

If `npm run check:encoding` fails, fix the characters it points to. The intended ones are usually `…`, `“`, `”`, `’`, `→` or `·`, and the addon source or README shows which. Then save the file as UTF-8 without a BOM.
