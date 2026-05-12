---
theme: ./../../themes/slidev-theme-leland
title: "Frontend Pattern: Encapsulation via Custom Hooks"
info: "How we structure state and logic in React components across the monorepo."
class: text-center
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
---

# Encapsulation via custom hooks

How we structure state and logic in React components across the monorepo.

<!--
Frame: this is a proposal, not a mandate. The goal is signal, not ceremony.
Lead slow — most of the room has already lived the "before" version.
-->

---
layout: section
---

# The **problem**

---

## State sprawl

- `useState` and `useEffect` accumulate **in the component body**
- Logic is **hard to read** at a glance
- **Hard to test** in isolation
- **Hard to reuse** without copy-paste
- AI tools mimic what they see — sprawl begets **more sprawl**

<!--
This isn't just style. It compounds into real bugs and slower development.
-->

---
layout: section
---

# The **pattern**

---
layout: quote
---

> If a block of logic has a **name worth giving it**,
> it belongs in a **hook**.

---

## What that means in practice

- Move state and logic into **named custom hooks**
- Component body becomes a **composition of named behaviors**
- A small component with two `useState`s? **Leave it alone.**
- The pattern earns its keep when it **improves readability or sharing**

<!--
Strong preference, not a strict rule. Use judgment.
-->

---
layout: section
---

# Why **it matters**

---

## Four wins

1. **Readability** — `const { isOpen, open, close } = useDialog()` tells you everything
2. **Reliability** — named boundary, isolated state, easier to reason about
3. **Reusability** — well-named hooks are **naturally shareable**
4. **AI compatibility** — consistent patterns produce **consistent AI output**

<!--
Reliability is the underrated one — fewer cross-state interactions = fewer subtle bugs.
-->

---
layout: section
---

# Example 1
# **a simple modal**

---

## Before — scattered state

```tsx
function InviteModal({ onInvite }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onInvite(email)
    setIsSubmitting(false)
    setIsOpen(false)
    setEmail('')
  }

  // …JSX wires it all together
}
```

<!--
Three pieces of state, one async handler, all tangled in the component body.
Nothing here is reusable. Nothing is independently testable.
-->

---

## After — three named hooks

```ts
const [isOpen, { open, close }] = useDisclosure()
const [email, { set, reset }] = useField('')
const { submit, isSubmitting } = useInviteSubmit({
  email,
  onInvite,
  onSuccess: () => { close(); reset() },
})
```

Each hook owns one concern. The component reads like a **spec**.

`useDisclosure` and `useField` are now reusable **anywhere** in the codebase.

<!--
Notice: the component still has the same behavior. What changed is where the logic lives
and what it's named. That's the entire move.
-->

---
layout: section
---

# Example 2
# **composed hooks**

---

## Search page with filters and sort

State that changes together:

- A query string
- A set of active **filters**
- A **sort order**
- Results + loading

Clearing the search should reset filters. Toggling a filter is a named operation. The component shouldn't orchestrate any of this.

---

## Two hooks — one composing the other

```ts
function useCoachFilters() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance')
  // toggleFilter, setSortOrder, reset…
  return { selectedFilters, sortOrder, toggleFilter, setSortOrder, reset }
}

function useCoachSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Coach[]>([])
  const filters = useCoachFilters()           // ← composed internally
  // search(), clear()…
  return { query, results, search, clear, ...filters }
}
```

---

## The component doesn't know `useCoachFilters` exists

```tsx
function CoachSearchPage() {
  const { query, selectedFilters, sortOrder, results, isLoading,
          setQuery, toggleFilter, setSortOrder, search, clear } = useCoachSearch()
  // …JSX
}
```

- Swap `useCoachFilters` to back state with **URL params** → nothing above changes
- Test `useCoachFilters` in isolation → no search context required
- This is where the benefits **compound**

<!--
Each layer of isolation makes the layer above it more reliable.
-->

---

## Where hooks live

| Scope | Location |
|---|---|
| Used by **one** component | Same folder as the component |
| Used by **2+** components in an app | App-level `hooks/` directory |
| Used **across apps** | Monorepo shared library |

Same sibling → app → monorepo scoping we apply to all shared code.

---

## What this is **not**

- **Not** a ban on `useState` in components
- **Not** a requirement to wrap everything
- **Not** a performance pattern — clarity first, memoization is a side effect

<!--
The pattern earns its keep when it improves readability and sharing. Don't add indirection
for no gain.
-->

---
layout: end
---

# If a block of logic has a name worth giving it,
# put it in a **hook**.

The rest is commentary.
