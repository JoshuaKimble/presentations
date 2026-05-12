# Presentations

Markdown-first presentation workspace — Slidev decks and long-form docs in one
repo, scaffolded from the terminal or via Claude Code.

## Highlights

- **Two modes per project** — slide decks (Slidev) or long-form documents
  rendered by the gallery (markdown-it + Shiki)
- **Custom Slidev theme** — `leland`: deep green, serif headlines, editorial pacing
- **Auto-discovered gallery** — drop a folder under `projects/<slug>/`, the
  Vue + Vite gallery picks it up
- **Claude Code slash command** — `/new-presentation` scaffolds a new deck or
  doc and writes content from source material you provide
- **Doc viewer extras** — fullscreen reading mode and "Save as PDF" on every doc

## Quick start

```bash
pnpm install
pnpm dev                    # gallery at http://localhost:3030
pnpm scaffold               # create a new project (interactive)
pnpm present <slug>         # launch a slide deck in Slidev
```

Requires Node ≥ 18.18 and `pnpm`.

## What's in here

```
presentations/
  gallery/                       # Vite + Vue app — project index, doc renderer, Slidev launcher
  projects/<slug>/               # Each presentation (slides or doc)
    meta.json                    # { title, description, mode, theme, tags, ... }
    slides.md  OR  doc.md
    sources/                     # Optional — copied-in source files (originals preserved)
  themes/
    slidev-theme-leland/         # Custom editorial theme (deep green, Newsreader + Inter)
  scripts/
    new-project.mjs              # Scaffolder (also `pnpm scaffold`)
    present.mjs                  # Wraps `slidev <slug>` (also `pnpm present`)
    export.mjs                   # PDF / standalone HTML export (also `pnpm export`)
  .claude/commands/              # Claude Code slash command definitions
  CLAUDE.md                      # Project context for Claude Code
```

Only the two demo projects (`welcome`, `getting-started`) ship with this
repo. Anything else you scaffold under `projects/` stays on your machine —
it's gitignored by default so collaborators don't see each other's drafts.

## Two ways to start a presentation

### From the CLI

```bash
# Interactive
pnpm scaffold

# Or pass flags
pnpm scaffold --title "Q3 Review" --slug q3-review --mode slides --theme leland
pnpm scaffold --title "Q3 Review" --mode doc --source ~/notes/q3.md
```

`--source <path>` copies the file into `projects/<slug>/sources/` — the
original stays exactly where it was. Pass a comma-separated list for multiple
sources.

### From Claude Code

```
/new-presentation                          # interactive
/new-presentation Q3 marketing review      # topic hint
/new-presentation ~/notes/q3.md            # copy a source file in
/new-presentation slides from ~/notes/q3.md
```

The full workflow lives in
[`.claude/commands/new-presentation.md`](./.claude/commands/new-presentation.md)
— read or edit it to change how the command behaves.

## Modes

| Mode | File | Rendered by | Use for |
| --- | --- | --- | --- |
| `slides` | `slides.md` | Slidev | Talks, decks, demos |
| `doc` | `doc.md` | Gallery (markdown-it + Shiki) | Articles, guides, references |

Doc pages have two floating buttons in the bottom-right:

- **PDF** — opens the print dialog; "Save as PDF" produces a clean,
  selectable-text export with the doc title as the filename
- **Fullscreen** — hides the gallery chrome for distraction-free reading
  (Esc to exit)

## Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the gallery at `http://localhost:3030` |
| `pnpm scaffold` | Scaffold a new project (interactive or via `--flags`) |
| `pnpm present <slug>` | Launch a deck directly in Slidev |
| `pnpm export <slug> --pdf` | Export deck to PDF |
| `pnpm export <slug> --spa` | Export deck as a standalone HTML SPA |

## Themes

Each slide project picks a theme in `meta.json` and in the frontmatter of
`slides.md`. Built-in choices:

- `leland` — custom editorial theme (deep green, serif headlines)
- `default` — Slidev's default theme
- `seriph` — Slidev's editorial serif theme

To add another theme, drop a `slidev-theme-<name>` package under `themes/`,
add it to the `pnpm-workspace.yaml` glob (already wildcarded), and list it in
`scripts/lib/util.mjs` so the scaffolder offers it.

## Adding a Claude slash command

Each slash command is a single markdown file under `.claude/commands/<name>.md`.
The file is the prompt — Claude reads the whole thing when the command runs.

1. Create `.claude/commands/<name>.md`
2. Add frontmatter: `description` and (optionally) `argument-hint`
3. Write the workflow as the body — Claude uses it as the system prompt for
   the command, with `$ARGUMENTS` interpolated to whatever the user typed
4. Commit the file

That's it. No registry, no codegen — Claude Code discovers the file the
next time you launch it.

## Further reading

- [`CLAUDE.md`](./CLAUDE.md) — project context loaded into every Claude session
- [`.claude/commands/new-presentation.md`](./.claude/commands/new-presentation.md)
  — the canonical example of a slash command
- `projects/getting-started/doc.md` — long-form orientation (run `pnpm dev`
  and click "Getting Started" in the gallery)
