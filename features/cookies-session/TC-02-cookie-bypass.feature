@regression @auth @session @cookie-bypass
Feature: restore an authenticated session with cookie bypass
  As an authenticated user
  I want session cookies to restore my logged-in state
  So that I can return to the application without signing in again


  @regression @session@landing
  Scenario: restore an authenticated session to the landing page
    Given I restore the session to the landing page
    When I tap on the "Start Testing" button
    And the "login" page url, title, and heading should be correct
    And I login with username "admin" and password "admin"
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control              |
      | Welcome, Admin!      |
      | Log Out              |
      | Book List            |
      | Edit                 |
      | Delete               |
      | Add Book             |
      | Previous             |
      | Next                 |
      | Page 1 of 1          |
      | Total Book Titles: 3 |
    And I should see "Log Out" button on the top right page
    And I should see the "Book List" page with the correct heading

  @regression @session@login
  Scenario: restore an authenticated session to the login page
    Given I restore the session to the login page
    And the "login" page url, title, and heading should be correct
    When I login with username "admin" and password "admin"
    And I should see "Books Inventory App" as the page title
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control              |
      | Log Out              |
      | Book List            |
      | Edit                 |
      | Delete               |
      | Add Book             |
      | Previous             |
      | Next                 |
      | Page 1 of 1          |
      | Total Book Titles: 3 |
    And I should see the "Book List" page with the correct heading

  @regression @session@catalog
  Scenario: restore an authenticated session to the books catalog page
    Given I restore the session to the books catalog page
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I should see "Book List" heading on the page
    And I should see the "Book List" page with the correct heading
