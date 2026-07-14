# Skills.md

## Mission
Upgrade the existing `planner-app` from a mixed prototype/production state into a clean, database-first planning platform, then add a new **Annual Reports** bounded context with a safe XLSX import pipeline based on the uploaded annual-report workbook.

The agent must optimize for:
- architecture clarity
- migration safety
- tenant isolation
- strict TypeScript correctness
- Prisma/PostgreSQL integrity
- maintainable import logic
- Arabic/Yemeni data normalization

---

## Project Stack You Must Master
- **Next.js 16 App Router**
- **React 19**
- **TypeScript** in strict mode
- **Server Actions** for small authenticated mutations
- **Route Handlers** for file upload and import endpoints
- **Prisma 7** with PostgreSQL
- **Zod** for validation
- **Shadcn UI** components already used in the project
- **ExcelJS** for workbook parsing
- **date-fns** for safe date formatting only, not business validation logic

---

## Current Codebase Reality
The codebase is not fully clean yet. It contains both a real database layer and legacy prototype patterns.

### Existing strengths
- Prisma schema already exists and is used in many flows
- Server Actions are already present in `actions/*`
- authentication/session utilities already exist in `lib/auth.ts`
- general dashboard shell and module pages already exist
- project is already aligned to App Router and can be evolved without rewriting everything

### Existing weaknesses you must actively fix
- `next.config.mjs` currently ignores TypeScript build errors
- there is still a **legacy localStorage data layer** in `lib/storage.ts` and `hooks/use-data.ts`
- some pages are still half-mock or weakly connected to database reality
- some Prisma update/delete calls misuse `where` as if composite ownership filters were unique keys
- enums and UI status values are not fully aligned
- financial values are stored as `Float`
- some JSON-like fields are stored as stringified JSON instead of `Json`
- org/department identity is duplicated as hard-coded strings in too many places

---

## Important Existing Files You Must Understand Before Changing Anything

### Core config
- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `prisma/schema.prisma`
- `lib/db.ts`
- `lib/auth.ts`

### Existing business actions
- `actions/auth.ts`
- `actions/planning.ts`
- `actions/dashboard.ts`
- `actions/users.ts`
- `actions/program-wallets.ts`

### Legacy code that must be phased out
- `lib/storage.ts`
- `hooks/use-data.ts`
- any component/page that still depends on localStorage-shaped data contracts

### Pages that should eventually become real DB-backed features
- `app/reports/page.tsx`
- `app/implementation/page.tsx`
- `app/timeline/page.tsx`
- `app/settings/page.tsx`

---

## Architectural Skills You Must Apply

### 1. Database-first thinking
Treat PostgreSQL + Prisma as the **single source of truth**.
Do not preserve or expand localStorage-based data logic except as temporary compatibility code during refactor.

### 2. Bounded-context design
Do **not** force the annual report workbook into the existing `Program` / `Activity` domain.
Create a separate annual-report domain.

Recommended domain models:
- `AnnualReport`
- `AnnualReportProject`
- `ProjectLocation`
- `Sector`
- `Donor`
- `Governorate`
- `District`
- `AnnualReportImport`
- `AnnualReportImportIssue`

### 3. Multi-tenant discipline
All data access must remain organization/department aware.
If the current project uses org/department scoping in existing entities, the new annual-report models must respect the same scoping policy.

### 4. Safe Prisma patterns
Use:
- `findFirst` + ownership check + `update`
- or `updateMany/deleteMany` where appropriate

Do not assume Prisma `update/delete` accepts arbitrary multi-field ownership filters unless those fields are part of a unique constraint.

### 5. TypeScript strictness
You must remove build-time silence and make the codebase pass type checking.
Do not patch around errors with `any` unless there is no clean short-term alternative.

### 6. Correct data modeling
Use:
- `Decimal` for money
- `Json` for structured JSON fields
- explicit indexes and unique constraints
- explicit relation behaviors

### 7. Import pipeline engineering
The Excel integration must support:
- upload
- parse
- preview
- validation
- transaction-based commit
- import issue tracking

Do not implement “upload file and blindly insert rows.”

---

## Workbook Parsing Skills You Must Apply
The uploaded workbook is **template-like**, not a flat dataset.

### Workbook facts
- sheets `1..14` represent project-style sheets
- there is a final summary sheet named similar to `الإجماليات`
- workbook has merged cells
- many data points live in fixed cell positions rather than standard headers
- totals are often formula-derived and should be treated as cross-checks, not truth source

### Parsing strategy
Use a **cell-map parser**, not a generic CSV-like header parser.

Expected extraction pattern per numbered sheet:
- sheet metadata in top rows
- project-level metadata from fixed cells / merged ranges
- location rows from the main table region
- row totals should be recalculated in code
- sheet totals and summary sheet should only validate, not drive inserts

### Data quality skills required
- Arabic whitespace normalization
- Arabic string normalization for governorates/districts
- tolerant date parsing
- tolerant number parsing
- warning/error recording when names do not match reference data

---

## Recommended Folder Strategy For New Work
Create a dedicated module:

```txt
modules/
  annual-reports/
    types.ts
    schema.ts
    normalizers.ts
    parser.ts
    validators.ts
    mapper.ts
    repository.ts
    service.ts
    queries.ts
```

And integrate with App Router via:

```txt
app/
  annual-reports/
    page.tsx
    [reportId]/page.tsx
    import/page.tsx
  api/
    annual-reports/
      import/route.ts

actions/
  annual-reports.ts
```

---

## Concrete Enhancements You Must Deliver

### Stabilization
1. remove TypeScript ignore-build setting
2. make `npx tsc --noEmit` pass
3. isolate or retire localStorage legacy layer
4. unify status enums between UI and Prisma
5. collapse duplicate login entry points into one clean flow

### Schema hardening
6. change money fields from `Float` to `Decimal`
7. change stringified JSON fields to Prisma `Json`
8. make ownership checks correct in all update/delete actions
9. improve index and relation definitions

### Annual-report integration
10. add the annual-report schema
11. build import history and issue tracking
12. build XLSX preview + commit pipeline
13. build annual report list/details pages
14. connect reporting pages to real DB data

---

## Minimum Definition of Done
The mission is not complete until all of the following are true:
- no ignored TypeScript build errors
- no new feature depends on localStorage as source of truth
- annual-report schema exists and migrates cleanly
- XLSX import can preview before commit
- import writes through one transaction
- import issues are persisted and reviewable
- annual-report pages read real database data
- existing planning features still work after refactor
- tenant boundaries still hold

---

## Quality Bar
Every change must be:
- explicit
- typed
- migration-safe
- reversible where possible
- scoped to the right tenant
- understandable by the next engineer

Do not optimize for speed at the cost of architecture.
Optimize for a codebase that is cleaner **after** the mission than before it.
