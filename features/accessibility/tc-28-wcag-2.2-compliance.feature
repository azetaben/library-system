@accessibility @wcag-2.2 @ui-contract
Feature: WCAG 2.2 AA Accessibility Compliance
  As a QA engineer
  I want to verify that core pages comply with WCAG 2.2 AA standards
  So that the application is accessible to all users

  Background:
    Given I navigate to "/login"

  @accessibility @wcag-2.2 @login-page
  Scenario: Login page should be WCAG 2.2 AA compliant
    And I should be in the "login" page
    Then the page should be compliant with WCAG 2.2 AA accessibility standards
    And the page should have "critical or serious" accessibility violations "equal to" 0

  @accessibility @wcag-2.2 @login-critical
  Scenario: Login page should have no critical accessibility violations
    And I should be in the "login" page
    Then the page should have no critical or serious accessibility violations

  @accessibility @wcag-2.2 @books-list
  Scenario: Books list page should be WCAG 2.2 AA compliant
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    Then the page should be compliant with WCAG 2.2 AA accessibility standards

  @accessibility @wcag-2.2 @books-list-critical
  Scenario: Books list page should have no critical accessibility violations
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    Then the page should have no critical or serious accessibility violations

  @accessibility @wcag-2.2 @add-book
  Scenario: Add Book page should be WCAG 2.2 AA compliant
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    Then the page should be compliant with WCAG 2.2 AA accessibility standards

  @accessibility @wcag-2.2 @add-book-critical
  Scenario: Add Book page should have no critical accessibility violations
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Add Book" button
    And I should be in the "Add a New Book" page
    Then the page should have no critical or serious accessibility violations

  @accessibility @wcag-2.2 @edit-book
  Scenario: Edit Book page should be WCAG 2.2 AA compliant
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Edit" button for the book "The Very Busy Spider"
    And I should be in the "Edit Book" page
    Then the page should be compliant with WCAG 2.2 AA accessibility standards

  @accessibility @wcag-2.2 @edit-book-critical
  Scenario: Edit Book page should have no critical accessibility violations
    When I login with username "admin" and password "admin"
    And I should be in the "Book List" page
    And I click on the "Edit" button for the book "The Very Busy Spider"
    And I should be in the "Edit Book" page
    Then the page should have no critical or serious accessibility violations

  @accessibility @wcag-2.2 @report
  Scenario: Generate detailed accessibility report for login page
    And I should be in the "login" page
    Then I should see a detailed accessibility report for the current page

  @accessibility @wcag-2.1
  Scenario: Login page should comply with WCAG 2.1 AA standards
    And I should be in the "login" page
    Then the page should be compliant with WCAG 2.1 AA accessibility standards

  @accessibility @wcag-2.0
  Scenario: Login page should comply with WCAG 2.0 AA standards
    And I should be in the "login" page
    Then the page should be compliant with WCAG 2.0 AA accessibility standards

