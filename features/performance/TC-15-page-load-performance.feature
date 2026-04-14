@regression @performance
Feature: Page load performance metrics
  As an application user
  I want key pages to load within acceptable performance thresholds
  So that the application feels responsive during normal use


  @regression @performance @landing
  Scenario: Verify landing page performance
    Then the page load time should be less than 5000 milliseconds
    And the First Contentful Paint should be less than 3000 milliseconds

  @regression @performance @login
  Scenario: Verify login page performance
    Given I navigate to the "login" page
    Then the page load time should be less than 5000 milliseconds
    And the First Contentful Paint should be less than 3000 milliseconds

  @regression @performance @books
  Scenario: Verify books page performance
   Given I navigate to the "login" page
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"
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
    Then the page load time should be less than 5000 milliseconds
    And the First Contentful Paint should be less than 4000 milliseconds

    @regression @performance @add-book
    Scenario: Verify add book page performance
     Given I navigate to the "login" page
      When I login with username "admin" and password "admin"
      And I should be authenticated as "Welcome, Admin!"
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
      When I tap on the "Add Book" button
      Then the page load time should be less than 5000 milliseconds
      And the First Contentful Paint should be less than 4000 milliseconds

    @regression @performance @edit-book
    Scenario: Verify edit book page performance
     Given I navigate to the "login" page
      When I login with username "admin" and password "admin"
      And I should be authenticated as "Welcome, Admin!"
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
      When I tap on the "Edit" button for a book titled "Book Title 1"
      Then the page load time should be less than 5000 milliseconds
      And the First Contentful Paint should be less than 4000 milliseconds
