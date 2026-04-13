# Framework Improvement Backlog

This backlog tracks framework improvements by priority.

Status key:
- `[ ]` not started
- `[~]` in progress
- `[x]` completed

## P0 Reliability

- [ ] Clean up contradictory feature expectations in high-value suites.
  Exit criterion: no regression scenario expects behavior the deployed app does not enforce.
  Initial scope:
  - `features/create-book/TC-08-add-a-book.feature`
  - `features/auth/TC-05-login-logout.feature`
  - `features/security/TC-06-login_security.feature`

- [ ] Separate supported behavior from known product gaps using tags and pipeline policy.
  Exit criterion: main suite fails only on real regressions, not on acknowledged defects.
  Actions:
  - keep `@bug` out of default CI
  - add a separate non-blocking run for `@bug` and gap scenarios

- [ ] Standardize negative-validation coverage rules.
  Exit criterion: invalid-data tests assert only behaviors the UI/API really enforces.
  Actions:
  - prefer inline error, native validation, summary alert, rejection, or unchanged catalog state
  - remove speculative business-rule assertions from features

- [ ] Remove ambiguous critical-flow actions.
  Exit criterion: login, logout, and page-retention steps clearly distinguish between:
  - must succeed
  - attempt if present

- [ ] Add richer runtime failure context to assertions.
  Exit criterion: most failures are diagnosable from one report without rerunning locally.
  Add to failures where relevant:
  - submitted payload
  - current URL
  - expected page
  - before/after row count
  - visible heading

- [ ] Stabilize performance checks by environment tier.
  Exit criterion: performance checks measure regressions, not hosting noise.
  Actions:
  - keep realistic thresholds for deployed environments
  - use stricter budgets only in controlled environments

## P1 Maintainability

- [x] Centralize text, currency, and date normalization.
  Exit criterion: one shared normalization path is used for catalog text assertions.
  Refactor targets:
  - `e2e-tests/steps/addBookAssertions.ts`
  - `e2e-tests/steps/editBookAssertions.ts`
  - `e2e-tests/steps/booksCatalogAssertions.ts`

- [ ] Introduce canonical data builders for valid and invalid cases.
  Exit criterion: curated typed fixtures replace repeated ad hoc negative-data tables where appropriate.
  Actions:
  - extend `BookFactory`
  - add invalid-case builders for required-field and rejected-value cases

- [ ] Enforce step-definition design rules.
  Exit criterion: `*Steps.ts` remains action-only and `*Assertions.ts` remains verification-only.
  Rules:
  - no raw `expect(...)` in non-assertion step files
  - use shared assertion helpers instead of inline duplicated logic

- [ ] Reduce duplicate and vague step phrases.
  Exit criterion: fewer overlapping step definitions and clearer failure semantics.
  Candidates:
  - “can see”
  - “remain on page”
  - “should be redirected”
  - “not visible”

- [x] Add a lightweight framework contribution guide.
  Exit criterion: new tests follow consistent tagging, data, and step-file boundaries.
  Suggested content:
  - tag policy
  - step/assertion split
  - data-builder usage
  - when to use `@bug`

- [ ] Define a minimal stable smoke subset.
  Exit criterion: a fast high-signal suite exists for PR and CI gating.
  Minimum coverage:
  - login
  - books catalog visibility
  - add book happy path
  - edit book happy path

## P2 Architecture Cleanup

- [ ] Refactor page objects to be UI-only.
  Exit criterion: page objects expose locators and deterministic UI actions, not scenario logic.
  Focus files:
  - `e2e-tests/pages/AddBookPage.ts`
  - `e2e-tests/pages/EditBookPage.ts`
  - `e2e-tests/pages/BooksCatalogPage.ts`

- [ ] Create a shared form-validation abstraction.
  Exit criterion: add/edit validation logic uses one reusable model for:
  - required-field detection
  - browser validation
  - alert-summary parsing

- [ ] Split execution profiles by intent.
  Exit criterion: suite categories have clear purpose and failure policy.
  Target profiles:
  - `smoke`
  - `regression`
  - `bug`
  - `performance`
  - `security`

- [ ] Improve scenario observability artifacts.
  Exit criterion: reports include enough state to debug failures quickly.
  Candidate artifacts:
  - normalized payload snapshot
  - visible page state
  - validation response details
  - catalog before/after evidence

- [ ] Add network-aware negative assertions where possible.
  Exit criterion: negative tests distinguish frontend validation failures from backend acceptance.
  Actions:
  - capture relevant request/response state
  - assert rejection at network level when the UI alone is ambiguous

- [ ] Review and normalize legacy scenario inventory.
  Exit criterion: outdated CRUD/auth/security scenarios no longer encode obsolete expectations.
  Initial review targets:
  - `features/e2e/TC-12-books-crud-journey.e2e.feature`
  - `features/auth/TC-05-login-logout.feature`
  - `features/security/TC-06-login_security.feature`

## Suggested Order

- [ ] Stage 1: P0 feature and data cleanup for add-book, auth/logout, and security gap scenarios.
- [ ] Stage 2: P0 suite separation for `@bug` and non-blocking gap coverage.
- [ ] Stage 3: P1 shared normalization utilities and data builders.
- [ ] Stage 4: P1 governance for step design and contribution rules.
- [ ] Stage 5: P2 page-object and validation-abstraction refactor.
