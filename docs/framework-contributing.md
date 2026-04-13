# Framework Contributing Guide

This guide defines the minimum engineering rules for extending the UI automation framework.

## Design Rules

- Put navigation and user actions in `*Steps.ts`.
- Put verification logic and assertion-heavy `Then` steps in `*Assertions.ts`.
- Keep page objects in `e2e-tests/pages` focused on locators and deterministic UI actions.
- Do not add raw `expect(...)` calls to non-assertion step files.
- Prefer shared helpers over copying formatting or validation logic between files.

## Feature Rules

- Only encode behavior the application actually enforces.
- If the product currently violates the requirement, tag the scenario `@bug` instead of forcing it into the default run.
- Do not use impossible UI states as negative tests.
  Examples:
  - invalid `<select>` values that are not present in the DOM
  - unsupported routes that cannot be reached by the user flow being tested

## Test Data Rules

- Prefer factories and typed builders for valid and invalid data.
- Use unique generated data for create/update flows that write to shared state.
- Keep repeated business examples centralized when they are used by multiple scenarios.

## Assertion Rules

- Normalize catalog dates and currency using shared utilities.
- When validating negative flows, assert one of the following:
  - inline field error
  - native browser validation
  - form summary alert
  - redirect rejection
  - unchanged catalog state
- Do not assert speculative validation rules unless the UI or API really enforces them.

## Tagging Rules

- `@smoke` for fast high-signal supported coverage.
- `@regression` for broader supported coverage.
- `@bug` for known application gaps that must not fail the default suite.
- `@performance` and `@security` for specialized runs with their own expectations.

## Pull Request Checklist

- [ ] New steps follow the `*Steps.ts` / `*Assertions.ts` split.
- [ ] New feature expectations match actual product behavior.
- [ ] New data-writing flows use unique test data.
- [ ] Shared normalization helpers are used instead of duplicated formatting logic.
- [ ] `npm.cmd run test:dry-run` passes after the change.
