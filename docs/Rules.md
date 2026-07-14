# Rules.md

## Operating Rules For This Mission
These rules are mandatory. Do not violate them unless the human owner explicitly overrides them.

---

## 1. Protect the architecture
Do not add features in ways that deepen the prototype/production split.
Every change should reduce architectural debt, not increase it.

---

## 2. Database is the only real source of truth
Do not build new persistence on top of:
- localStorage
- client-only mock stores
- hard-coded arrays pretending to be real data

Legacy code may be bridged temporarily, but not expanded.

---

## 3. Do not merge annual-report data into the wrong domain
Do **not** force the workbook into existing `Program` or `Activity` entities.
Create and preserve a separate annual-report bounded context.

---

## 4. No silent TypeScript failures
The project must not rely on ignored TS build errors.
Do not use `ignoreBuildErrors` as a solution.
Do not hide type problems behind careless `any`.

---

## 5. Fix, do not mask, Prisma ownership logic
If an operation needs ownership scoping, implement it correctly.
Do not write misleading `update/delete` code that assumes non-unique filters are valid unique selectors.

Preferred patterns:
- `findFirst` ownership check then `update/delete` by id
- `updateMany/deleteMany` when correct

---

## 6. Respect tenant boundaries everywhere
All business data must remain scoped by the intended tenant model.
If the current app uses organization and department scoping, the annual-report domain must also respect it.

No cross-tenant leakage.
No convenience shortcuts.

---

## 7. Use correct storage types
Mandatory preferences:
- money => `Decimal`
- structured JSON => Prisma `Json`
- timestamps => `DateTime`
- lists of issues / raw payloads => structured fields, not ad-hoc text blobs unless justified

Avoid:
- `Float` for currency
- stringified JSON where a structured field is available

---

## 8. Migrations must be reviewable and safe
Do not drop into reckless schema edits.
Workflow:
1. update Prisma schema
2. create migration in reviewable form
3. inspect generated SQL
4. adjust if needed
5. apply carefully

Never assume generated migration SQL is automatically perfect.

---

## 9. Import pipeline must be staged
Never implement workbook import as a blind insert.
The minimum import flow is:
1. upload
2. parse
3. preview
4. validate
5. confirm
6. commit in transaction

---

## 10. Summary formulas are not truth source
If the workbook contains totals or summary sheets, treat them as validation aids.
Do not import them as canonical source rows unless explicitly required.

---

## 11. Normalize Arabic names carefully
Governorates, districts, and similar strings may vary due to spacing, punctuation, hamza variants, and formatting differences.
Normalization must be consistent, conservative, and testable.

Do not destroy original raw values.
Keep raw value when needed for traceability.

---

## 12. Preserve traceability during import
Each import should be auditable.
The system should preserve:
- original file name
- parse/import status
- counts of warnings/errors
- sheet/row context for issues
- enough metadata to troubleshoot mismatches later

---

## 13. Build small modules, not giant files
Do not dump parser, validation, normalization, DB writes, and UI handling into one file.
Keep concerns separate.

At minimum separate:
- parser
- validators
- normalizers
- service/orchestration
- repository/DB logic
- UI pages

---

## 14. Prefer explicitness over magic
Use clear names.
Use explicit mapping logic.
Use small well-named helpers.
Avoid clever abstractions that hide business meaning.

---

## 15. Preserve existing features while refactoring
This is a live evolution, not a greenfield rewrite.
Do not break existing planning flows while adding annual reports.
If a risky refactor is needed, do it in small controlled steps.

---

## 16. One real login flow
Do not preserve duplicate auth entry points without reason.
Converge to one clean login experience and one clear routing behavior.

---

## 17. No new hard-coded organization/department logic
Do not multiply constants or manually duplicated tenant labels unless the current model absolutely requires a snapshot field.
Prefer normalized or centrally derived identity.

---

## 18. UI should reflect real backend reality
Pages labeled as reports, implementation, timeline, or settings should not remain decorative shells forever.
When touched, move them toward real DB-backed behavior.

---

## 19. Quality gates are mandatory
Before considering the mission done, ensure:
- type checks pass
- Prisma schema validates
- migrations are reviewed
- import preview works
- import transaction works
- existing modules still function

---

## 20. Leave the repo cleaner than you found it
Success is not “feature added.”
Success is:
- feature added
- debt reduced
- architecture clearer
- correctness improved
- future work easier
