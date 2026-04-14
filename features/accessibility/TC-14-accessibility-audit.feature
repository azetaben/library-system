@regression @accessibility @a11y
Feature: Accessibility audit
  As a user of the books inventory application
  I want the main pages to meet accessibility standards
  So that the application is usable by people with different accessibility needs

  Background:
    Common starting point for running accessibility checks against the application entry page.
    Given I navigate to "/"
    And I should be in the "landing" page

  @regression @a11y @landing
  Scenario: Verify landing page accessibility compliance
    Then the page should be accessible with the following options:
      | ruleId   | enabled |
      | wcag2a   | true    |
      | wcag2aa  | true    |
      | wcag21a  | true    |
      | wcag21aa | true    |
      | wcag22aa | true    |

  @regression @a11y @login
  Scenario: Verify login page accessibility compliance
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then the page should be accessible with the following options:
      | ruleId   | enabled |
      | wcag2a   | true    |
      | wcag2aa  | true    |
      | wcag21a  | true    |
      | wcag21aa | true    |
      | wcag22aa | true    |
