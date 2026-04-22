@regression @e2e @add-book
Feature: Add a new book to the inventory
  As an authorized user
  I want to add a new book to the inventory
  So that I can expand the collection of books.

  Background:
    Given I navigate to "/"
    And I should be in the "landing" page
    When I tap on the "Start Testing" button
    And I login with username "admin" and password "admin"
    And I should be in the "Book List" page

  @smoke @regression @e2e @add-book
  Scenario: Successfully add a new book
    When I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    And I complete and submit the add book form with:
      | Title      | Author         | Genre   | ISBN          | Publication Date | Price |
      | The Hobbit | J.R.R. Tolkien | Fantasy | 9780618002214 | 1937-09-21       | 10.99 |
    Then I should be redirected to the "Book List" page
    And I should see the book "The Hobbit" by "J.R.R. Tolkien" with ISBN "9780618002214", genre "Fantasy", publication date "1937-09-21", and price "10.99" in the books catalog

  @regression @e2e @add-book @validation
  Scenario: Attempt to add a book with invalid data
    When I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    When I submit the "Add Book" form without filling any details
    Then I should see required field validation errors for:
      | Field            | Error Message                 |
      | Title            | Title is required.            |
      | Author           | Author is required.           |
      | Genre            | Genre is required.            |
      | ISBN             | ISBN is required.             |
      | Publication Date | Publication Date is required. |
      | Price            | Price is required.            |
