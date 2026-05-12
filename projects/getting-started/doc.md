---
title: Getting Started
description: How the presentations workspace is structured and how to add your own.
---

# Getting Started

This workspace holds every presentation — slide decks and long-form documents —
in one place. Each project is a folder under `projects/` with a `meta.json` and
either a `slides.md` or a `doc.md`. The gallery (this site) is the index;
Slidev handles slide rendering; long-form docs are rendered right here in the
gallery.

## Folder layout

```
presentations/
  gallery/                 # The Vue+Vite app you're looking at
  projects/
    welcome/               # Slide project
      meta.json
      slides.md
    getting-started/       # Doc project
      meta.json
      doc.md
  themes/
    slidev-theme-leland/   # Custom theme (swap or add more)
  scripts/                 # Scaffold, present, export, install-skills
  skills/
    skills.json            # Skill manifest — registers slash commands
  AGENTS.md                # Single source of truth for AI workflows
```

## Three ways to start a new presentation

### 1. From your AI coding assistant

Open this folder in your AI agent (Claude Code, Codex, etc.) and ask it to
**scaffold a new presentation**. The agent will read `AGENTS.md` for the full
workflow — including how to convert markdown / outlines / freeform notes into
slides or docs.

In Claude Code there's also a built-in shortcut: `/new-presentation`. You can
optionally pass it a topic or a path to a source markdown file:

```
/new-presentation Q3 marketing review
/new-presentation ~/notes/q3.md
/new-presentation slides from ~/notes/q3.md
```

A source file is **copied** into `projects/<slug>/sources/` — the original
stays exactly where it was.

### 2. The CLI scaffolder

If you'd rather start by hand:

```bash
pnpm scaffold
```

It prompts for title, slug, mode, theme, description, and tags. Or pass flags:

```bash
pnpm scaffold --title "Q3 Review" --slug q3-review --mode slides --theme leland
pnpm scaffold --title "Q3 Review" --mode doc --source ~/notes/q3.md
```

`--source <path>` copies the file into `projects/<slug>/sources/` (preserves
the original). Pass a comma-separated list for multiple sources.

### 3. Just create the folder

The gallery auto-discovers any directory under `projects/` that has a valid
`meta.json`. You can drop files in directly if you prefer.

## Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the gallery at `http://localhost:3030` |
| `pnpm scaffold` | Scaffold a new project (interactive) |
| `pnpm present <slug>` | Launch a deck directly in Slidev |
| `pnpm export <slug> --pdf` | Export deck to PDF |
| `pnpm export <slug> --spa` | Export deck as standalone HTML |
| `pnpm install-skills` | Regenerate AI slash commands from `skills/skills.json` |

## Adding more slash commands (skills)

`AGENTS.md` is the single source of truth for what AI agents do in this repo.
Each Claude-Code-style slash command (like `/new-presentation`) is a tiny
delegate file at `.claude/commands/<name>.md` that points back at a section in
`AGENTS.md`.

To add another skill — say `/refresh-theme`:

1. Add a section to `AGENTS.md`: `## Refresh theme workflow` with the
   instructions.
2. Add an entry to `skills/skills.json`:
   ```json
   { "name": "refresh-theme", "description": "Update the theme tokens and
     regenerate previews.", "section": "Refresh theme workflow" }
   ```
3. Run `pnpm install-skills` — it generates `.claude/commands/refresh-theme.md`.
4. Commit both files.

Codex picks up new sections in `AGENTS.md` automatically; no extra step.

## Themes

Slide projects pick a theme in `meta.json` and in the frontmatter of
`slides.md`. Built-in options:

- `leland` — a custom editorial theme (deep green, serif headlines)
- `default` — Slidev's default
- `seriph` — Slidev's editorial serif

To add a new custom theme, drop a package under `themes/<slidev-theme-name>/`
and list it in `scripts/lib/util.mjs` so the scaffolder picks it up.

## Doc mode tips

- Treat doc mode as editorial markdown — paragraphs, headings, lists, code,
  blockquotes, tables all render with the same type system.
- Code fences are syntax-highlighted via Shiki (same engine Slidev uses).
- Frontmatter `title` and `description` are surfaced on the gallery card and at
  the top of the document.
