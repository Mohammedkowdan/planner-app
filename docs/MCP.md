# MCP.md

## Mission Context and Plan
This file is the execution brief for upgrading `planner-app`.

The project already contains real Prisma-backed planning features, but it is architecturally mixed with legacy localStorage behavior and partial mock pages. The goal is to stabilize the platform first, then add a robust **Annual Reports** domain and XLSX importer based on the uploaded annual-report workbook.

---

## Primary Objective
Deliver a cleaner, more production-ready planning system with a new annual-report module that:
- stores report/project/location data in PostgreSQL via Prisma
- imports the existing XLSX workbook safely
- supports preview before commit
- preserves organization/department isolation
- leaves the overall codebase better structured than before

---

## What Exists Today

### Technology
- Next.js 16 App Router
- React 19
- Prisma 7 + PostgreSQL
- Server Actions
- Zod
- Shadcn-based UI

### Relevant existing domains
- users/auth
- planning years
- programs
- indicators
- activities
- implementation reports
- dashboard/calendar/notifications

### Architectural problem today
The app mixes two worlds:
1. real DB-backed code using Prisma
2. legacy localStorage/mock-shaped code

This must be resolved before the new module is considered complete.

---

## Mission Boundaries

### In scope
- codebase stabilization and cleanup needed for safe enhancement work
- Prisma schema improvements relevant to current project health
- annual-report bounded context
- XLSX importer workflow
- reporting pages for annual reports
- import issue tracking and validation

### Out of scope for this mission
- rewriting the whole app from scratch
- replacing auth system wholesale
- introducing a second backend framework
- building advanced BI dashboards beyond what is needed for annual reports
- scheduled jobs / email delivery / PDF export unless trivial after core work is stable

---

## High-Level Execution Order

### Phase 1 — Stabilize the current codebase
- remove `ignoreBuildErrors` from `next.config.mjs`
- make type checking pass
- fix enum mismatches
- fix invalid Prisma `update/delete` ownership patterns
- identify legacy localStorage usage and stop it from expanding
- keep only one real login entry path

### Phase 2 — Harden current data model
- convert financial fields from `Float` to `Decimal`
- convert stringified JSON fields to `Json`
- add missing indexes / constraints where appropriate
- centralize repeated auth/scope checks into reusable helpers if needed

### Phase 3 — Add annual-report schema
Add a separate domain in Prisma:
- `AnnualReport`
- `Sector`
- `Donor`
- `Governorate`
- `District`
- `AnnualReportProject`
- `ProjectLocation`
- `AnnualReportImport`
- `AnnualReportImportIssue`

Do not merge this into `Program`.

### Phase 4 — Build XLSX import pipeline
- add upload endpoint via Route Handler
- parse workbook with ExcelJS
- normalize strings and data types
- validate and persist import warnings/errors
- support preview before commit
- commit using a single transaction

### Phase 5 — Build UI for annual reports
- annual report list page
- annual report detail page
- import page with preview
- basic filtering by year / sector / donor / governorate

### Phase 6 — Connect and finish
- connect reports page to real data where appropriate
- ensure no regression in planning flows
- produce migration-safe final result

---

## Exact Technical Direction

### A. Database source of truth
The database is the truth. No new feature should rely on localStorage for persistent business data.

### B. Import strategy
Use a staged flow:
1. upload file
2. parse workbook
3. build preview DTOs
4. validate and store issues
5. commit to DB only after explicit confirmation

### C. Parsing style
The workbook is semi-structured and contains merged cells. Use fixed cell references plus row-range parsing. Do not treat it as a flat header-based table.

### D. Summary sheet handling
Do not import the summary sheet as canonical rows. Use it only for cross-checking.

### E. Multi-tenant handling
New annual-report records must include the same organization/department scoping model used by the rest of the project.

---

## Suggested Files To Create

### New Prisma and backend files
- `actions/annual-reports.ts`
- `app/api/annual-reports/import/route.ts`
- `modules/annual-reports/types.ts`
- `modules/annual-reports/schema.ts`
- `modules/annual-reports/normalizers.ts`
- `modules/annual-reports/parser.ts`
- `modules/annual-reports/validators.ts`
- `modules/annual-reports/mapper.ts`
- `modules/annual-reports/repository.ts`
- `modules/annual-reports/service.ts`
- `modules/annual-reports/queries.ts`

### New UI files
- `app/annual-reports/page.tsx`
- `app/annual-reports/[reportId]/page.tsx`
- `app/annual-reports/import/page.tsx`
- optional supporting client components under `components/annual-reports/*`

---

## Existing Files Likely To Be Modified
- `next.config.mjs`
- `package.json`
- `prisma/schema.prisma`
- `actions/planning.ts`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/reports/page.tsx`
- any component/action still coupled to localStorage data contracts

---

## Data-Model Intent For Annual Reports

### Recommended entity meaning
- `AnnualReport`: one annual workbook/report scope
- `AnnualReportProject`: one project represented by one numbered sheet
- `ProjectLocation`: one location row under a project
- `Sector`, `Donor`, `Governorate`, `District`: normalized reference entities
- `AnnualReportImport`: one upload/import execution record
- `AnnualReportImportIssue`: warnings/errors discovered during parsing/validation

### Important modeling decisions
- use `cuid()` to stay consistent with the current project
- use `Decimal` for budgets
- use `Json` for raw meta / raw values when useful
- use explicit indexes and unique constraints
- use explicit relation behaviors

---

## Parsing and Validation Intent

### Expected workbook behavior
- sheets `1..14` are potential project sheets
- summary sheet exists and should not be blindly imported
- some fields may be blank, merged, or formula-derived
- file name, top header, and real content may disagree on year/sector

### Validation categories
- file-level warnings
- sheet-level warnings
- project-level validation
- location-level validation
- reference-data matching warnings
- total cross-check mismatches

### Validation result policy
- warnings should not always block import
- hard structural errors should block final commit
- all issues should be persisted and reviewable

---

## Recommended Acceptance Gates
A phase is not complete until:

### Stabilization gate
- `npx tsc --noEmit` passes
- project no longer hides TS build errors
- no obvious invalid Prisma ownership update/delete logic remains

### Schema gate
- Prisma schema validates
- migration SQL is reviewed before apply
- existing data is preserved safely

### Import gate
- workbook can be uploaded and parsed
- preview screen shows extracted projects/locations
- warnings/errors are visible
- commit writes clean records in one transaction

### Final gate
- annual-report pages are usable
- old planning features still work
- tenant isolation still works
- code is easier to maintain than before

---

## Delivery Mindset
This mission is not just about adding tables.
It is about **turning a mixed prototype into a more disciplined product** while adding a major new capability.

Prefer a clean phased implementation over a giant risky rewrite.
