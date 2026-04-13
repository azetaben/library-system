# Test Workflows

This document captures practical BDD workflow patterns for the Books Inventory automation framework.

## Login Workflow

Use this workflow when a scenario needs an authenticated user before accessing protected pages.

```gherkin
Feature: Login workflow
  As an application user
  I want to sign in successfully
  So that I can access protected pages

  Background:
    Common navigation setup for login-based scenarios.
    Given I navigate to "login" page

  Scenario: User logs in successfully
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page
    And I should be authenticated as "Welcome, Admin!"
```

## Add Book Workflow

Use this workflow when the scenario verifies successful book creation.

```gherkin
Feature: Add book workflow
  As an authorized user
  I want to add a new book
  So that the catalog stays up to date

  Background:
    Common authenticated setup for add-book scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Add a book successfully
    When I click on the "Add Book" button
    Then I should be in the "Add a New Book" page
    When I complete and submit the add book form with unique valid data
    Then the newly created unique book should be listed in the books catalog with the correct details
```

## Edit Book Workflow

Use this workflow when the scenario updates an existing book.

```gherkin
Feature: Edit book workflow
  As an authorized user
  I want to edit an existing book
  So that catalog details remain accurate

  Background:
    Common authenticated setup for edit-book scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Edit the first book
    When I tap on the "Edit" button for the first book in the list
    Then I should be in the "Edit book details" page
```

## Delete Book Workflow

Use this workflow when the scenario removes a book from the catalog.

```gherkin
Feature: Delete book workflow
  As an authorized user
  I want to delete a book
  So that unwanted catalog entries can be removed

  Background:
    Common authenticated setup for delete-book scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Delete a newly created book
    When I add a new book to the inventory
    And I delete the newly created book
    Then I should be in the "books list" page
```

## Add Book Validation Workflow

Use this workflow when the scenario verifies required-field behavior on the add-book page.

```gherkin
Feature: Add book validation workflow
  As an authorized user
  I want invalid book submissions to be rejected
  So that incomplete catalog entries are not created

  Background:
    Common authenticated add-book setup for validation scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    And I click on the "Add Book" button
    Then I should be in the "Add a New Book" page

  Scenario: Required field validation
    When I submit the "Add Book" form without filling any details
    Then I should remain on the add book page
    And I should see required field validation errors for:
      | Field            | Error Message                 |
      | Title            | Title is required.            |
      | Author           | Author is required.           |
      | Genre            | Genre is required.            |
      | ISBN             | ISBN is required.             |
      | Publication Date | Publication Date is required. |
      | Price            | Price is required.            |
```

## Logout Workflow

Use this workflow when the scenario validates logout behavior or known logout gaps.

```gherkin
Feature: Logout workflow
  As an authenticated user
  I want to end my session
  So that access to protected pages is stopped or clearly assessed

  Background:
    Common authenticated setup for logout scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Logout from the books page
    When I tap on the "Logout" button
    Then I should be in the "books list" page
```

## Security Workflow

Use this workflow when the scenario checks unauthorized direct navigation or attack-style input.

```gherkin
Feature: Security workflow
  As a security-conscious application owner
  I want unauthorized access attempts to be exercised
  So that protection gaps are visible in the test suite

  Scenario: Direct navigation to a protected route
    When I attempt to navigate directly to the add book page
    Then I should be in the "Add a New Book" page
```

## Responsive Workflow

Use this workflow when the scenario validates responsive layout behavior across screen sizes.

```gherkin
Feature: Responsive workflow
  As a user on different devices
  I want the landing page to adapt to my viewport
  So that the interface remains usable on multiple screen sizes

  Background:
    Common responsive-entry setup for viewport checks.
    Given I navigate to the landing page when the API is responsive

  Scenario: Validate common viewport sizes
    Then the page should be responsive on the following screen sizes:
      | width | height |
      | 320   | 480    |
      | 375   | 667    |
      | 768   | 1024   |
      | 1440  | 900    |
```

## Authoring Guidance

- Keep feature files business-readable by default.
- Use stricter URL/title/header checks in dedicated UI-contract scenarios.
- Reuse shared navigation steps instead of creating new page-specific variants unless the wording is meaningfully different.
- Prefer canonical page assertions such as `I should be in the "..." page`.
- Tag known application defects with `@bug` so they do not block the default regression path.
- Keep action steps in `*Steps.ts` and verification steps in `*Assertions.ts`.
