---
theme: ./../../themes/slidev-theme-leland
title: Welcome
info: A quick tour of the presentations workspace.
class: text-center
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
---

# Own the deck.

A markdown-first presentation workspace — scaffold from the terminal or an AI coding assistant, present locally, export to PDF.

<!--
Speaker note: lead slow. One idea per slide.
-->

---
layout: section
---

# What this is

---

## A presentations workspace

- **One repo, many decks** — every project lives under `projects/`
- **Markdown is the source of truth** — slides _and_ docs
- **Scaffold by terminal or AI agent** — `pnpm scaffold` or follow `AGENTS.md`
- **PDF + standalone HTML export** — share anywhere

---

## Two modes per project

::left::

**Slides**

- `slides.md` with `---` separators
- Layouts, transitions, presenter mode
- Themed, paginated

::right::

**Docs**

- `doc.md` — long-form markdown
- Rendered in the gallery
- Editorial typography

---
layout: section
---

# How it works

---

## The flow

1. Run `pnpm dev` to open the gallery
2. Create a project with `pnpm scaffold` (or ask your AI agent)
3. Iterate in markdown — or have the agent do it
4. Present, export, share

```bash
pnpm scaffold --title "Q3 review" --mode slides --theme leland
pnpm present q3-review
pnpm export q3-review --pdf
```

---

## Themes

Three built-in choices via the `theme` field:

- `leland` — the custom theme used by this deck
- `default` — Slidev's default
- `seriph` — Slidev's editorial serif

Drop a new package in `themes/` to add more.

---
layout: quote
author: a presenter who finally has a theme they like
---

> The best slide is the one you don't have to apologize for.

---
layout: end
---

# Make something worth presenting.
