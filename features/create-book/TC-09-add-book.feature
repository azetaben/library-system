@regression @auth @crud @add-book
Feature: Admin system authorised user add  a book functionality
  As an authorized admin user
  I want to add a book to the catalog
  So that newly available books can be managed in the library system

  Background:
    Common authenticated navigation setup so each scenario starts from the books catalog as an admin user.
    Given I navigate to "/"
    Then I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    When I tap on the "Start Testing" button
    Then I should see the login form
    And I should see the login form with the following input fields and buttons
      | Username |
      | Password |
      | Show     |
      | Log In   |
    When I login with username "admin" and password "admin"
    And the "books" page url, title, and heading should be correct
    And I should see the "Book List" page with the correct heading
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And the page Heading should be "Book List"
    Then I should be authenticated as "Welcome, Admin!"
    And I can see "Total Book Titles:" 3 in the book catalog page

  @regression @add-book @navigation
  Scenario: verify add book page details
    When I click on the "Add Book" button
    Then the "add a new book" page url, title, and heading should be correct

  @regression @add-book @ui
  Scenario: verify add book page details
    When I click on the "Add Book" button
    Then I can verify the add book page
    Then I can verify the add book page details:
      | url       | title               | heading        |
      | /add-book | Books Inventory App | Add a New Book |

  @smoke @critical
  Scenario Outline: Add a book to the catalog
    And I click on the "Add Book" button
    And I am in the "Add a New Book" page
    And the "Add Book" page url, title, and heading should be correct
    And I should see the "Add a New Book" form with the correct labels
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    And I enter "<Title>", "<Author>", "<ISBN>", "<Genre>", "<Publication Date>", and "<Price>" in the respective fields
    And I submit the "Add Book" form
    Then I should see the book "<Title>" by "<Author>" with ISBN "<ISBN>", genre "<Genre>", publication date "<Publication Date>", and price "<Price>" in the books catalog
    And I should be redirected to the "Book List" page
    And the new book should be listed in the "Book List" page with the correct details

    Examples:
      | Title              | Author          | ISBN          | Genre           | Publication Date | Price |
      | The Great Mohammed | BenScott Donald | 9780743273565 | Fiction         | 1925-04-10       | 16.98 |
      | The Great Hunter   | Scott Gerald    | 9990743270000 | Science Fiction | 1925-04-10       | 36.00 |
