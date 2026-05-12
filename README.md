# Presentations

Markdown-first presentation workspace — Slidev decks and long-form docs in one
repo, scaffolded from the terminal or an AI coding agent.

## Highlights

- **Two modes per project** — slide decks (Slidev) or long-form documents
  rendered by the gallery (markdown-it + Shiki)
- **Custom Slidev theme** — `leland`: deep green, serif headlines, editorial pacing
- **Auto-discovered gallery** — drop a folder under `projects/<slug>/`, the
  Vue + Vite gallery picks it up
- **AI agent workflow** — `AGENTS.md` describes how Claude Code, Codex CLI, or
  any agent should scaffold and write presentations
- **AI skill creator** — `pnpm install-skills` turns `AGENTS.md` sections into
  ready-to-use slash commands for Claude Code (see below)
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
    install-skills.mjs           # Generates slash commands from skills.json + AGENTS.md
  skills/
    skills.json                  # Registry of AI slash commands
  .claude/commands/              # Generated Claude slash command files (committed)
  AGENTS.md                      # Single source of truth for AI agent workflows
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

### From your AI coding assistant

Open the folder in Claude Code, OpenAI Codex CLI, or any agent that reads
`AGENTS.md`, and ask it to **scaffold a new presentation**. In Claude Code
there's also a slash command:

```
/new-presentation                          # interactive
/new-presentation Q3 marketing review      # topic hint
/new-presentation ~/notes/q3.md            # copy a source file in
/new-presentation slides from ~/notes/q3.md
```

Both Claude and Codex follow the workflow in `AGENTS.md` — see that file for
the full breakdown.

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
| `pnpm install-skills` | Regenerate `.claude/commands/*.md` from `skills/skills.json` |
| `pnpm install-skills:check` | Verify generated delegates are in sync (CI-friendly) |

## Themes

Each slide project picks a theme in `meta.json` and in the frontmatter of
`slides.md`. Built-in choices:

- `leland` — custom editorial theme (deep green, serif headlines)
- `default` — Slidev's default theme
- `seriph` — Slidev's editorial serif theme

To add another theme, drop a `slidev-theme-<name>` package under `themes/`,
add it to the `pnpm-workspace.yaml` glob (already wildcarded), and list it in
`scripts/lib/util.mjs` so the scaffolder offers it.

## AI skill creator

`AGENTS.md` is the single source of truth for what AI agents do in this repo.
Each Claude-style slash command — like `/new-presentation` — is a tiny
generated delegate at `.claude/commands/<name>.md` that points back at an H2
section in `AGENTS.md`. The `install-skills` script keeps these in sync, so
adding a new agent workflow is a four-step loop:

1. Write the workflow as an H2 section in `AGENTS.md` (this is the prompt
   the agent will follow)
2. Register the skill in `skills/skills.json`:
   ```json
   {
     "name": "refresh-theme",
     "description": "Update the theme tokens and regenerate previews.",
     "section": "Refresh theme workflow"
   }
   ```
3. Run `pnpm install-skills` — it generates `.claude/commands/refresh-theme.md`
4. Commit both files

Codex and any other agent that reads `AGENTS.md` natively picks up the new
section without an extra step. `pnpm install-skills:check` runs in CI to
catch out-of-sync delegates.

## Further reading

- [`AGENTS.md`](./AGENTS.md) — canonical workflow for AI assistants
- `projects/getting-started/doc.md` — long-form orientation (run `pnpm dev`
  and click "Getting Started" in the gallery)
