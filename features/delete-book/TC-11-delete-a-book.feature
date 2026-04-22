@regression @crud @delete-book @catalog @ui
Feature: Books inventory management
  As an authorized user
  I want to delete books from the catalog
  So that outdated or unwanted entries can be removed

  Background:
    Common authenticated catalog setup so delete scenarios begin with visible book entries.
    Given I navigate to "/"
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"
    And I should be authenticated as "Welcome, Admin!"
    Then the "books" page url, title, and heading should be correct
    And I should be redirected to the books list page and I can see "Welcome, Admin!"
    And I can see "Previous" and "Next" buttons at the bottom page
    And the "Previous" button should be disabled on the first page
    And the "Next" button should be disabled on the first page
    And I can see "Total Book Titles:" 3 in the books list page


  @regression @add-book @delete-book
  Scenario: Add a new book to the inventory Delete a newly created book from the inventory
    When I add a new book to the inventory
    Then the new book should appear in the inventory list
    And I delete the newly created book
    Then the deleted book should no longer appear in the inventory list

  @regression @delete-book
  Scenario: Delete a known book from the catalog
    When I click the "Delete" action for book "The Very Busy Spider"
    Then I verify the book titled "The Very Busy Spider" is not visible in the books catalog
    Then I can see the updated book displayed in the books catalog details:
       | Title              | Author     | Genre               | ISBN          | Publication Date | Price | Actions     |
       | The Cat in the Hat | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
       | Charlotte's Web    | E.B. White | Children's Literature | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |

  @regression @add-book @delete-book
  Scenario: Add a book to the inventory and then delete it from the catalog
    When I complete and submit the add book form with:
      | Title                | Author    | Genre   | ISBN          | Publication Date | Price |
      | The Midnight Library | Matt Haig | Fantasy | 9780525559474 | 2020-08-13       | 14.99 |
    Then I should see the book "The Midnight Library" by "Matt Haig" with ISBN "9780525559474", genre "Fantasy", publication date "2020-08-13", and price "14.99" in the books catalog

     Then I can see the updated book displayed in the books catalog details:
       | Title                | Author     | Genre               | ISBN          | Publication Date | Price | Actions     |
       | The Very Busy Spider | Eric Carle | Children's Literature | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
       | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
       | Charlotte's Web      | E.B. White | Children's Literature | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |
       | The Midnight Library | Matt Haig  | Fantasy             | 9780525559474 | 13/08/2020       | 14.99 | Edit,Delete |
     And I click the "Delete" action for book "The Midnight Library"
     Then I verify the book titled "The Midnight Library" is not visible in the books catalog
     Then I can see the updated book displayed in the books catalog details:
       | Title                | Author     | Genre               | ISBN          | Publication Date | Price | Actions     |
       | The Very Busy Spider | Eric Carle | Children's Literature | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
       | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
       | Charlotte's Web      | E.B. White | Children's Literature | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |

  @regression @add-book @delete-book
  Scenario: Add a science fiction book and remove it from the catalog
    When I complete and submit the add book form with:
      | Title             | Author    | Genre           | ISBN          | Publication Date | Price |
      | Project Hail Mary | Andy Weir | Science Fiction | 9780593135204 | 2021-05-04       | 18.50 |
    Then I should see the book "Project Hail Mary" by "Andy Weir" with ISBN "9780593135204", genre "Science Fiction", publication date "2021-05-04", and price "18.50" in the books catalog
    And I click the "Delete" action for book "Project Hail Mary"
    Then I verify the book titled "Project Hail Mary" is not visible in the books catalog

  @regression @add-book @delete-book
  Scenario: Add a biography title and delete it from inventory
    When I complete and submit the add book form with:
      | Title    | Author         | Genre     | ISBN          | Publication Date | Price |
      | Becoming | Michelle Obama | Biography | 9781524763138 | 2018-11-13       | 17.99 |
    Then I should see the book "Becoming" by "Michelle Obama" with ISBN "9781524763138", genre "Biography", publication date "2018-11-13", and price "17.99" in the books catalog
    And I click the "Delete" action for book "Becoming"
    Then I verify the book titled "Becoming" is not visible in the books catalog
