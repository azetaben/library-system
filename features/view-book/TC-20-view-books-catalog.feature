@regression @catalog @read-books
Feature: Books catalog
  As an authenticated user
  I want to view the books catalog
  So that I can review the available inventory and its details

  Background:
    Common authenticated catalog setup so read-only catalog checks begin from a signed-in state.
    Given I navigate to "/"
    And I should be in the "landing" page
    Then I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    And I login as a authorised admin user with the following credentials
      | username | password |
      | admin    | admin    |
    And I should be in the "Book List" page
    Then the "books" page url, title, and heading should be correct
    Then I should be redirected to the books list page and I can see "Welcome, Admin!"
    Then the exact control "Log Out" should be clickable
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
    And I verify the total book titles count is "3"


  @regression @catalog @read-books
  Scenario: verify catalog row for "The Very Busy Spider" with author "Eric Carle"
    Given I restore the session to the books catalog page
    Then I can verify the catalog row for "The Very Busy Spider" with author "Eric Carle" exists

  @regression @catalog @read-books
   Scenario: verify book details by title in the catalog
     Then I verify Author,Genre,ISBN,Publication Date,Price, Actions by Title:
       | Title                | Author     | Genre               | ISBN          | Publication Date | Price | Actions     |
       | The Very Busy Spider | Eric Carle | Children's Literature | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
       | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
       | Charlotte's Web      | E.B. White | Children's Literature | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |

  @regression @catalog @read-books @pagination
   Scenario: verify default books catalog details and pagination controls
     Then I should see default displayed books catalog details:
       | Title                | Author     | Genre               | ISBN          | Publication Date | Price | Actions     |
       | The Very Busy Spider | Eric Carle | Children's Literature | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
       | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
       | Charlotte's Web      | E.B. White | Children's Literature | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |
    And I can see "Previous" and "Next" buttons at the bottom page
    And the "Previous" button should be disabled on the first page
    And the "Next" button should be disabled on the first page
    And I can see "Total Book Titles:" 3 in the books list page
