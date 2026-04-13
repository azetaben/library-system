@workflow @edit-book
Feature: Edit book workflow
  As an authorized user
  I want to edit an existing book
  So that catalog details remain accurate

  Background:
    Common authenticated setup for edit-book workflow scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Edit the first book
    When I tap on the "Edit" button for the first book in the list
    Then I should be in the "Edit book details" page
