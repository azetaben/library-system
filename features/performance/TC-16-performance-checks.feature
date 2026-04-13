@regression @performance
Feature: Performance checks
  As an application user
  I want the main pages to meet practical speed expectations
  So that performance regressions are detected before release

  Background:
    Common starting point for measuring performance characteristics from the application entry page.
    Given I navigate to "/"

  @regression @performance @landing
  Scenario: Landing page performance checks
    Then the page load time should be less than 5000 milliseconds

  @regression @performance @login
  Scenario: Login page performance checks
    When I tap on the "Start Testing" button
    Then the page load time should be less than 5000 milliseconds

  @regression @performance @books-catalog
  Scenario: Books catalog page performance checks
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control              |
      | Log Out              |
      | Book List            |
      | Edit                 |
      | Delete               |
      | Add Book             |
      | Previous             |
      | Next                 |
      | Page 1 of 1          |
      | Total Book Titles: 3 |
    Then the page load time should be less than 5000 milliseconds

  @regression @performance @add-book
  Scenario: Add book page performance checks
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"
    And I should be authenticated as "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control              |
      | Log Out              |
      | Book List            |
      | Edit                 |
      | Delete               |
      | Add Book             |
      | Previous             |
      | Next                 |
      | Page 1 of 1          |
      | Total Book Titles: 3 |
        When I tap on the "Add Book" button
    Then the page load time should be less than 5000 milliseconds

  @regression @performance @edit-book
  Scenario: Edit book page performance checks
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"
    And I should be authenticated as "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control              |
      | Log Out              |
      | Book List            |
      | Edit                 |
      | Delete               |
      | Add Book             |
      | Previous             |
      | Next                 |
      | Page 1 of 1          |
      | Total Book Titles: 3 |
    When I tap on the "Edit" button for the first book in the list
    Then the page load time should be less than 5000 milliseconds

