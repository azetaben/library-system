@smoke @auth @login @cross-browser
Feature: Cross-browser login example
  As a user validating supported browsers
  I want a focused login scenario that can run across browsers in parallel
  So that I can confirm the basic authentication flow works in Cucumber

  @cross-browser @headed
  Scenario: Cross-browser login succeeds with valid credentials
    Given I navigate to "/login"
    Then the "login" page url, title, and heading should be correct
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"
    And I should be in the "Book List" page
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

