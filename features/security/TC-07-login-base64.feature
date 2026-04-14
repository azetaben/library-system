@regression @auth @login @encoding
Feature: Login with Base64 encoded credentials
  As an application user
  I want encoded credential handling to be validated
  So that login behavior remains predictable when encoded inputs are used

  Background:
    Common authenticated login preparation for Base64 encoding scenarios.
    Given I navigate to "/login"
    And I should be in the "login" page

  @regression @login @encoding
  Scenario: Login with valid Base64 encoded credentials
    When I login with Base64 encoded credentials
      | username | YWRtaW4= |
      | password | YWRtaW4= |
    And I should be in the "Book List" page
    Then I should be authenticated as "Welcome, Admin!"

  @regression @login @encoding @negative
  Scenario: Login with invalid Base64 encoded credentials
    When I login with Base64 encoded credentials
      | username | d3JvbmdfdXNlcg== |
      | password | d3JvbmdfcGFzcw== |
    Then I should see an error message
