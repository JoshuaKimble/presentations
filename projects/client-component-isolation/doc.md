---
title: "Frontend Pattern: Client Component Isolation"
description: "How we handle the \"use client\" boundary in server component trees."
---

# Frontend Pattern: Client Component Isolation

> A proposal for how we handle the `"use client"` boundary in server component trees.

## The problem

When a server component needs even one piece of interactive functionality, the temptation is to add `"use client"` to the top of the file and move on. In a 300-line server component, that means every bit of data fetching, server-side logic, and static rendering gets unnecessarily pulled into the client bundle — all to support one button or one piece of local state.

## The rule

**Never add `"use client"` to an existing server component. Instead, extract the interactive functionality into its own dedicated file.**

The original file stays a server component. Only the new extracted file carries the `"use client"` directive.

## Naming

Client component files **must** use the `.client` extension:

```
WishlistToggle.client.tsx
QuantitySelector.client.tsx
AddToCartButton.client.tsx
```

**The name before `.client` must be self-documenting** — it should describe what the component *does*, not where it came from. A name like `ProductCard.client.tsx` is only acceptable if the entire interactive surface of the product card is being isolated. In most cases, the name should be more specific.

The `.client` suffix serves two purposes:

1. It's an immediate signal to any engineer reading the directory that this file carries a client boundary.
2. It disambiguates files where a server and client version of the same concern need to coexist — e.g., `DataFetcher.tsx` (server) and `DataFetcher.client.tsx` (browser-compatible version).

## File location and scope

A client component should live at the **lowest scope where it can be shared** — but must be promoted as soon as its sharing needs exceed that scope.

| Situation | Where it lives |
|---|---|
| Used by a single file | Sibling to that file |
| Used by multiple files within a feature or folder | Nearest common parent folder |
| Used across an entire app | App-level shared library |
| Used across multiple apps in the monorepo | Monorepo-level shared library |

### Gauging future shareability

Use your engineering discretion. If your experience tells you something is likely to be reused — even before it's been needed a second time — go ahead and promote it to the appropriate scope early. You don't need to wait for a concrete second use case to justify it.

## Props across the server → client boundary

Only serializable data may be passed from a server component to a client component as props. This is a Next.js constraint, not a style preference.

**Allowed:**

- Strings, numbers, booleans
- Plain objects and arrays of the above
- `null` and `undefined`

**Not allowed:**

- Functions
- Class instances
- Dates (as `Date` objects — serialize to ISO string instead)
- React components passed as props from server to client

If you find yourself needing to pass something that isn't serializable, that's a signal the boundary is in the wrong place.

## Avoid speculative extraction

Only extract a client component when you actually have a reason to use `"use client"`. Do not extract preemptively on the assumption that interactivity might be needed later. The cost of an unnecessary client boundary is real — keep server components server components until there's a concrete reason not to.

## Example

Given a `ProductCard` server component that now needs a wishlist toggle:

**Before — entire component becomes a client component:**

```tsx
// ProductCard/index.tsx
'use client' // ← now the whole thing is a client component

export function ProductCard({ product }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  // ...300 lines of mixed server/client logic
}
```

**After — server component stays intact, client boundary is isolated:**

```tsx
// ProductCard/index.tsx — still a server component
import { WishlistToggle } from './WishlistToggle.client'

export function ProductCard({ product }: Props) {
  return (
    <div>
      <h2>{product.title}</h2>
      <WishlistToggle productId={product.id} />
    </div>
  )
}
```

```tsx
// ProductCard/WishlistToggle.client.tsx
'use client'

export function WishlistToggle({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  // isolated interactivity only
}
```

---

*This proposal is open for feedback. Bring concerns or suggested amendments to the guild.*
