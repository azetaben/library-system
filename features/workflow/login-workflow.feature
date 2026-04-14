@workflow @login
Feature: Login workflow
  As an application user
  I want to sign in successfully
  So that I can access protected pages

  Background:
    Common navigation setup for login workflow scenarios.
    Given I navigate to "login" page
    And I should be in the "login" page

  Scenario: User logs in successfully
    When I login with username "admin" and password "admin"
    Then I should be in the "books list" page
    And I should be authenticated as "Welcome, Admin!"
