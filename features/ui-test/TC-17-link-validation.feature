@regression @links @navigation
Feature: Link validation
  As an application user
  I want important navigation links and actions to work correctly
  So that I can move through the application without broken navigation

  Background:
    Common authenticated navigation setup so link checks begin from a logged-in application state.
    Given I navigate to "https://frontendui-librarysystem.onrender.com"
    When I tap on the "Start Testing" button
    When I login with username "admin" and password "admin"

  @regression @links @landing
  Scenario: Landing page same-origin links are not broken
    Then all same-origin links on the page should not be broken

  @regression @links @login
  Scenario: Login page same-origin links are not broken
    When I tap on the "Start Testing" button
    Then all same-origin links on the page should not be broken

  @regression @links @add-book
  Scenario: add a book page same-origin links are not broken
    And I click on the "Add Book" button
    And I am in the "Add a New Book" page
    Then all same-origin links on the page should not be broken

  @regression @links @edit-book
  Scenario: Edit a book page same-origin links are not broken
    And I click on the "Edit" button for a book in the catalog
    And the "Edit Book" page url, title, and heading should be correct
    Then all same-origin links on the page should not be broken
