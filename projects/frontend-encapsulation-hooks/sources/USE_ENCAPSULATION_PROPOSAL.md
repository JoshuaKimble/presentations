# Frontend Pattern: Encapsulation via Custom Hooks

> A proposal for how we structure state and logic in React components across the monorepo.

---

## The Problem

As components grow, it's easy for state, effects, and event handlers to accumulate directly in the component body. The result is components that are hard to read at a glance, hard to test in isolation, and hard to reuse logic from. When AI models are generating or modifying code in this codebase, scattered inline logic also produces less predictable, less mimicable output.

This isn't just a style concern — it compounds into real bugs and slower development over time.

---

## The Pattern

**Move state and logic into named custom hooks. Keep component bodies as a clean composition of named behaviors.**

This is a strong preference, not a strict rule. A small component with two lines of `useState` doesn't need a hook. The goal is signal, not ceremony. If extracting a hook makes the component more readable and the logic more reusable, do it. If it adds indirection for no gain, don't.

The guideline to apply: **if a block of logic has a name worth giving it, it belongs in a hook.**

---

## Why This Matters

Four things this pattern directly improves:

1. **Readability** — A component that reads `const { isOpen, open, close } = useDialog()` communicates intent immediately. A component with 8 `useState` calls does not.

2. **Reliability and predictability** — Logic isolated in a named hook has a clear boundary. It's easier to reason about, easier to test in isolation, and less likely to produce subtle bugs from state interactions spread across a component.

3. **Reusability** — Well-named hooks are naturally shareable. Logic that lives in a component body can't be reused without copy-pasting.

4. **AI compatibility** — When our codebase has consistent, mimicable patterns, AI-generated code matches our conventions more reliably. Scattered inline logic produces inconsistent output; named hooks produce consistent output.

---

## Examples

### Example 1: Simple UI state

A modal component that manages open/close state and a form field.

**Before:**
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

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Invite teammate</button>
      {isOpen && (
        <dialog>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send invite'}
          </button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </dialog>
      )}
    </>
  )
}
```

**After — hooks first, with their implementations shown:**
```ts
// useDisclosure.ts
function useDisclosure(initial = false): [boolean, { open: () => void; close: () => void; toggle: () => void }] {
  const [isOpen, setIsOpen] = useState(initial)

  const actions = useMemo(() => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }), [])

  return [isOpen, actions]
}
```

```ts
// useField.ts
function useField(initial = ''): [string, { set: (value: string) => void; reset: () => void }] {
  const [value, setValue] = useState(initial)

  const actions = useMemo(() => ({
    set: (v: string) => setValue(v),
    reset: () => setValue(initial),
  }), [initial])

  return [value, actions]
}
```

```ts
// useInviteSubmit.ts
type UseInviteSubmitOptions = {
  email: string
  onInvite: (email: string) => Promise<void>
  onSuccess: () => void
}

function useInviteSubmit({ email, onInvite, onSuccess }: UseInviteSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(true)
    await onInvite(email)
    setIsSubmitting(false)
    onSuccess()
  }

  return { submit, isSubmitting }
}
```

```tsx
// InviteModal.tsx — the component is now a clean composition
function InviteModal({ onInvite }: Props) {
  const [isOpen, { open, close }] = useDisclosure()
  const [email, { set: setEmail, reset: resetEmail }] = useField('')
  const { submit, isSubmitting } = useInviteSubmit({
    email,
    onInvite,
    onSuccess: () => { close(); resetEmail() },
  })

  return (
    <>
      <button onClick={open}>Invite teammate</button>
      {isOpen && (
        <dialog>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send invite'}
          </button>
          <button onClick={close}>Cancel</button>
        </dialog>
      )}
    </>
  )
}
```

The component now reads like a spec. Each hook name tells you what concern it owns. And `useDisclosure` and `useField` are immediately reusable anywhere else in the codebase.

---

### Example 2: Composed hooks

A search page with a query input, active filters, and a sort order. These values change together in meaningful ways — clearing the search should reset filters, toggling a filter is a named operation, and the component shouldn't have to orchestrate any of it.

But we can go further than a single hook. Filters and sort order are their own concern, separate from the search query and results. So we split them: `useCoachFilters` owns filter and sort state, and `useCoachSearch` composes it internally. The component never knows `useCoachFilters` exists — it just calls `useCoachSearch` and gets a clean API back.

**Before:**
```tsx
function CoachSearchPage() {
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'relevance' | 'rating' | 'price'>('relevance')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Coach[]>([])

  const handleSearch = async () => {
    setIsLoading(true)
    const data = await searchCoaches({ query, filters: selectedFilters, sort: sortOrder })
    setResults(data)
    setIsLoading(false)
  }

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const handleClear = () => {
    setQuery('')
    setSelectedFilters([])
    setSortOrder('relevance')
    setResults([])
  }

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      {['price', 'availability', 'rating'].map(filter => (
        <button
          key={filter}
          onClick={() => handleFilterToggle(filter)}
          aria-pressed={selectedFilters.includes(filter)}
        >
          {filter}
        </button>
      ))}
      <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)}>
        <option value="relevance">Relevance</option>
        <option value="rating">Rating</option>
        <option value="price">Price</option>
      </select>
      <button onClick={handleClear}>Clear</button>
      {isLoading ? <Spinner /> : <CoachList coaches={results} />}
    </div>
  )
}
```

**After — two hooks, one composing the other:**
```ts
// useCoachFilters.ts
type SortOrder = 'relevance' | 'rating' | 'price'

type UseCoachFiltersReturn = {
  selectedFilters: string[]
  sortOrder: SortOrder
  toggleFilter: (filter: string) => void
  setSortOrder: (order: SortOrder) => void
  reset: () => void
}

function useCoachFilters(): UseCoachFiltersReturn {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance')

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const reset = () => {
    setSelectedFilters([])
    setSortOrder('relevance')
  }

  return { selectedFilters, sortOrder, toggleFilter, setSortOrder, reset }
}
```

```ts
// useCoachSearch.ts — composes useCoachFilters internally
type UseCoachSearchReturn = {
  query: string
  selectedFilters: string[]
  sortOrder: SortOrder
  results: Coach[]
  isLoading: boolean
  setQuery: (query: string) => void
  toggleFilter: (filter: string) => void
  setSortOrder: (order: SortOrder) => void
  search: () => Promise<void>
  clear: () => void
}

function useCoachSearch(): UseCoachSearchReturn {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Coach[]>([])
  const filters = useCoachFilters()

  const search = async () => {
    setIsLoading(true)
    const data = await searchCoaches({
      query,
      filters: filters.selectedFilters,
      sort: filters.sortOrder,
    })
    setResults(data)
    setIsLoading(false)
  }

  const clear = () => {
    setQuery('')
    setResults([])
    filters.reset()
  }

  return {
    query,
    results,
    isLoading,
    setQuery,
    search,
    clear,
    ...filters,
  }
}
```

```tsx
// CoachSearchPage.tsx — unchanged from what it would have been with a single hook
function CoachSearchPage() {
  const {
    query,
    selectedFilters,
    sortOrder,
    results,
    isLoading,
    setQuery,
    toggleFilter,
    setSortOrder,
    search,
    clear,
  } = useCoachSearch()

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={search}>Search</button>
      {['price', 'availability', 'rating'].map(filter => (
        <button
          key={filter}
          onClick={() => toggleFilter(filter)}
          aria-pressed={selectedFilters.includes(filter)}
        >
          {filter}
        </button>
      ))}
      <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)}>
        <option value="relevance">Relevance</option>
        <option value="rating">Rating</option>
        <option value="price">Price</option>
      </select>
      <button onClick={clear}>Clear</button>
      {isLoading ? <Spinner /> : <CoachList coaches={results} />}
    </div>
  )
}
```

The component is identical to what it would have been if `useCoachSearch` were a single flat hook. It has no idea that `useCoachFilters` exists. But now filter logic is isolated in its own hook — testable on its own, reusable independently, and refactorable without touching either `useCoachSearch` or the component.

This is where the benefits compound. Each layer of isolation makes the layer above it more reliable. You can swap the internals of `useCoachFilters` — say, backing it with URL params instead of local state — and nothing above it changes at all.

---

## Where Hooks Live

> Note: this scoping model — sibling → app-level → monorepo — is the same pattern we apply to all shared code in this repo. A separate doc covers that convention in full.

| Scope | Location |
|---|---|
| Used by one component | Same folder as the component (`useCoachSearch.ts` next to `CoachSearchPage.tsx`) |
| Used by 2+ components in an app | App-level `hooks/` directory |
| Used across apps in the monorepo | Monorepo shared library |

---

## What This Is Not

- **Not a ban on `useState` in components.** Small, self-contained state in a short component is fine.
- **Not a requirement to wrap everything.** The pattern earns its keep when it improves readability and shareability — use your judgment.
- **Not a performance pattern.** This is about code clarity first. Memoization inside hooks is a secondary benefit, not the point.

---

## Summary

> If a block of logic has a name worth giving it, put it in a hook.

The rest is commentary.

---

*Open for feedback. Raise concerns or amendments in the PR or at the guild.*
