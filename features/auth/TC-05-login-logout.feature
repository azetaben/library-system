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
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And I verify the total book titles count is "3"
    And I can see "Total Book Titles:" 3 in the book catalog page

  @smoke @critical
  Scenario: Authenticated user can access the books catalog
    And I should be in the "Book List" page
    Then I should be redirected to the "Book List" page
    Then I should see "Log Out" button on the top right page
    And I should be in the "books list" page
    And I should see the "Book List" page with the correct heading
    And I can see "Total Book Titles:" 3 in the book catalog page

  @critical @regression @logout @catalog
  Scenario: Known gap - logout from the catalog keeps the user on the books page
    And I should be in the "Book List" page
    When I tap on the "Logout" button
    But I remain on the book catalog page
    But the "Logout" button should not be visible on the "Book List" page


  @critical @regression @logout @catalog @add-book
  Scenario: logout from the catalog, then try to access add-book page
    And I should be in the "Book List" page
    When I tap on the "Logout" button
    Then I remain on the book catalog page
    And I click on the "Add Book" button
    But the "Logout" button should not be visible on the "Add a New Book" page

  @critical @regression @logout @catalog @edit-book
  Scenario: logout from the catalog, then try to access edit-book page
    And I should be in the "Book List" page
    When I tap on the "Logout" button
    Then I remain on the book catalog page
    And I click on the "Edit" button for a book in the catalog
    And I am in the "Edit book details" page
    But the "Logout" button should not be visible on the "Edit book details" page


  @critical @regression @logout @add-book
  Scenario: Logout control remains visible on the add-book page
    And I should be in the "Book List" page
    And I can see "Total Book Titles:" 3 in the book catalog page
    And I click on the "Add Book" button
    And I am in the "Add a New Book" page
    Then I should see "Log Out" button on the top right page

  @critical @regression @logout @edit-book
  Scenario: Logout control is not available on the edit-book page
    And I can see "Total Book Titles:" 3 in the book catalog page
    And I click on the "Edit" button for a book in the catalog
    Then I should see "Log Out" button on the top right page

  @regression @logout @add-book @critical
  Scenario: Logout control remains available after opening the add-book page
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    And I am in the "Add a New Book" page
    Then I should see "Log Out" button on the top right page

  @regression @logout @edit-book @critical
  Scenario: Logout control remains unavailable after opening the edit-book page
    When I click on the "Edit" button for a book in the catalog
    And I am in the "Edit book details" page
    Then I should see "Log Out" button on the top right page

