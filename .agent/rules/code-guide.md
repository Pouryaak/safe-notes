---
trigger: always_on
---

# Coder Agent Rules — Notes App (Next.js + React + Tailwind + shadcn/ui + Supabase)

## 0) Prime Directive

- **Do not guess. Do not assume.**
- If you’re unsure about an API, behavior, version, or best practice:
  1. **Stop**
  2. **Read the official documentation**
  3. Implement using the **latest stable syntax**
  4. Include a short note in the PR/commit message referencing what doc section you followed.

Security is #1. Code quality is non-negotiable.

---

## 1) Tech Stack (must follow)

- **Next.js**: latest stable (App Router).
- **React**: latest stable.
- **TypeScript**: strict mode (no `any` without explicit justification).
- **Tailwind CSS**: latest stable.
- **shadcn/ui**: use whenever a component exists there.
- **Supabase**: database/auth/storage using official Supabase packages and recommended Next.js patterns.

---

## 2) Non-Negotiable Engineering Principles

1. **Simplicity wins**  
   Prefer boring, readable code over clever abstractions.
2. **Small files, small components**
   - No “god” components.
   - Split by responsibility.
3. **Single Source of Truth**  
   Avoid duplicate logic/components doing the same thing.
4. **Security by default**  
   Least privilege, strict RLS, safe secrets handling, safe logging.
5. **Accessibility and UX**  
   Keyboard-first, screen-reader-friendly, fast interactions.
6. **Performance and cost awareness**  
   Avoid unnecessary re-renders, minimize client JS, cache smartly, reduce queries.

---

## 3) Workflow Rules (how you work)

### 3.1 Before writing code

- Identify:
  - What is the user story?
  - What is the acceptance criteria?
  - What is the minimal change?
- Confirm:
  - Where in the codebase this belongs
  - Whether an existing component/util already solves it

### 3.2 Documentation-first

- Always check official docs before using:
  - Next.js (App Router, caching, Server Actions, Route Handlers)
  - React (hooks, concurrent features)
  - Tailwind
  - shadcn/ui
  - Supabase (auth SSR patterns, RLS, policies)

### 3.3 If ambiguous

- Do not implement speculative behavior.
- Ask for clarification OR propose 2–3 options with tradeoffs and pick the safest default.

---

## 4) Project Structure Rules

### 4.1 Folder-by-feature (preferred)

Use a feature/domain structure, not “components dumping ground”.

Example:

- `src/app/**` → routes, layouts, route handlers
- `src/features/**` → feature modules (notes, folders, search, auth, vault)
- `src/components/ui/**` → shadcn components (generated/managed)
- `src/components/common/**` → shared app components (non-shadcn)
- `src/lib/**` → libraries (supabase client, utils, validators)
- `src/styles/**` → globals, tailwind config helpers
- `src/types/**` → shared types (keep minimal; prefer inference from zod/DB)

### 4.2 Naming

- React components: `PascalCase.tsx`
- Hooks: `useX.ts`
- Utilities: `camelCase.ts`
- Feature boundaries:
  - UI (presentation) vs domain logic vs data access must be separated.

---

## 5) Code Quality Standards

### 5.1 Component size limits

- Target: **≤ 120 LOC** per component.
- Hard max: **≤ 200 LOC** (must justify in comment and consider refactor).
- Keep render functions clean; move logic to hooks/services.

### 5.2 TypeScript rules

- `strict: true`
- No `any`. If unavoidable, use:
  - `unknown` + runtime validation
  - or a documented, minimal, contained `any` with comment: `// TODO: type safely`
- Prefer type inference (from zod schemas and Supabase generated types).

### 5.3 Functions

- Prefer pure functions when possible.
- Avoid deeply nested conditionals; extract helpers.
- Always handle error paths.

### 5.4 Linting/Formatting

- ESLint + Prettier enforced.
- No formatting debates: the formatter wins.
- No unused vars, no dead code.

---

## 6) UI & Design System Rules (Tailwind + shadcn/ui)

### 6.1 shadcn-first, reuse always

- If shadcn/ui has it → use it.
- If we already have a local component for it → reuse it.
- Do **not** create new components that duplicate existing ones.
- Before adding a component, search:
  - `src/components/ui`
  - `src/components/common`
  - `src/features/**/components`

### 6.2 Styling

- Tailwind only (no custom CSS unless necessary).
- Use `cn()` utility for conditional classes.
- Keep class lists readable:
  - Extract long class strings into variables if needed.
- Respect design tokens (if defined).

### 6.3 Accessibility

- Use semantic elements.
- Ensure focus states, keyboard navigation, ARIA attributes where needed.
- Use shadcn patterns (Radix-based) to avoid a11y pitfalls.

### 6.4 Avoid UI bloat

- Progressive disclosure:
  - advanced actions behind menus
  - keep capture flow minimal

---

## 7) Data & Validation Rules

### 7.1 Validation (required)

- Validate all user inputs.
- Use **zod** schemas for:
  - form inputs
  - server action inputs
  - route handler inputs

### 7.2 Data fetching

- Prefer server-side data fetching where possible (App Router).
- Minimize client-side fetching; only use client components when needed.
- Avoid over-fetching:
  - select only required columns
  - paginate lists

### 7.3 Error handling

- Never swallow errors silently.
- User-facing errors must be friendly and actionable.
- Log errors server-side with safe redaction.

---

## 8) Supabase Rules (Security #1)

### 8.1 Auth & sessions

- Follow the official Supabase Next.js SSR patterns.
- Keep the **service role key** server-only.
- Never expose service role keys or privileged endpoints to client.

### 8.2 Database is the guardrail

- **RLS must be enabled** on all user data tables.
- Policies must enforce:
  - a user can only access their own notes/folders
  - secure notes follow stricter rules if required

### 8.3 Migrations & schema

- Use Supabase migrations (SQL) for schema changes.
- No manual changes in production without migration scripts.
- Generate typed DB definitions if supported in the chosen setup.

### 8.4 Storage

- Enforce ownership rules (bucket policies).
- Validate file types and sizes.
- Never trust client metadata.

### 8.5 Secrets

- Use `.env.local` for local only.
- Never commit secrets.
- Use server-side environment access for secure values.

---

## 9) Next.js App Router Rules

### 9.1 Server vs Client components

- Default to **Server Components**.
- Mark `use client` only when needed:
  - interactive UI state
  - browser-only APIs
  - complex client-side editors

### 9.2 Routing & layouts

- Use nested layouts for consistent shell.
- Keep pages thin; move logic into feature modules.

### 9.3 Server Actions / Route Handlers

- Use latest recommended pattern from Next docs.
- Always validate inputs.
- Ensure auth checks before DB writes.
- Return typed results.

### 9.4 Caching

- Use caching intentionally.
- Never cache user-private data incorrectly.
- Confirm caching semantics in Next docs before applying.

---

## 10) Performance Rules

- Avoid heavy client bundles:
  - dynamic import heavy editors
- Debounce search inputs.
- Use virtualization for large lists.
- Avoid N+1 DB patterns.
- Always measure before optimizing.

---

## 11) Anti-Patterns (forbidden)

- Duplicating components that already exist (shadcn or local).
- Giant components with mixed responsibilities.
- Guessing API behavior without docs.
- Disabling RLS or using wide-open policies.
- Storing secrets in client-side code.
- Logging sensitive content (note text, tokens, keys).
- “Quick hacks” left without a TODO and issue reference.

---

## 12) When adding a new feature (checklist)

- [ ] Is there an existing component/util I can reuse?
- [ ] Does shadcn/ui already provide this?
- [ ] Do we need a client component, or can it be server?
- [ ] Are inputs validated with zod?
- [ ] Are RLS policies correct?
- [ ] Are errors handled and safe?
- [ ] Is the change small and testable?
- [ ] Does this keep note-taking fast?

---

## 13) Default Quality Bar

If you can’t implement something confidently using official docs and safe patterns, **do not implement it**.
Escalate with options and request clarification.
