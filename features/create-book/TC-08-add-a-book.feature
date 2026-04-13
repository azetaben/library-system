@regression @crud @add-book @validation
Feature: Add a New Book
  As an authorized user
  I want to add new books to the catalog
  So that the inventory stays complete and up to date

  Background:
    Common authenticated add-book setup so each scenario begins on the add-book form.
    Given I navigate to "/"
    And I should be in the "landing" page
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Add Book" button
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

  @regression @add-book @ui
  Scenario: verify add book page fields and Add Book button are visible and functional
    Then I should see 6 add book input fields and each field should be fillable
    And I should see the "Add Book" button as enabled and clickable

  @smoke @critical
  Scenario: verify mandatory fields validation when submitting the add book form with empty fields
    When I submit the "Add Book" form without filling any details
    Then I should see required field validation errors for:
      | Field            | Error Message                 |
      | Title            | Title is required.            |
      | Author           | Author is required.           |
      | Genre            | Genre is required.            |
      | ISBN             | ISBN is required.             |
      | Publication Date | Publication Date is required. |
      | Price            | Price is required.            |

  @smoke @critical
  Scenario: successfully add a book with all valid details
    When I complete and submit the add book form with:
      | Title           | Author      | Genre   | ISBN          | Publication Date | Price |
      | The Busy Spider | Ben Carlson | Fantasy | 9781234567890 | 2000-09-01       | 16.99 |
    Then I should see the book "The Busy Spider" by "Ben Carlson" with ISBN "9781234567890", genre "Fantasy", publication date "2000-09-01", and price "16.99" in the books catalog

  @regression @add-book
  Scenario Outline: successfully add books with valid book details
    When I complete and submit the add book form with:
      | Title   | Author   | Genre   | ISBN   | Publication Date  | Price   |
      | <Title> | <Author> | <Genre> | <ISBN> | <PublicationDate> | <Price> |
    Then I should see the book "<Title>" by "<Author>" with ISBN "<ISBN>", genre "<Genre>", publication date "<PublicationDate>", and price "<Price>" in the books catalog

    Examples:
      | Title           | Author          | Genre           | ISBN          | PublicationDate | Price |
      | Matilda         | Roald Dahl      | Fantasy         | 9781234567001 | 1988-10-01      | 8.99  |
      | Dune            | Frank Herbert   | Science Fiction | 9781234567002 | 1965-08-01      | 12.50 |
      | Steve Jobs      | Walter Isaacson | Biography       | 9781234567003 | 2011-10-24      | 14.99 |
      | Silent Spring   | Rachel Carson   | Non-Fiction     | 9781234567004 | 1962-09-27      | 10.00 |
      | Sherlock Holmes | Arthur Conan    | Mystery         | 9781234567005 | 1892-10-14      | 9.75  |


  @regression @add-book @negative @validation
  Scenario: Add a mystery novel and confirm if created successfully in the catalog
    When I complete and submit the add book form with:
      | Title                    | Author        | Genre   | ISBN          | Publication Date | Price |
      | The Thursday Murder Club | Richard Osman | Mystery | 9781984880987 | 2020-09-03       | 15.25 |
    Then I should see a required field validation error as "Title cannot exceed 20 characters."

  @regression @add-book @negative @validation
  Scenario Outline: negative - required field validation
    When I complete and submit the add book form with invalid details:
      | Title   | Author   | Genre   | ISBN   | Publication Date  | Price   |
      | <Title> | <Author> | <Genre> | <ISBN> | <PublicationDate> | <Price> |
    Then I should see a required field validation error for "<Field>"
    Then I should remain on the add book page
    And I should see the required add book validation messages

    Examples:
      | Field            | Title              | Author      | Genre   | ISBN          | PublicationDate | Price |
      | Title            |                    | Ben Carlson | Fantasy | 9781234567801 | 2000-09-01      | 16.99 |
      | Author           | The Busy Spider 1  |             | Fantasy | 9781234567802 | 2000-09-02      | 17.99 |
      | Genre            | The Busy Spider 2  | Ben Carlson |         | 9781234567803 | 2000-09-03      | 18.99 |
      | ISBN             | The Busy Spider 3  | Ben Carlson | Fantasy |               | 2000-09-04      | 19.99 |
      | Publication Date | The Busy Spider 4  | Ben Carlson | Fantasy | 9781234567805 |                 | 20.99 |
      | Price            | The Busy Spider 5  | Ben Carlson | Fantasy | 9781234567806 | 2000-09-05      |       |
      | Title            |                    |             | Fantasy | 9781234567807 | 2000-09-06      | 21.99 |
      | Author           | The Busy Spider 6  |             |         | 9781234567808 | 2000-09-07      | 22.99 |
      | Genre            | The Busy Spider 7  | Ben Carlson |         |               | 2000-09-08      | 23.99 |
      | ISBN             | The Busy Spider 8  | Ben Carlson | Fantasy |               |                 | 24.99 |
      | Publication Date | The Busy Spider 9  | Ben Carlson | Fantasy | 9781234567810 |                 |       |
      | Price            | The Busy Spider 10 | Ben Carlson |         | 9781234567811 | 2000-09-10      |       |
      | Title            |                    |             |         |               |                 |       |
      | Author           | The Busy Spider 11 |             | Fantasy | 9781234567812 |                 | 25.99 |
      | Genre            | The Busy Spider 12 |             |         | 9781234567813 | 2000-09-12      |       |
      | ISBN             |                    | Ben Carlson | Fantasy |               | 2000-09-13      | 26.99 |
      | Publication Date |                    | Ben Carlson |         | 9781234567815 |                 | 27.99 |
      | Price            | The Busy Spider 15 |             | Fantasy | 9781234567816 |                 |       |
      | Title            |                    | Ben Carlson |         |               | 2000-09-16      |       |
      | Author           |                    |             |         | 9781234567818 |                 |       |

  Scenario Outline: negative - invalid value validation - error by invalid value or format for each field
    When I complete and submit the add book form with invalid details:
      | Title   | Author   | Genre   | ISBN   | Publication Date  | Price   |
      | <Title> | <Author> | <Genre> | <ISBN> | <PublicationDate> | <Price> |
    Then I should see a validation error or submission rejection for "<Field>"

    Examples:
      | Field            | Title                      | Author      | Genre        | ISBN          | PublicationDate | Price     |
      | Title            | This Title Is Way Too Long | Ben Carlson | Fantasy      | 9781234567811 | 2000-09-01      | 16.99     |
      | Title            |                            | Ben Carlson | Fantasy      | 9781234567812 | 2000-09-01      | 16.99     |
      | Author           | Good Title                 |             | Fantasy      | 9781234567813 | 2000-09-01      | 16.99     |
      | Genre            | Good Title                 | Ben Carlson | Select Genre | 9781234567816 | 2000-09-01      | 16.99     |
      | Price            | Good Title                 | Ben Carlson | Fantasy      | 9781234567823 | 2000-09-01      | abc       |
      | Title            |                            |             |              |               |                 |           |
