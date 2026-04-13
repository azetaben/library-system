@smoke @regression @auth @login @authorization @critical
Feature: Admin system authorised user login authentication
  As an authorized admin user
  I want to log in successfully
  So that I can access the library system administration features

  @smoke @critical @login @authorization
  Scenario: Admin user login authentication:
    Given I navigate to "/"
    And I should be in the "landing" page
    Then I should see the following subheadings:
      | Introduction         |
      | Business Requirement |
      | Task                 |
      | Important Guidelines |
    When I tap on the "Start Testing" button
    And I should be in the "login" page
    And the "login" page url, title, and heading should be correct
    And I can verify the login form
    When I login with username "admin" and password "admin"
    Then I should be authenticated as "Welcome, Admin!"
    And the "books list" page url, title, and heading should be correct
    And I should be redirected to the books catalog page and I can see "Welcome, Admin!"
    Then I should be authenticated as "Welcome, Admin!"
