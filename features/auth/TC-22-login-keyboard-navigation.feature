@regression @auth @login @keyboard @accessibility
Feature: Login keyboard navigation
  As a keyboard user
  I want to navigate the login form with the Tab key
  So that the login controls are reachable without using a mouse

  Scenario: Tab key moves focus through the login form controls
    Given I navigate to "/"
    And I should be in the "landing" page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then the "login" page url, title, and heading should be correct
    And I should see the login form
    When I enter username "admin"
    When I press the "Tab"
    When I enter password "admin"
    When I press the "Tab"
    When I press the "Tab"
    When I press the "Enter"
    And I should be in the "Book List" page
    And the "books list" page url, title, and heading should be correct
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
