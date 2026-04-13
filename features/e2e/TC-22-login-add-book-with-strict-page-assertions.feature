@regression @e2e @auth @add-book @validation @logout @strict-navigation
Feature: Books inventory login-to-add-book flow with UI contract checks
  As a Senior Test Automation Engineer
  I want stronger end-to-end checks than the current CRUD journey in TC-12
  So that page titles, headers, URLs, click targets, and validation behavior are enforced consistently

  Background:
    Common landing-page setup so each strict navigation scenario starts from the public entry point.
    Given I navigate to "/"
    Then the "landing" page url, title, and heading should be correct
    And the page URL should be "/"
    And the page title should exactly be "Books Inventory App"
    And I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |

  @critical
  Scenario: Authorized user can log in, navigate by exact text, and add a valid book
    Then I should see the exact text control "Start Testing" as clickable
    When I click the exact text control "Start Testing"
    Then the "login" page url, title, and heading should be correct
    And the page URL should include path "/login"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Login"
    And I should see the exact text control "Show" as clickable
    And I should see the exact text control "Log In" as clickable
    When I login with username "admin" and password "admin"
    Then the "books" page url, title, and heading should be correct
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
    And the page URL should be "/books"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Book List"
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And I should see "Log Out" button on the top right page
    And I should see the exact text control "Add Book" as clickable
    When I click the exact text control "Add Book"
    Then the "add a new book" page url, title, and heading should be correct
    And the page URL should be "/add-book"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Add a New Book"
    And I should see the "Add a New Book" form with the correct labels
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    When I complete and submit the add book form with unique valid data
    Then the "books" page url, title, and heading should be correct
    And the page URL should be "/books"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Book List"
    And the newly created unique book should be listed in the books catalog with the correct details

  @critical @validation
  Scenario: Authorized user sees add-book validation errors for invalid submission
    When I click the exact text control "Start Testing"
    Then the "login" page url, title, and heading should be correct
    When I login with username "admin" and password "admin"
    Then the "books" page url, title, and heading should be correct
    And I should see the exact text control "Add Book" as clickable
    When I click the exact text control "Add Book"
    Then the "add a new book" page url, title, and heading should be correct
    And the page URL should be "/add-book"
    And the primary page header should exactly be "Add a New Book"
    When I submit the "Add Book" form without filling any details
    Then I should remain on the add book page
    And the page URL should be "/add-book"
    And the page title should exactly be "Books Inventory App"
    And the primary page header should exactly be "Add a New Book"
    And I should see required field validation errors for:
      | Field            | Error Message                 |
      | Title            | Title is required.            |
      | Author           | Author is required.           |
      | Genre            | Genre is required.            |
      | ISBN             | ISBN is required.             |
      | Publication Date | Publication Date is required. |
      | Price            | Price is required.            |

  @security @critical @bug
  Scenario: Known gap - unauthorized user can still access the add-book route
    When I attempt to navigate directly to the add book page
    Then the "add a new book" page url, title, and heading should be correct
    But I can see page URL include path "/add-book" instead of "/login"


  @logout @critical @bug
  Scenario: Known gap - logout from the books page does not return the user to login
    When I click the exact text control "Start Testing"
    Then the "login" page url, title, and heading should be correct
    When I login with username "admin" and password "admin"
    Then the "books" page url, title, and heading should be correct
    And I should see the exact text control "Log Out" as clickable
    When I click the exact text control "Log Out"
    But I remain on the book catalog page
    But the "Log Out" button should not be visible on the "Book List" page
    And the button and link below are not present and visible
      | label           |
      | Log Out         |
      | Welcome, Admin! |
