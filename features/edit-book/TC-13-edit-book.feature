@regression @crud @edit-book @validation
Feature: Edit book details
  As an authorized user
  I want to edit existing book details
  So that catalog information stays accurate after updates

  Background:
    Common authenticated edit-book setup so all scenarios begin with the default catalog data loaded.
    Given I navigate to "/login"
    When I login with username "admin" and password "admin"
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
    Then I should see default displayed books catalog details:
      | Title                | Author     | Genre                 | ISBN          | Publication Date | Price | Actions     |
      | The Very Busy Spider | Eric Carle | Picture Book          | 9780694005000 | 01/09/1984       | 6.99  | Edit,Delete |
      | The Cat in the Hat   | Dr. Seuss  | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  | Edit,Delete |
      | Charlotte's Web      | E.B. White | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  | Edit,Delete |
    #And I click on the "Edit" button for a book in the catalog
    And I click on the "Edit" button for the book "The Very Busy Spider"
    Given I am in the "Edit book details" page
    And the "Edit Book" page url, title, and heading should be correct

  @regression @edit-book @crud @Critical
  Scenario: verify Edit book details page labels and update successfully
    Then I can see the "Edit book details" form labels:
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |
    When I fill and submit the edit book form:
      | Title           | Author       | Genre        | ISBN | Publication Date | Price |
      | The Busy Spider | Ben Carle Be | Picture Book | 1    | 2000-09-01       | 16.99 |
    Then I verify the updated values in edit book form:
      | Title              | Author       | Genre                 | ISBN          | Publication Date | Price |
      | The Cat in the Hat | Dr. Seuss    | Children's Literature | 9780394800011 | 12/03/1957       | 7.99  |
      | Charlotte's Web    | E.B. White   | Children's Fiction    | 9780064400558 | 15/10/1952       | 8.99  |
      | The Busy Spider    | Ben Carle Be | Picture Book          | 1             | 2000-09-01       | 16.99 |

  Scenario Outline: verify Edit book details form validation with invalid inputs
    When I fill and submit the edit book form:
      | Title   | Author   | ISBN   | Genre   | Publication Date  | Price   |
      | <Title> | <Author> | <ISBN> | <Genre> | <PublicationDate> | <Price> |
    Then I should see the validation message "<errorMessage>"

    Examples:
      | Title        | Author          | ISBN          | Genre           | PublicationDate | Price | errorMessage                  |
      |              | BenScott Donald | 9780743273565 | Fiction         | 1925-04-10      | 16.98 | Title is required.            |
      | Thomas space |                 | 9990743270000 | Science Fiction | 1925-04-10      | 36.00 | Author is required.           |
      | Thomas space | Thomas Williams |               | Science Fiction | 1925-04-10      | 36.00 | ISBN is required.             |
      | Thomas space | Thomas Williams | 0             |                 | 1925-04-10      | 36.00 | Genre is required.            |
      | Thomas space | Thomas Williams | 0             |                 |                 | 36.00 | Publication Date is required. |
      | Thomas space | Thomas Williams | 0             |                 | 1925-04-10      |       | Price is required.            |
      |              | BenScott Donald | 9780743273565 | Fiction         | 1925-04-10      | 16.98 | Title is required.            |
      |              | Thomas Williams | 9990743270001 | Mystery         | 2001-05-14      | 12.50 | Title is required.            |
      |              | Alice Morgan    | 9781111111111 | Fantasy         | 2015-03-12      | 15.75 | Title is required.            |
      |              | Chris Ford      | 9782222222222 | Biography       | 2010-08-20      | 21.99 | Title is required.            |
      |              | Diana Scott     | 9783333333333 | Non-Fiction     | 2005-11-30      | 14.20 | Title is required.            |
      | Thomas space |                 | 9990743270000 | Science Fiction | 1925-04-10      | 36.00 | Author is required.           |
      | Book Alpha   |                 | 9781234567890 | Fantasy         | 1999-01-01      | 18.00 | Author is required.           |
      | Book Beta    |                 | 9784444444444 | Mystery         | 2018-07-22      | 11.40 | Author is required.           |
      | Book Gamma   |                 | 9785555555555 | Fiction         | 2020-02-29      | 19.90 | Author is required.           |
      | Book Delta   |                 | 9786666666666 | Biography       | 2012-06-18      | 25.00 | Author is required.           |
      | Thomas space | Thomas Williams |               | Science Fiction | 1925-04-10      | 36.00 | ISBN is required.             |
      | Book Epsilon | Ben Carlson     |               | Biography       | 2010-08-20      | 21.99 | ISBN is required.             |
      | Book Zeta    | Alice Morgan    |               | Fiction         | 2017-04-05      | 13.25 | ISBN is required.             |
      | Book Eta     | Chris Ford      |               | Fantasy         | 2009-09-09      | 10.00 | ISBN is required.             |
      | Book Theta   | Diana Scott     |               | Mystery         | 2011-12-01      | 17.80 | ISBN is required.             |
      | Thomas space | Thomas Williams | 0             |                 | 1925-04-10      | 36.00 | Genre is required.            |
      | Book Iota    | Alice Morgan    | 9787777777777 |                 | 2015-03-12      | 15.75 | Genre is required.            |
      | Book Kappa   | Chris Ford      | 9788888888888 |                 | 2018-10-10      | 20.30 | Genre is required.            |
      | Book Lambda  | Diana Scott     | 9789999999999 |                 | 2003-01-15      | 8.99  | Genre is required.            |
      | Book Mu      | Ben Carlson     | 9781010101010 |                 | 2006-06-06      | 27.10 | Genre is required.            |
      | Thomas space | Thomas Williams | 0             |                 |                 | 36.00 | Publication Date is required. |
      | Book Nu      | Chris Ford      | 9782020202020 | Fiction         |                 | 14.20 | Publication Date is required. |
      | Book Xi      | Diana Scott     | 9783030303030 | Fantasy         |                 | 9.99  | Publication Date is required. |
      | Book Omicron | Alice Morgan    | 9784040404040 | Mystery         |                 | 22.00 | Publication Date is required. |
      | Book Pi      | Ben Carlson     | 9785050505050 | Biography       |                 | 16.60 | Publication Date is required. |
      | Thomas space | Thomas Williams | 0             |                 | 1925-04-10      |       | Price is required.            |
      | Book Rho     | Diana Scott     | 9786060606060 | Non-Fiction     | 2005-11-30      |       | Price is required.            |
      | Book Sigma   | Chris Ford      | 9787070707070 | Fiction         | 2019-03-03      |       | Price is required.            |
      | Book Tau     | Alice Morgan    | 9788080808080 | Fantasy         | 2014-04-14      |       | Price is required.            |
      | Book Upsilon | Ben Carlson     | 9789090909090 | Mystery         | 2008-08-08      |       | Price is required.            |

  @regression @edit-book @ui
  Scenario: verify save changes button and input fields are clickable and fillable
    Then I verify the edit book input fields are visible and fillable
    And I verify the "Save Changes" button is visible and clickable

  @regression @edit-book @validation @negative
  Scenario: negative - Title is required
    When I clear the "Title" field
    And I click the "Save Changes" button
    Then I verify the "Title" field validation message is displayed

  @regression @edit-book @validation @negative
  Scenario: negative - Author is required
    When I clear the "Author" field
    And I click the "Save Changes" button
    Then I verify the "Author" field validation message is displayed

  @regression @edit-book @validation @negative
  Scenario: negative - Genre is required
    When I clear the "Genre" field
    And I click the "Save Changes" button
    Then I verify the "Genre" field validation message is displayed

  @regression @edit-book @validation @negative
  Scenario: negative - ISBN is required
    When I clear the "ISBN" field
    And I click the "Save Changes" button
    Then I verify the "ISBN" field validation message is displayed

  @regression @edit-book @validation @negative
  Scenario: negative - Publication Date is required
    When I clear the "Publication Date" field
    And I click the "Save Changes" button
    Then I verify the "Publication Date" field validation message is displayed

  @regression @edit-book @validation @negative
  Scenario: negative - Price is required
    When I clear the "Price" field
    And I click the "Save Changes" button
    Then I verify the "Price" field validation message is displayed
