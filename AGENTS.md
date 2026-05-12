# AGENTS.md

Instructions for AI coding assistants (Claude Code, OpenAI Codex CLI, etc.) working in this repo.

## Project at a glance

A monorepo of presentations. Two output modes per project:

- **Slides** — rendered by [Slidev](https://sli.dev) from `slides.md`
- **Docs** — long-form markdown rendered in the gallery from `doc.md`

```
presentations/
  gallery/                       # Vite + Vue app — index + doc renderer + Slidev launcher
  projects/<slug>/
    meta.json                    # { title, description, mode, theme, tags, createdAt, updatedAt }
    slides.md OR doc.md          # Source of truth for the project
  themes/slidev-theme-leland/    # Custom Slidev theme (others can be added alongside)
  scripts/
    new-project.mjs              # Scaffolder (also exposed as `pnpm scaffold`)
    present.mjs                  # Wraps `slidev <project>` (also `pnpm present <slug>`)
    export.mjs                   # PDF / standalone HTML export (also `pnpm export <slug>`)
```

The gallery auto-discovers any `projects/<slug>/` directory with a valid `meta.json`. There is no central registry.

## New presentation workflow

When the user asks you to create or scaffold a new presentation (or runs the
Claude `/new-presentation` slash command), follow this workflow.

### Argument forms

If the user supplies `$ARGUMENTS` or initial context, interpret it as one of:

| Form | Example | What it means |
| --- | --- | --- |
| _(empty)_ | `/new-presentation` | No hint — ask the user for everything. |
| Topic or brief | `Q3 marketing review` | Use as the topic; ask for remaining inputs. |
| Path to a file | `~/notes/q3.md` or `./drafts/outline.md` | A source file the user wants to base the content on. **Copy it (never move) into `projects/<slug>/sources/<basename>`.** |
| Mixed | `slides from ~/notes/q3.md` | Extract the mode hint AND the source path. |

When detecting a path:

- Resolve against the user's current working directory if relative.
- Confirm the file exists (e.g., via `ls`) before assuming a path. If it looks
  path-like but doesn't exist, treat the string as a topic and ask.
- Pass the resolved path through to `pnpm scaffold --source <path>` so the
  scaffolder handles the copy. Comma-separate multiple paths.
- After scaffolding, the file is at `projects/<slug>/sources/<basename>` — read
  it from there when generating the actual deck/doc.

### 1. Gather inputs

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

### 2. Scaffold the project

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

### 3. Write the actual content

The starter file is a stub. Replace it with content built from the user's
source material. Edit `projects/<slug>/slides.md` or `projects/<slug>/doc.md`
directly.

If the user provided source files via `--source`, they're now at
`projects/<slug>/sources/<basename>`. Read those files first, then transform
their content into the deck or doc. Don't delete or modify the source files —
they're preserved as the originals.

#### For slide decks

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

#### For documents

- Treat it as editorial markdown — headings, prose, lists, code, blockquotes,
  tables. Shiki provides syntax highlighting.
- Keep paragraphs scannable. Use H2s as section breaks.
- Don't shred content into single-line bullets unless that's the natural shape.

#### Working from different source types

- **Markdown** — restructure aggressively for the chosen mode. Don't just copy
  it in. For slides, break into one-idea slides; for docs, tighten prose.
- **JSON/YAML outline** — expand each node into a slide or section with real
  content. The outline is structure; you provide voice.
- **Freeform notes / transcript** — extract the throughline first, then build
  scaffolding around it. Discard filler.

### 4. Verify and hand off

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

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the gallery at `http://localhost:3030` |
| `pnpm scaffold` | Scaffold a new project (interactive or via `--flags`) |
| `pnpm present <slug>` | Launch a deck directly in Slidev |
| `pnpm export <slug> --pdf` | Export deck to PDF |
| `pnpm export <slug> --spa` | Export deck as standalone HTML |
| `pnpm install-skills` | Regenerate `.claude/commands/*.md` from `skills/skills.json` |
| `pnpm install-skills:check` | Verify generated delegates are in sync (CI-friendly) |

## Adding a new skill

The repo treats this `AGENTS.md` file as the single source of truth for
agent workflows. Each project-level slash command (e.g. `/new-presentation`)
is a thin generated delegate that points back at a section here.

To add a new skill:

1. Add an H2 section to this file describing the workflow.
2. Register the skill in `skills/skills.json`:
   ```json
   {
     "name": "<kebab-case-name>",
     "description": "<short, ends in a period.>",
     "argumentHint": "[optional hint shown beside the slash command]",
     "section": "<the exact H2 heading text from this file>"
   }
   ```
3. Run `pnpm install-skills`. The installer regenerates
   `.claude/commands/<name>.md` and refuses to overwrite any file that
   wasn't generated by the script (it looks for a marker line).
4. Commit both `skills/skills.json` and the generated delegate so a fresh
   clone gets the skill without needing to run setup.

Codex and other agents that read `AGENTS.md` natively pick up the new
workflow without any additional file.
