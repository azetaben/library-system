# Framework Contributing Guide

This guide defines the minimum engineering rules for extending the UI automation framework in its current Cucumber-first layout.

## Design Rules

- Put user actions, navigation, and orchestration in `*Steps.ts`.
- Put assertion-heavy verification in `*Assertions.ts`.
- Keep page objects in `e2e-tests/pages` focused on locators and deterministic UI actions.
- Do not add raw `expect(...)` calls to non-assertion step files.
- Reuse shared helpers from `e2e-tests/helperUtilities` and `e2e-tests/utils` instead of duplicating formatting, waiting, or validation logic.

## Feature Rules

- Keep executable workflow examples in `features/workflow`.
- Keep business coverage in the behavior folders under `features/`, such as `auth`, `create-book`, `edit-book`, `security`, and `ui-test`.
- Only encode behavior the deployed application actually enforces.
- If the product currently violates the requirement, tag the scenario `@bug` so it stays out of the default profile.
- Prefer reachable negative tests over impossible UI states.

## Test Data Rules

- Prefer `BookFactory`, `TestData`, and typed helpers over inline ad hoc payloads.
- Use unique generated data for flows that create or update shared records.
- Reset scenario data through hooks rather than carrying state between scenarios manually.

## Assertion Rules

- Keep catalog normalization in shared helpers.
- For negative validation, assert only behaviors the UI actually shows:
  - inline field errors
  - native browser validation
  - summary alerts
  - rejected navigation or submission
  - unchanged catalog state
- Do not assert speculative business rules that the app does not currently enforce.

## Tagging Rules

- `@smoke` for fast high-signal supported coverage.
- `@regression` for broader supported coverage.
- `@bug` for known application gaps excluded from the default profile.
- `@workflow` for executable example scenarios under `features/workflow`.
- `@performance`, `@security`, and feature-specific tags only when they drive a meaningful run or report split.

## Runtime Rules

- The active runner is local `@cucumber/cucumber` through `node --import tsx`.
- Support code must resolve the same local Cucumber instance as the runner.
- On PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.
- Use `npm.cmd run test:dry-run` as the cheapest verification after step-definition or support-code changes.

## Pull Request Checklist

- [ ] New steps follow the `*Steps.ts` and `*Assertions.ts` split.
- [ ] New feature expectations match real product behavior.
- [ ] New data-writing flows use unique generated data.
- [ ] Shared helpers are reused instead of duplicating waits, formatting, or payload shaping.
- [ ] Tags reflect execution intent, especially `@bug` and `@workflow`.
- [ ] `npm.cmd run test:dry-run` passes after the change.
