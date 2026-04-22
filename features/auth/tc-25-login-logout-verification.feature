@regression @auth @login @logout @critical
Feature: Login and Logout Verification
  As an authenticated user
  I want logout to behave consistently from key protected pages
  So that session controls are present, visible, and clickable before logout, then unavailable after logout.

  Background:
    Given I navigate to "/"
    And I should be in the "landing" page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then I should see buttons with the correct titles
      | Show   |
      | Log In |

  @smoke @regression @auth @login
  Scenario: User receives authentication error for invalid credentials
    When I login with username "invalid" and password "invalid"
    Then I should see an error message "Invalid username or password"

   @regression @auth @login @logout
   Scenario Outline: Logout control behavior is consistent across protected pages
     When I login with username "admin" and password "admin"
     And I should be in the "books list" page
     Then I should be authenticated as "Welcome, Admin!"
     When I open the "<targetPage>" page from the books catalog
     Then I should be in the "<targetPage>" page
     And I should see "Log Out" button on the top right page
     And I should see the "Log Out" button as enabled and clickable
     When I tap on the "Log Out" button
     Then I should be in the "<postLogoutPage>" page
     And the "Log Out" button should not be visible on the "<postLogoutPage>" page
     And the welcome message should not be visible

     Examples:
       | targetPage     | postLogoutPage |
       | books list     | books list     |
       | add a new book | add a new book |
       | edit book      | edit book      |
