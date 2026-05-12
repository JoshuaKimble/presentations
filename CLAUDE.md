# CLAUDE.md

Project context for Claude Code working in this repo.

## What this is

A monorepo of presentations. Two output modes per project:

- **Slides** — rendered by [Slidev](https://sli.dev) from `slides.md`
- **Docs** — long-form markdown rendered in the gallery from `doc.md`

```
presentations/
  gallery/                       # Vite + Vue app — index + doc renderer + Slidev launcher
  projects/<slug>/
    meta.json                    # { title, description, mode, theme, tags, createdAt, updatedAt }
    slides.md OR doc.md          # Source of truth for the project
    sources/                     # Optional — copied-in source files (originals preserved)
  themes/slidev-theme-leland/    # Custom Slidev theme (others can be added alongside)
  scripts/
    new-project.mjs              # Scaffolder (also exposed as `pnpm scaffold`)
    present.mjs                  # Wraps `slidev <project>` (also `pnpm present <slug>`)
    export.mjs                   # PDF / standalone HTML export (also `pnpm export <slug>`)
  .claude/commands/              # Slash command definitions (e.g. /new-presentation)
```

The gallery auto-discovers any `projects/<slug>/` directory with a valid
`meta.json`. There is no central registry.

Only the two demo projects (`welcome`, `getting-started`) are tracked in git.
Everything else under `projects/` is gitignored — user presentations stay
local to whoever scaffolded them.

## Slash commands

Slash commands live in `.claude/commands/<name>.md`. Each file is a
self-contained prompt — there's no shared agent doc to chase. To add a new
command, create the markdown file with frontmatter (`description`,
`argument-hint`) and the workflow body. The command is immediately available
in the next Claude Code session.

The main one is `/new-presentation` — see
[`.claude/commands/new-presentation.md`](./.claude/commands/new-presentation.md)
for the workflow.

## Conventions

- **Never overwrite** an existing `slides.md` / `doc.md` without explicit user
  consent. If the file already has content, edit incrementally.
- **Don't invent** stats, quotes, or attributions. If the user didn't supply a
  source, mark placeholders with `(citation)` and flag them.
- Keep `meta.json`'s `updatedAt` current when you modify a project.
- "Make it more editorial" means: serif headlines, generous whitespace,
  deliberate pacing — not heavier branding.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the gallery at `http://localhost:3030` |
| `pnpm scaffold` | Scaffold a new project (interactive or via `--flags`) |
| `pnpm present <slug>` | Launch a deck directly in Slidev |
| `pnpm export <slug> --pdf` | Export deck to PDF |
| `pnpm export <slug> --spa` | Export deck as standalone HTML |
