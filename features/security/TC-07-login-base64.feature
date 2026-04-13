@regression @auth @login @encoding
Feature: Login with Base64 encoded credentials
  As an application user
  I want encoded credential handling to be validated
  So that login behavior remains predictable when encoded inputs are used

  @regression @login @encoding
  Scenario: Login with valid Base64 encoded credentials
    Given I navigate to "/login"
    When I login with Base64 encoded credentials
      | username | YWRtaW4= |
      | password | YWRtaW4= |
    Then I should be authenticated as "Welcome, Admin!"

  @regression @login @encoding @negative
  Scenario: Login with invalid Base64 encoded credentials
    Given I navigate to "/login"
    When I login with Base64 encoded credentials
      | username | d3JvbmdfdXNlcg== |
      | password | d3JvbmdfcGFzcw== |
    Then I should see an error message
