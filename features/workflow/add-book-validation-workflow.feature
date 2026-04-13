@workflow @add-book @validation
Feature: Add book validation workflow
  As an authorized user
  I want invalid book submissions to be rejected
  So that incomplete catalog entries are not created

  Background:
    Common authenticated add-book setup for validation workflow scenarios.
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
