@workflow @security
Feature: Security workflow
  As a security-conscious application owner
  I want unauthorized access attempts to be exercised
  So that protection gaps are visible in the test suite

  Scenario: Direct navigation to a protected route
    When I attempt to navigate directly to the add book page
    Then I should be in the "Add a New Book" page
