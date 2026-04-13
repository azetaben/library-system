@regression @auth @login @authorization @validation
Feature: Authentication and Authorization
  As an application user
  I want to securely log in
  So that I can access the books catalog and protected actions only when authorized

  Background:
    Common authenticated-login preparation so each scenario starts from the login experience.

    Given I navigate to "/login"
    Then the "login" page url, title, and heading should be correct
    And I should be in the "login" page
    And I should see buttons with the correct titles
      | Show   |
      | Log In |

  @regression @login @ui
  Scenario: Login form is present with correct labels and buttons
    When I enter username "admin" and password "admin"
    And I tap on the "Show" button
    Then the password should be visible
    Then the password "admin" should be visible
    And I should see buttons with the correct titles
      | Hide |
    When I tap on the "Hide" button
    Then the password should be hidden


  @smoke @critical
  Scenario: Login successfully with valid credentials
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

  @regression @login @authorization
  Scenario: Successful login with standard admin credentials
    When I login with username "admin" and password "admin"
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And the "books" page url, title, and heading should be correct

  @critical @regression @session
  Scenario: Session persists after successful login and page refresh
    When I login with username "admin" and password "admin"
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    When I refresh the page
    Then I should still be on the books page

  @critical @regression @authorization @navigation
  Scenario: Successful login allows navigation between public and protected routes
    When I login with username "admin" and password "admin"
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    When I navigate directly to the landing page
    And I navigate directly to the books catalog
    Then I should still be on the books page

  @critical @smoke @login @add-book @logout
  Scenario: Successful login, add a book, and logout cleanly
    When I login with username "admin" and password "admin"
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    #And I am in the "Add a New Book" page
    And the "Add Book" page url, title, and heading should be correct
    And I click on the logout button
    And the "Add Book" page url, title, and heading should be correct

  @regression @login @negative
  Scenario: Successful login with valid credentials containing leading and trailing spaces
    When I enter username " admin " and password " admin "
    And I click on the Log In button
    Then I should see an authentication error message "Invalid username or password"

  @regression @login @negative
  Scenario: Failed login with incorrect password
    When I enter username "admin" and password "wrongpassword"
    And I click on the Log In button
    Then I should see an authentication error message "Invalid username or password"
    And I should be on the login page

  @regression @login @negative
  Scenario: Failed login with unregistered username
    When I enter username "unknownuser" and password "admin"
    And I click on the Log In button
    Then I should see an authentication error message "Invalid username or password"
    And I should be on the login page

  @regression @login @negative @validation
  Scenario: Failed login with completely empty credentials
    When I enter username "" and password ""
    And I click "Log In" button
    Then I should see an authentication error message "Please enter your username"

  @regression @login @negative @validation
  Scenario: Failed login with empty username but valid password
    When I enter username "" and password "admin"
    And I click "Log In" button
    Then I should see an authentication error message "Please enter your username"

  @regression @login @negative @validation
  Scenario: Failed login with valid username but empty password
    When I enter username "admin" and password ""
    And I click "Log In" button
    Then I should see a validation error message "Please enter your password"

  @regression @security @negative
  Scenario: Failed login with SQL injection attempt in username
    When I enter username "' OR '1'='1" and password "admin"
    And I click "Log In" button
    Then I should see an authentication error message "Invalid username or password"
    And I should be on the login page

  @critical @regression @authorization @security
  Scenario: Unauthorized direct URL access to the books catalog (Auth Guard check)
    When I attempt to navigate directly to the books catalog
    And the "Books List" page url, title, and heading should be correct
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"

  @critical @regression @authorization @add-book @security
  Scenario: Unauthorized access to Add Book page directly via URL
    When I attempt to navigate directly to the add book page
    And I am in the "Add a New Book" page
    And the "Add a New Book" page url, title, and heading should be correct
    And I should see the "Add a New Book" form with the correct labels
      | label            |
      | Title            |
      | Author           |
      | Genre            |
      | ISBN             |
      | Publication Date |
      | Price            |

  @regression @login @negative
  Scenario: Login fails with invalid credentials
    When I login with username "admin001" and password "admin001"
    Then I should see an error message
    Then I should see "<errors message>"
      | errors message                          |
      | There is a problem with your submission |
      | Invalid username or password            |
