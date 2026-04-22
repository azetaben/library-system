@regression @auth @session @cookie-bypass
Feature: Login functionality with cookie bypass
  As an authenticated user
  I want an existing session cookie to restore access
  So that I can resume work without logging in again

  Background:
    Common session-restoration setup for scenarios that validate cookie-based access recovery.
    Given I restore the session to the books catalog page

  @regression @session @catalog @Critical
  Scenario: restore a session directly to the books catalog
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I should see the "Book List" page with the correct heading

  @regression @session @catalog @Critical
  Scenario: reuse a saved session without entering credentials again
    And I should see the "Book List" page with the correct heading
    And the "books list" page url, title, and heading should be correct

  @regression @session @add-book @Critical
  Scenario: reuse a saved session without entering credentials again to access add book page
    And I should see the "Book List" page with the correct heading
    And the "books list" page url, title, and heading should be correct
    When I click on the "Add Book" button
    Then the "add a new book" page url, title, and heading should be correct

  @regression @session @edit-book
  Scenario: reuse a saved session without entering credentials again to access edit book page
    And I should see the "Book List" page with the correct heading
    And the "books" page url, title, and heading should be correct
    And I click on the "Edit" button for a book in the catalog
    Given I am in the "Edit book details" page
    And the "Edit Book" page url, title, and heading should be correct
