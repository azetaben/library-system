# Framework Improvement Backlog

This backlog tracks framework improvements against the current repository layout and execution model.

Status key:

- `[ ]` not started
- `[~]` in progress
- `[x]` completed

## P0 Reliability

- [ ] Clean up contradictory feature expectations in high-value suites.
      Exit criterion: no default regression scenario expects behavior the deployed app does not enforce.
      Initial scope:
  - `features/create-book/TC-08-add-a-book.feature`
  - `features/auth/TC-05-login-logout.feature`
  - `features/security/TC-06-login_security.feature`

- [ ] Align report-generation wiring with the checked-in repo layout.
      Exit criterion: `report:cucumber` and `report:pdf` run from versioned script locations without path drift.
      Current gap:
  - helper scripts are versioned under `docs/`
  - `package.json` still points those commands at a missing `scripts/` directory

- [ ] Separate supported behavior from known product gaps using tags and pipeline policy.
      Exit criterion: the main suite fails only on regressions, not acknowledged defects.
      Actions:
  - keep `@bug` out of the default profile
  - add a separate non-blocking run for `@bug` scenarios

- [ ] Standardize negative-validation coverage rules.
      Exit criterion: invalid-data tests assert only behavior the UI or API really enforces.
      Actions:
  - prefer inline error, native validation, summary alert, rejection, or unchanged catalog state
  - remove speculative business-rule assertions from features

- [ ] Remove ambiguous critical-flow actions.
      Exit criterion: login, logout, and retention steps clearly distinguish between required outcomes and best-effort actions.

- [ ] Add richer runtime failure context to assertions.
      Exit criterion: most failures are diagnosable from one report without rerunning locally.
      Candidate additions:
  - submitted payload
  - current URL
  - expected page
  - before and after row count
  - visible heading

- [ ] Stabilize performance checks by environment tier.
      Exit criterion: performance checks measure regressions, not hosting noise.

## P1 Maintainability

- [x] Centralize text, currency, and date normalization.
      Exit criterion: one shared normalization path is used for catalog assertions.

- [ ] Introduce canonical data builders for valid and invalid cases.
      Exit criterion: curated typed fixtures replace repeated ad hoc negative-data tables where useful.
      Actions:
  - extend `BookFactory`
  - add invalid-case builders for required-field and rejected-value cases

- [ ] Enforce step-definition design rules.
      Exit criterion: `*Steps.ts` remains action-focused and `*Assertions.ts` remains verification-focused.

- [ ] Reduce duplicate and vague step phrases.
      Exit criterion: fewer overlapping step definitions and clearer failure semantics.
      Candidates:
  - `can see`
  - `remain on page`
  - `should be redirected`
  - `not visible`

- [x] Add a lightweight framework contribution guide.
      Exit criterion: new tests follow consistent tagging, data, and step-file boundaries.

- [ ] Define a minimal stable smoke subset.
      Exit criterion: a fast high-signal suite exists for PR and CI gating.
      Minimum coverage:
  - login
  - books catalog visibility
  - add book happy path
  - edit book happy path

- [ ] Review the `features/workflow` folder as executable documentation.
      Exit criterion: workflow scenarios stay minimal, representative, and aligned with reusable step phrasing.

## P2 Architecture Cleanup

- [ ] Refactor page objects to be UI-only.
      Exit criterion: page objects expose locators and deterministic UI actions, not scenario logic.
      Focus files:
  - `e2e-tests/pages/AddBookPage.ts`
  - `e2e-tests/pages/EditBookPage.ts`
  - `e2e-tests/pages/BooksCatalogPage.ts`

- [ ] Create a shared form-validation abstraction.
      Exit criterion: add/edit validation logic uses one reusable model for required-field detection, native validation, and alert-summary parsing.

- [ ] Split execution profiles by intent.
      Exit criterion: suite categories have clear purpose and failure policy.
      Target profiles:
  - `smoke`
  - `regression`
  - `bug`
  - `performance`
  - `security`
  - `workflow`

- [ ] Improve scenario observability artifacts.
      Exit criterion: reports include enough state to debug failures quickly.
      Candidate artifacts:
  - normalized payload snapshot
  - visible page state
  - validation response details
  - catalog before and after evidence

- [ ] Add network-aware negative assertions where possible.
      Exit criterion: negative tests distinguish frontend validation failures from backend acceptance.

- [ ] Review and normalize the legacy scenario inventory.
      Exit criterion: outdated CRUD, auth, and security scenarios no longer encode obsolete expectations.
      Initial review targets:
  - `features/e2e/TC-12-books-crud-journey.e2e.feature`
  - `features/auth/TC-05-login-logout.feature`
  - `features/security/TC-06-login_security.feature`

## Suggested Order

- [ ] Stage 1: reliability cleanup for auth, logout, create-book, and security expectations.
- [ ] Stage 2: align report script locations and CI execution paths.
- [ ] Stage 3: expand canonical data builders and reduce duplicate step phrasing.
- [ ] Stage 4: keep workflow features and contribution rules synchronized.
- [ ] Stage 5: page-object and validation-abstraction refactor.
