@workflow @add-book
Feature: Add book workflow
  As an authorized user
  I want to add a new book
  So that the catalog stays up to date

  Background:
    Common authenticated setup for add-book workflow scenarios.
    Given I navigate to "login" page
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Add a book successfully
    And I should be in the "Book List" page
    When I click on the "Add Book" button
    Then I should be in the "Add a New Book" page
    When I complete and submit the add book form with unique valid data
    Then the newly created unique book should be listed in the books catalog with the correct details
