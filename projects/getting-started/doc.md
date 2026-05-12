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
  scripts/                 # Scaffold, present, export
  .claude/commands/        # Slash command definitions
  CLAUDE.md                # Project context for Claude Code
```

Only the two demo projects above are tracked in git. Anything else you
scaffold under `projects/` stays on your machine — it's gitignored by default
so collaborators don't see each other's drafts.

## Three ways to start a new presentation

### 1. From Claude Code

In Claude Code, run the `/new-presentation` slash command. You can optionally
pass a topic or a path to a source markdown file:

```
/new-presentation Q3 marketing review
/new-presentation ~/notes/q3.md
/new-presentation slides from ~/notes/q3.md
```

A source file is **copied** into `projects/<slug>/sources/` — the original
stays exactly where it was.

The full workflow lives in `.claude/commands/new-presentation.md` if you want
to read or customize it.

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

## Adding your own Claude slash commands

Each slash command is a single markdown file under `.claude/commands/<name>.md`
with frontmatter and a workflow body. To add `/refresh-theme`:

1. Create `.claude/commands/refresh-theme.md`
2. Add frontmatter: `description` and `argument-hint`
3. Write the workflow as the body — Claude reads the whole file as the prompt
4. Commit the file

The command is available the next time you launch Claude Code in this repo.

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
- Bottom-right of every doc page: a PDF button (opens the print dialog) and a
  Fullscreen toggle.
