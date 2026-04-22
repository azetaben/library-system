@regression @e2e @edit-book @validation @strict-navigation
Feature: Edit book page strict validation and logout retention checks
  As a Senior Test Automation Engineer
  I want stronger end-to-end coverage around the edit page
  So that field-level validation and current logout-retention behavior are clearly exercised

  Background:
    Common authenticated edit-page setup so each scenario starts from the edit form for an existing book.
    Given I navigate to "/"
    Then the "landing" page url, title, and heading should be correct
    When I tap on the "Start Testing" button
    Then the "login" page url, title, and heading should be correct
    And the page URL should include path "/login"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Login"
    When I login with username "admin" and password "admin"
    Then the "books" page url, title, and heading should be correct
    And the page URL should be "/books"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Book List"
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    When I click the "Edit" action for book "The Very Busy Spider"
    Then the "Edit Book" page url, title, and heading should be correct
    And the page URL should include path "/edit-book"
    And the page title should exactly be "Books Inventory App"
    And I can verify the edit book page
    And I can see the "Edit book details" form labels:
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    And I verify the edit book input fields are visible and fillable
    And I verify the "Save Changes" button is visible and clickable

  @critical
  Scenario Outline: Edit page shows validation warning for each required field and keeps the user on the edit page
    When I clear the "<Field>" field
    And I click the "Save Changes" button
    Then the "Edit Book" page url, title, and heading should be correct
    And the page URL should include path "/edit-book"
    And the page title should exactly be "Books Inventory App"
    And I verify the "<Field>" field validation message is displayed
    And I should see a required field validation error for "<Field>"
    And I should remain on the "edit book" form page
    And I verify the "Save Changes" button is visible and clickable

    Examples:
      | Field            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |

  @logout @critical
  Scenario: Clicking logout from the edit page leaves the user on edit instead of returning to login
    And I should see "Log Out" button on the top right page
    And I should be authenticated as "Welcome, Admin!"
    When I tap on the "Logout" button
    Then the "Edit Book" page url, title, and heading should be correct
    And the page URL should include path "/edit-book"
    But I can see page URL include path "/edit-book" instead of "/login"
    And the page title should exactly be "Books Inventory App"
    And the welcome message should not be visible
    And the button and link below are not present and visible
      | label           |
      | Log Out         |
      | Welcome, Admin! |
    And the "Log Out" button should not be visible on the "Edit book details" page
