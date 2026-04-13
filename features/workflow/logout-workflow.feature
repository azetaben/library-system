@workflow @logout
Feature: Logout workflow
  As an authenticated user
  I want to end my session
  So that access to protected pages is stopped or clearly assessed

  Background:
    Common authenticated setup for logout workflow scenarios.
    Given I navigate to "login" page
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page

  Scenario: Logout from the books page
    When I tap on the "Logout" button
    Then I should be in the "books list" page
