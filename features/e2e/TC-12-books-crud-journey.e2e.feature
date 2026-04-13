@smoke @regression @e2e @crud @auth @critical
Feature: Books inventory admin CRUD journey
  As an authorized admin user
  I want to manage books from login through logout
  So that the core books inventory workflow is fully validated end to end

  @regression @critical @login @add-book @edit-book @delete-book @logout @e2e
  Scenario: Authorized admin user can add edit delete and logout successfully
    Given I navigate to "/"
    And I should see "Books Inventory App" as the page title
    And I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    And all elements on the landing page should be visible
    When I tap on the "Start Testing" button
    And I should see "Books Inventory App" as the page title
    Then the "login" page url, title, and heading should be correct
    And I should see the login form
    And I can verify the login form
    And I should see the login form with the following input fields and buttons
      | Username |
      | Password |
      | Show     |
      | Log In   |
    And I should see buttons with the correct titles
      | Show   |
      | Log In |
    When I enter username "admin" and password "admin"
    Then the password should be hidden
    And I tap on the "Show" button to toggle password visibility
    Then the password should be visible
    Then the password "admin" should be visible
    And I should see buttons with the correct titles
      | Hide |
    When I tap on the "Hide" button
    Then the password should be hidden
    When I login as an authorized admin user credentials:
      | username | password |
      | admin001 | admin001 |
    Then I should see "<errors message>"
      | errors message                          |
      | There is a problem with your submission |
      | Invalid username or password            |
    When I login with username "admin" and password "admin"
    And I should see "Books Inventory App" as the page title
    Then the "books" page url, title, and heading should be correct
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
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
    And I should be authenticated as "Welcome, Admin!"
    And I should see "Log Out" button on the top right page
    And I should see the "Book List" page with the correct heading
    And I can see "logout" button on the book catalog page
    And I can see "Previous" and "Next" buttons at the bottom page
    And the "Previous" button should be disabled on the first page
    And the "Previous" and "Next" pagination buttons should be disabled on the first page
    And the "Next" button should be disabled on the first page
    And I can see "Total Book Titles:" 3 in the book catalog page
    And I verify the books catalog static content
    Then verify default books catalog details and pagination controls
      | Title                | Author     | Genre                 | ISBN          | Publication Date | Price | Actions     |
      | The Very Busy Spider | Eric Carle | Picture Book          | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
      | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
      | Charlotte's Web      | E.B. White | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |
    And I verify the clickable controls on the books catalog page
    And all same-origin links on the page should not be broken
    When I click on the "Add Book" button
    Then the "add a new book" page url, title, and heading should be correct
    And I should see the "Add a New Book" form with the correct labels
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    When I submit the "Add Book" form without filling any details
    Then I should see required field validation errors for:
      | Field            | Error Message                 |
      | Title            | Title is required.            |
      | Author           | Author is required.           |
      | Genre            | Genre is required.            |
      | ISBN             | ISBN is required.             |
      | Publication Date | Publication Date is required. |
      | Price            | Price is required.            |
    And I should see 6 add book input fields and each field should be fillable
    And I should see the "Add Book" button as enabled and clickable
    And all same-origin links on the page should not be broken
    When I complete and submit the add book form with:
      | Title              | Author        | Genre   | ISBN          | Publication Date | Price |
      | E2E CRUD Book 1001 | Senior Tester | Fantasy | 9781234501001 | 2024-01-15       | 19.99 |
    Then I should be redirected to the "Book List" page
    And I should see the book "E2E CRUD Book 1001" by "Senior Tester" with ISBN "9781234501001", genre "Fantasy", publication date "2024-01-15", and price "19.99" in the books catalog
    And I verify the book titled "E2E CRUD Book 1001" is visible in the books catalog
    When I click the "Edit" action for book "E2E CRUD Book 1001"
    Then the "Edit Book" page url, title, and heading should be correct
    And I am in the "Edit book details" page
    Then I can see the "Edit book details" form labels:
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    And all same-origin links on the page should not be broken
    When I fill and submit the edit book form:
      | Title                | Author        | Genre   | ISBN          | Publication Date | Price |
      | E2E CRUD Book Edited | Senior Tester | Fantasy | 9781234501001 | 2024-01-15       | 21.99 |
    Then I verify the updated values in edit book form:
      | Title                | Author        | Genre   | ISBN          | Publication Date | Price |
      | E2E CRUD Book Edited | Senior Tester | Fantasy | 9781234501001 | 2024-01-15       | 21.99 |
    And I should see the book "E2E CRUD Book Edited" by "Senior Tester" with ISBN "9781234501001", genre "Fantasy", publication date "2024-01-15", and price "21.99" in the books catalog
    And I verify the book titled "E2E CRUD Book Edited" is visible in the books catalog
    When I click the "Delete" action for book "E2E CRUD Book Edited"
    Then I verify the book titled "E2E CRUD Book Edited" is not visible in the books catalog
    When I tap on the "Logout" button
    But I remain on the book catalog page
    But the "Log Out" button should not be visible on the "Book List" page
    But the "Logout" button should not be visible on the "Book List" page
    Then I should be redirected to the "Book List" page
    And I should see the "Book List" page with the correct heading
    And I can see "Total Book Titles:" 3 in the book catalog page
