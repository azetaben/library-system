@regression @ui @navigation
Feature: UI Pages
  As a user
  I want to navigate through the UI pages
  So that I can access the features of the application reliably

  Background:
  Common public-entry setup so UI page checks start from the landing page.
    Given I navigate to "/"
    And I should be in the "landing" page
    And I should see "Books Inventory App" as the page title

  @regression @ui @landing
  Scenario: Verify all UI elements - Landing Page
    And I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    And I should see the "Start Testing" button with the correct title
    And I can see "Start Testing" button color "purple" and styling is correct


  @regression @ui @login
  Scenario: Verify all UI elements on login Page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    Then the "login" page url, title, and heading should be correct
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
    And I can see "Log In" button color "purple" and styling is correct

  @regression @ui @books-list
    Scenario: Verify all UI elements on Books Catalog Page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I should see "Books Inventory App" as the page title
    And I should be in the "Book List" page
    Then the "Book List" page url, title, and heading should be correct
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And I can see book catelog management related controls:
      | control     |
      | Log Out     |
      | Book List   |
      | Edit        |
      | Delete      |
      | Add Book    |
      | Previous    |
      | Next        |
      | Page 1 of 1 |
    And I verify the total book titles count is "3"
    Then I verify Author,Genre,ISBN,Publication Date,Price, Actions by Title:
      | Title                | Author     | Genre                 | ISBN          | Publication Date | Price | Actions     |
      | The Very Busy Spider | Eric Carle | Picture Book          | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
      | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
      | Charlotte's Web      | E.B. White | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |


  @regression @ui @Add-Book
  Scenario: Verify all UI elements on Add Book Page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    When I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    And I am in the "Add a New Book" page
    And I should see the "Add a New Book" form with the correct labels
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    Then I should see 6 add book input fields and each field should be fillable
    And I should see the "Add Book" button as enabled and clickable

  @regression @ui @edit-book
  Scenario: Verify all UI elements on Edit Book Page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Edit" button for the book "The Very Busy Spider"
    And I should be in the "Edit Book" page
    Then I can see the "Edit book details" form labels:
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    Then I should see 6 pre-filled editable edit book fields
    And I should see the "Save Changes" button as enabled and clickable
