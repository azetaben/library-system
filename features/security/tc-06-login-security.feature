@regression @security @auth @login
Feature: Login security and penetration testing
  As a security-conscious application owner
  I want login flows to resist common attack patterns
  So that authentication remains protected against misuse and tampering

  Background:
    Common public-entry setup so security scenarios begin from the unauthenticated landing experience.
    Given I navigate to "/"
    Then I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    When I tap on the "Start Testing" button
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

  @regression @login @ui @security
  Scenario: Login form is present with correct labels and buttons
    When I enter username "admin" and password "admin"
    And I tap on the "Show" button
    Then the password should be visible
    Then the password "admin" should be visible
    And I should see buttons with the correct titles
      | Hide |
    When I tap on the "Hide" button
    Then the password should be hidden

  @critical @regression @authorization @security @bug
  Scenario: Unauthorized access prevention - book catalog (Gap Check)
    Given I attempt to navigate directly to the books catalog
    Then I should not see catalog management controls
    But I can see "Total Book Titles:" 3 in the book catalog page

  @bug
  Scenario: Unauthorized access prevention - edit a book (Gap Check)
    Given I attempt to navigate directly to the edit a book page
    Then I should not see edit a book form
    But I can see "Edit book details" form in the page

  @bug
  Scenario: Unauthorized access prevention - add a book (Gap Check)
    Given I attempt to navigate directly to the add a book page
    Then I should not see add a book form
    But I can see "Add a New Book" form in the page


  @regression @security @negative
  Scenario Outline: SQL injection prevention on login
    When I input login name as "<sqli_payload>"
    And I input password "Password123!"
    And I click on the login button
    Then the page URL should not contain any SQL keywords

    Examples:
      | sqli_payload               |
      | ' OR '1'='1                |
      | admin' --                  |
      | ' UNION SELECT NULL, NULL# |

  @regression @security @validation
  Scenario: Secure password masking
    Then the password field should have the type "password"
    And any typed character in the password field should be masked
