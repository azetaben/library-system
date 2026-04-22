@ui-contract @visual
Feature: Visual regression for core authenticated pages
  As a QA engineer
  I want visual baselines for the most important pages
  So that unintended UI changes are detected quickly

  @ui-contract @visual @login
  Scenario: Login page visual baseline
    Given I navigate to "/login"
    And I should be in the "login" page
    Then the "login" page should match the visual baseline "login-page"

  @ui-contract @visual @books-list
  Scenario: Books list page visual baseline
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    Then the "books" page should match the visual baseline "books-list-page"

  @ui-contract @visual @add-book
  Scenario: Add book page visual baseline
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    Then the "add book" page should match the visual baseline "add-book-page"

  @ui-contract @visual @edit-book
  Scenario: Edit book page visual baseline
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Edit" button for the book "The Very Busy Spider"
    And I should be in the "Edit Book" page
    Then the "edit book" page should match the visual baseline "edit-book-page"

