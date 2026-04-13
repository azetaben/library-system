@regression @ui @navigation
Feature: UI Pages
  As a user
  I want to navigate through the UI pages
  So that I can access the features of the application reliably

  Background:
    Common public-entry setup so UI page checks start from the landing page.
    Given I navigate to "/"

  @regression @ui @landing
  Scenario: Verify all UI elements - Landing Page
    And I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    And I should see the "Start Testing" button with the correct title


  @regression @ui @login
  Scenario: Verify all UI elements on Landing Page
    When I tap on the "Start Testing" button
    Then I should be on the login page
    Then the "login" page url, title, and heading should be correct
    And I should see the login form with the following input fields and buttons
      | Username |
      | Password |
      | Show     |
      | Log In   |
    And I should see buttons with the correct titles
      | Show   |
      | Log In |
    When I enter username "admin" and password "admin"
    And I tap on the "Show" button
    Then the password should be visible
    Then the password "admin" should be visible
    And I should see buttons with the correct titles
      | Hide |
    When I tap on the "Hide" button
    Then the password should be hidden
