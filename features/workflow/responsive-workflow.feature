@workflow @responsive
Feature: Responsive workflow
  As a user on different devices
  I want the landing page to adapt to my viewport
  So that the interface remains usable on multiple screen sizes

  Background:
    Common responsive-entry setup for viewport checks.
    Given I navigate to the landing page when the API is responsive

  Scenario: Validate common viewport sizes
    Then the page should be responsive on the following screen sizes:
      | width | height |
      | 320   | 480    |
      | 375   | 667    |
      | 768   | 1024   |
      | 1440  | 900    |
