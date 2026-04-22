@regression @e2e @full-crud @logout
Feature: Full book management and logout journey
  As an authorized user
  I want to perform a full CRUD cycle and verify logout functionality
  So that I can ensure the core features of the application are working correctly.

  Background:
    Given I navigate to "/"
    And I should be in the "landing" page
    When I tap on the "Start Testing" button
    And I login with username "admin" and password "admin"
    And I should be in the "Book List" page

    And I verify the books catalog static content
    Then verify default books catalog details and pagination controls
      | Title                | Author     | Genre                 | ISBN          | Publication Date | Price | Actions     |
      | The Very Busy Spider | Eric Carle | Picture Book          | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
      | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
      | Charlotte's Web      | E.B. White | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |

  @smoke @regression @e2e @full-crud @logout
  Scenario: Perform a full CRUD cycle and verify logout from multiple pages
    # Create a new book
    When I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    And I complete and submit the add book form with:
      | Title             | Author         | Genre   | ISBN          | Publication Date | Price |
      | Lord of the Rings | J.R.R. Tolkien | Fantasy | 9780618640157 | 1954-07-29       | 22.99 |
    Then I should be redirected to the "Book List" page
    And I should see the book "Lord of the Rings" by "J.R.R. Tolkien" with ISBN "9780618640157", genre "Fantasy", publication date "1954-07-29", and price "22.99" in the books catalog
    Then verify default books catalog details and pagination controls
      | Title                | Author         | Genre                 | ISBN          | Publication Date | Price | Actions     |
      | The Very Busy Spider | Eric Carle     | Picture Book          | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
      | The Cat in the Hat   | Dr. Seuss      | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
      | Charlotte's Web      | E.B. White     | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |
      | Lord of the Rings    | J.R.R. Tolkien | Fantasy               | 9780618640157 | 29/07/1954       | 22.99 | Edit,Delete |

    # Read the book
    Then I verify the book titled "Lord of the Rings" is visible in the books catalog

    # Update the book
    When I click the "Edit" action for book "Lord of the Rings"
    And I should be in the "Edit Book" page
    And I fill and submit the edit book form:
      | Title             | Author         | Genre   | ISBN          | Publication Date | Price |
      | Lord of the Rings | J.R.R. Tolkien | Fantasy | 9780618640157 | 1954-07-29       | 25.99 |
    Then I should be redirected to the "Book List" page
    And I should see the book "Lord of the Rings" by "J.R.R. Tolkien" with ISBN "9780618640157", genre "Fantasy", publication date "1954-07-29", and price "25.99" in the books catalog

    # Delete the book
    When I click the "Delete" action for book "Lord of the Rings"
    Then I verify the book titled "Lord of the Rings" is not visible in the books catalog


    # BUG: Logout button does not redirect to the login page.
    When I tap on the "Logout" button
    Then I should be in the "Book List" page
    And the Welcome, Admin! message should not be visible
    And the Log Out button should not be visible

    # BUG: Logout button does not redirect to the login page.
  Scenario: Logout from Add Book page
    When I login with username "admin" and password "admin"
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    When I tap on the "Logout" button
    Then I should be in the "Add a New Book" page
    And the Welcome, Admin! message should not be visible
    And the Log Out button should not be visible

    # BUG: Logout button does not redirect to the login page.
  Scenario:  Logout from Edit Book page
    When I login with username "admin" and password "admin"
    And I click the "Edit" action for book "The Cat in the Hat"
    And I should be in the "Edit Book" page
    When I tap on the "Logout" button
    Then I should be in the "Edit Book" page
    And the Welcome, Admin! message should not be visible
    And the Log Out button should not be visible
