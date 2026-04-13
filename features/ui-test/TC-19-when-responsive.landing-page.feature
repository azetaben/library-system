Feature: Landing page responsive design
  As a user on different screen sizes
  I want the landing page to adapt correctly to my viewport
  So that the interface remains usable on mobile, tablet, and desktop devices

  Background:
    Common responsive-entry setup so viewport checks begin after the application is responsive.
    Given I navigate to the landing page when the API is responsive

  @regression @responsive @landing
  Scenario: Verify landing page responsive design
    Then the page should be responsive on the following screen sizes:
      | width | height |
      | 320   | 480    |
      | 375   | 667    |
      | 425   | 850    |
      | 768   | 1024   |
      | 1024  | 1366   |
      | 1440  | 900    |
      | 2560  | 1440   |

  @regression @responsive @login @warming
  Scenario: Login after warming the Render app
    Given I navigate to the landing page when the API is responsive
    When I tap on the "Start Testing" button
    And I enter username "admin" and password "admin"
    And I click "Log In" button
    Then I should be authenticated as "Welcome, Admin!"

  @regression @responsive @login @warming @Critical
  Scenario: Login after warming the app
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"

  @regression @responsive @login @warming
  Scenario: navigate login page after warming the app
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"

  @regression @responsive @landing @warming
  Scenario: navigate landing page after warming the app
    Given I navigate to "/"
    When I tap on the "Start Testing" button
    And I login as an authenticated admin user with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"

  @regression @responsive @login @warming @Critical
  Scenario: Login with correct credentials not warming the Render app
    Given I navigate directly to the landing page
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"
