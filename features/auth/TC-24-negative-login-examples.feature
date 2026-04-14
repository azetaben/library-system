@regression @auth @login @negative
Feature: Negative login examples backed by the login data factory
  As an application user
  I want invalid login payloads to be rejected consistently
  So that negative authentication coverage is reusable and easy to extend

  Background:
    Given I navigate to "/login"
    Then the "login" page url, title, and heading should be correct
    And I should be in the "login" page

  @regression @login @negative
  Scenario: Reject an unregistered username from the login data factory
    When I login with negative login example "unknown-user"
    Then I should see an authentication error message "Invalid username or password"
    And I should be in the "login" page

  @regression @login @negative
  Scenario: Reject a wrong password from the login data factory
    When I login with negative login example "wrong-password"
    Then I should see an authentication error message "Invalid username or password"
    And I should be in the "login" page

  @regression @login @negative @validation
  Scenario: Reject empty credentials from the login data factory
    When I login with negative login example "empty-credentials"
    Then I should see an authentication error message "Please enter your username"
    And I should be in the "login" page

  @regression @login @negative @security
  Scenario: Reject SQL injection style credentials from the login data factory
    When I login with negative login example "sql-injection"
    Then I should see an authentication error message "Invalid username or password"
    And I should be in the "login" page
