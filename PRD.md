# PRD

## 1. Product Summary

- Product name: Classroom Investment Simulator
- Purpose: Students invest virtual money in other teams' projects within a season, and dividends are calculated based on landing page performance entered by the administrator.
- Primary users: Admin, Student

## 2. Problem

Current class operations require manual management of team assignments, investment submissions, performance entry, and dividend calculations. This creates avoidable overhead and makes results harder to share clearly with students.

## 3. Goal

- Assign students to teams
- Allow the administrator to run the simulator repeatedly by season
- Allow students to invest a total of 100 million KRW in teams other than their own
- Allow the administrator to enter each team's landing page performance
- Automatically calculate conversion rate and student dividends
- Let students view their investment result

## 4. Users

### Admin
- Creates and manages seasons
- Registers teams and students
- Assigns students to teams
- Opens and closes the investment stage
- Inputs team performance data
- Confirms final results

### Student
- Views team list
- Invests virtual money in other teams
- Views final dividend result

## 5. Core Features

### 5.1 Season Management
- Admin can create a new season
- Admin can select the active season to manage
- Teams, students, investments, performance data, and results are stored separately for each season

### 5.2 Team and Student Setup
- Admin can create teams
- Admin can register students
- Each student belongs to exactly one team

### 5.3 Investment
- Each student has a total virtual budget of 100 million KRW
- Students can invest in one or more teams
- Students cannot invest in their own team
- The system validates that total investment equals 100 million KRW

### 5.4 Performance Input
- Admin inputs each team's visitor count
- Admin inputs each team's waitlist count
- The system calculates conversion rate automatically

Formula:

```text
conversion rate = waitlist / visitors
```

### 5.5 Dividend Result
- The system calculates dividends based on each invested team's performance
- Students can view:
  - invested amount
  - dividend amount
  - final total amount

## 6. User Flow

1. Admin creates or selects a season
2. Admin registers teams and students for that season
3. Students review teams and submit investments within that season
4. Admin closes the investment stage
5. Admin enters each team's visitors and waitlist count
6. System calculates conversion rates and dividends for the season
7. Students view final results for the season

## 7. Screens

### Admin
- Season selection and management page
- Team and student setup page
- Investment stage control page
- Team performance input page
- Result overview page

### Student
- Team list page
- Investment page
- Result page

## 8. Business Rules

- All operational data belongs to exactly one season
- Seasons must be separated so data from one season does not affect another season
- A student must belong to one team
- A student cannot invest in their own team
- A student's total investment must equal 100 million KRW
- Team performance is entered only by the administrator
- Conversion rate is calculated from visitors and waitlist count

## 9. MVP Scope

Included:
- Season creation and selection
- Team registration
- Student registration
- Team assignment
- Investment submission
- Admin performance entry
- Automatic conversion rate calculation
- Dividend result view

Excluded:
- External analytics integration
- Evidence file upload
- Advanced ranking system
- Team profile detail pages
- Complex permission system

## 10. Success Criteria

- Admin can complete class setup and result calculation in one service
- Admin can run multiple seasons without mixing data between seasons
- Students can submit investments without rule violations
- Final investment and dividend results are visible to all students

## 11. Implementation Principles

### 11.1 Authentication and Account Setup
- No public sign-up flow is required for the MVP
- The administrator creates student records and assigns each student to a team in advance for each season
- Students log in with their name and PIN
- For the MVP, the PIN may be stored in plain text in the database to keep implementation simple
- The service uses only simple role separation between Admin and Student

### 11.2 UI and Information Exposure
- The UI should remain simple, clean, and focused on the current task
- The product should avoid exposing unnecessary internal details or unrelated information on screen
- The full process should not be shown on a single page at once
- Screens should be separated by role, stage, tab, or page as appropriate
- Students should only see the information required for their current step
- Admin-only controls and data should remain separated from student-facing screens

### 11.3 Season Handling
- The service should treat season as the top-level operational unit
- Admin actions should always be performed within a selected season
- Student-facing data should be shown only for the relevant season
- Season separation should be prioritized over cross-season comparison or aggregation in the MVP
