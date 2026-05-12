---
description: Scaffold a new presentation (slides or doc) and turn source material into content.
argument-hint: [optional topic, brief, or path to a source file]
---

# /new-presentation

Scaffold a new presentation and write its content from source material.

If the user supplied `$ARGUMENTS`, treat it as initial context (topic, brief,
or a path to a source file) and skip directly to confirming the remaining
inputs.

## Argument forms

Interpret `$ARGUMENTS` as one of:

| Form | Example | What it means |
| --- | --- | --- |
| _(empty)_ | `/new-presentation` | No hint — ask the user for everything. |
| Topic or brief | `Q3 marketing review` | Use as the topic; ask for remaining inputs. |
| Path to a file | `~/notes/q3.md` or `./drafts/outline.md` | A source file the user wants to base the content on. **Copy it (never move) into `projects/<slug>/sources/<basename>`.** |
| Mixed | `slides from ~/notes/q3.md` | Extract the mode hint AND the source path. |

When detecting a path:

- Resolve against the user's current working directory if relative.
- Confirm the file exists (e.g. via `ls`) before assuming a path. If it looks
  path-like but doesn't exist, treat the string as a topic and ask.
- Pass the resolved path through to `pnpm scaffold --source <path>` so the
  scaffolder handles the copy. Comma-separate multiple paths.
- After scaffolding, the file is at `projects/<slug>/sources/<basename>` —
  read it from there when generating the actual deck/doc.

## 1. Gather inputs

Ask the user, in a single grouped exchange where possible:

1. **Title** — what's the deck/doc called?
2. **Mode** — `slides` or `doc`?
3. **Slug** — folder name (default: kebab-case of the title)
4. **Theme** (slides only) — one of:
   - `leland` — custom theme (default)
   - `default` — Slidev's default
   - `seriph` — Slidev's editorial serif theme
   - any other installed Slidev theme name
5. **Source material** — paste markdown, a JSON/YAML outline, raw notes, or a
   one-paragraph brief. (Optional — if blank, produce a high-quality starter
   outline from the title alone.)
6. **Description** — one-line summary (optional)
7. **Tags** — comma-separated, optional

If the user already provided enough context, infer the rest and confirm once
before scaffolding.

## 2. Scaffold the project

Run the scaffolder. It creates `projects/<slug>/` with a `meta.json` and a
starter `slides.md` or `doc.md`:

```bash
pnpm scaffold --title "<title>" --slug "<slug>" --mode <slides|doc> \
  --theme <theme> --description "<desc>" --tags "<csv>" \
  --source "<absolute-or-relative-path-to-source-file>"
```

- Omit flags the user didn't provide.
- `--source` accepts a single path or comma-separated paths. Files are copied
  (never moved) into `projects/<slug>/sources/`. Originals stay where they are.
- The scaffolder refuses to overwrite an existing slug — pick a new one and
  retry rather than forcing it.

## 3. Write the actual content

The starter file is a stub. Replace it with content built from the user's
source material. Edit `projects/<slug>/slides.md` or `projects/<slug>/doc.md`
directly.

If the user provided source files via `--source`, they're now at
`projects/<slug>/sources/<basename>`. Read those files first, then transform
their content into the deck or doc. Don't delete or modify the source files —
they're preserved as the originals.

### For slide decks

- Keep the frontmatter (`theme`, `title`, `info`, `class`, `highlighter`,
  `transition`, `mdc`) intact. Update individual fields if the user asked for
  something different.
- Use `---` on its own line to separate slides, with a blank line on each side
  of the separator (Slidev convention).
- Use per-slide layout frontmatter for variety. Available `leland` layouts:
  - `cover` — title slide (use for slide 1)
  - `section` — section divider on a green background
  - `quote` — pull quotes (props: `author`, `role`)
  - `two-cols` — split-column content (use `::left::` / `::right::` slots)
  - `stats` — stat-grid layout
  - `end` — closing slide
- One idea per slide. Prefer 5–10 word bullets. Bold the load-bearing word.
- Use fenced code blocks with language tags for syntax highlighting.
- Add HTML comments `<!-- speaker notes -->` after slides where useful.
- Default deck length: 8–15 slides unless the user specifies. Don't pad.

### For documents

- Treat it as editorial markdown — headings, prose, lists, code, blockquotes,
  tables. Shiki provides syntax highlighting.
- Keep paragraphs scannable. Use H2s as section breaks.
- Don't shred content into single-line bullets unless that's the natural shape.

### Working from different source types

- **Markdown** — restructure aggressively for the chosen mode. Don't just copy
  it in. For slides, break into one-idea slides; for docs, tighten prose.
- **JSON/YAML outline** — expand each node into a slide or section with real
  content. The outline is structure; you provide voice.
- **Freeform notes / transcript** — extract the throughline first, then build
  scaffolding around it. Discard filler.

## 4. Verify and hand off

After writing content:

1. Re-read the file you wrote to double-check structure — slide separators
   intact, frontmatter valid, no truncated code blocks.
2. Tell the user:
   - the path to the file you created
   - how many slides / how long the doc is
   - the two commands they need:
     ```bash
     pnpm dev                 # open the gallery
     pnpm present <slug>      # launch this deck in Slidev
     ```
3. Offer one short follow-up: "Want me to tighten any specific slides, add a
   particular section, or swap the theme?"

## Conventions

- **Never overwrite** an existing `slides.md` / `doc.md` without explicit user
  consent. If the file already has content, edit incrementally.
- **Don't invent** stats, quotes, or attributions. If the user didn't supply a
  source, mark placeholders with `(citation)` and flag them.
- Keep `meta.json`'s `updatedAt` current when you modify a project.
- "Make it more editorial" means: serif headlines, generous whitespace,
  deliberate pacing — not heavier branding.
