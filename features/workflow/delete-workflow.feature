@workflow @delete-book
Feature: Delete book workflow
  As an authorized user
  I want to delete a book
  So that unwanted catalog entries can be removed

  Background:
    Common authenticated setup for delete-book workflow scenarios.
    Given I navigate to "login" page
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Delete a newly created book
    When I add a new book to the inventory
    And I delete the newly created book
    Then I should be in the "books list" page
