@regression @accessibility @a11y
Feature: Accessibility checks
  As a user of the books inventory application
  I want the interface to remain accessible across key pages
  So that accessibility regressions are detected early

  Background:
    Common starting point for validating accessibility expectations on the application entry page.
    Given I navigate to "/"
    And I should be in the "landing" page

  @regression @a11y @landing
  Scenario: Landing page accessibility checks
    Then the page should be accessible
    And the page should be accessible with the following options:
      | ruleId         | enabled |
      | color-contrast | true    |
      | image-alt      | true    |

  @regression @a11y @login
  Scenario: Login page accessibility checks
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then the page should be accessible
