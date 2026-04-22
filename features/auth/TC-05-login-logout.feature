@regression @auth @login @logout @critical
Feature: Login and logout flows
  As an application user
  I want to log in and log out of the library system
  So that I can access the catalog and end my session securely

  Background:
  Common authenticated navigation setup so logout-related scenarios begin from a signed-in state.
    Given I navigate to "/"
    And I should be in the "landing" page
    Then I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then the "login" page url, title, and heading should be correct
    Then I should see the login form
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
    When I login with username "admin" and password "admin"
    And I should be in the "books list" page
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I verify the total book titles count is "3"
    And I can see "Total Book Titles:" 3 in the books list page

  @smoke @critical
  Scenario: Authenticated user can access the books catalog
    And I should be in the "Book List" page
    Then I should be redirected to the "Book List" page
    Then I should see "Log Out" button on the top right page
    And I should be in the "books list" page
    And I should see the "Book List" page with the correct heading
    And I can see "Total Book Titles:" 3 in the books list page

   @regression @logout @critical @catalog
   Scenario: User can log out from the books catalog
     And I should be in the "Book List" page
     When I tap on the "Log Out" button
     And I should be in the "Book List" page

