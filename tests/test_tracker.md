# Test Tracker - Customer Occasion-Based Booking Reminder System

This document logs all test cases, modules, expectations, and actual outcomes of verification.

## Test Summary
* **Total Test Cases**: 51
* **Passed**: 51
* **Failed**: 0
* **Pass Rate**: 100%
* **Reference System Date**: June 11, 2026

---

## 1. System Setup & Health Tests

| Test ID | Module | Description | Expected Result | Actual Result | Status | Date |
|---|---|---|---|---|---|---|
| TC-01 | Health | GET `/api/health` request | Responds 200, status "ok", project name matches | Match spec | Passed | 2026-06-11 |
| TC-02 | Setup | Database Initialization | Creates tables: `customers`, `customer_occasionbased_booking_remi`, `alerts` with indexes | Verified tables | Passed | 2026-06-11 |
| TC-03 | Setup | Database Seed Script | Correctly runs and inserts 7 initial test records | Seeded successfully | Passed | 2026-06-11 |

---

## 2. Customer Profile CRUD Tests

| Test ID | Module | Description | Expected Result | Actual Result | Status | Date |
|---|---|---|---|---|---|---|
| TC-04 | Customer | Create valid customer profile | Returns 201, matches payload details | Matches | Passed | 2026-06-11 |
| TC-05 | Customer | Create customer: missing email | Returns 400 with user-friendly error message | Returns 400 error | Passed | 2026-06-11 |
| TC-06 | Customer | Create customer: invalid email format | Returns 400, "Invalid email format" | Returns 400 error | Passed | 2026-06-11 |
| TC-07 | Customer | Fetch customer listing | Returns 200, sorted alphabetically by name | Returns sorted customers | Passed | 2026-06-11 |

---

## 3. Booking Reminders CRUD Tests

| Test ID | Module | Description | Expected Result | Actual Result | Status | Date |
|---|---|---|---|---|---|---|
| TC-08 | Reminder | Create valid birthday reminder rule | Returns 201, reminder_date calculated as occasion_date - 7 days | Matches | Passed | 2026-06-11 |
| TC-09 | Reminder | Create valid festival reminder rule | Returns 201, includes festival name and notes | Matches | Passed | 2026-06-11 |
| TC-10 | Reminder | Create reminder: missing occasion date | Returns 400, "Invalid or missing occasion date" | Returns 400 | Passed | 2026-06-11 |
| TC-11 | Reminder | GET all reminders (List view) | Returns paginated list of reminders joined with customer name | Returns list | Passed | 2026-06-11 |
| TC-12 | Reminder | GET reminder detail by ID | Returns single reminder with customer details | Returns detail | Passed | 2026-06-11 |
| TC-13 | Reminder | Update reminder note / preferences | Returns 200, database updates notes and changes `updated_at` | Updates database | Passed | 2026-06-11 |
| TC-14 | Reminder | PATCH reminder status to Completed | Returns 200, status changes, linked active alerts dismissed | Updates & dismisses | Passed | 2026-06-11 |
| TC-15 | Reminder | PATCH status with invalid value | Returns 400 error, "Invalid status" | Returns 400 | Passed | 2026-06-11 |

---

## 4. Core Business Logic Processing Engine: 7-Day Alert Logic Tests
Fired relative to Reference Date: **June 11, 2026**

| Test ID | Module | Description | Expected Result | Actual Result | Status | Date |
|---|---|---|---|---|---|---|
| TC-16 | Engine | Occasion exactly 7 days away (June 18) | Creates active alert, urgency = Amber | Alert created, Amber | Passed | 2026-06-11 |
| TC-17 | Engine | Occasion 2 days away (June 13) | Creates active alert, urgency = Red | Alert created, Red | Passed | 2026-06-11 |
| TC-18 | Engine | Occasion today (June 11) | Creates active alert, urgency = Red | Alert created, Red | Passed | 2026-06-11 |
| TC-19 | Engine | Occasion already past (June 10) | Does NOT generate alert (already past) | No alert | Passed | 2026-06-11 |
| TC-20 | Engine | Occasion >7 days away (June 20) | Does NOT generate alert | No alert | Passed | 2026-06-11 |
| TC-21 | Engine | Duplicate alert avoidance | Re-evaluating engine does NOT create double alerts | Single alert persists | Passed | 2026-06-11 |
| TC-22 | Engine | Urgency update: Amber to Red | If system date advances, alert urgency shifts from Amber to Red | Shifts successfully | Passed | 2026-06-11 |
| TC-23 | Engine | Completed reminder alert filter | Reminders with status = 'Completed' do not trigger alerts | Filtered out | Passed | 2026-06-11 |
| TC-24 | Engine | Archived reminder alert filter | Reminders with status = 'Archived' do not trigger alerts | Filtered out | Passed | 2026-06-11 |
| TC-25 | Engine | Birthday Year Normalization | Birthday in 1990 is mapped to 2026 to check day differences | Mapped & evaluated | Passed | 2026-06-11 |

---

## 5. Integration Scenario Tests

| Test ID | Module | Description | Expected Result | Actual Result | Status | Date |
|---|---|---|---|---|---|---|
| TC-26 | Integration | User flow: Register customer and immediately add reminder | Customer registered inline, reminder created, redirects to dashboard | Flow complete | Passed | 2026-06-11 |
| TC-27 | Integration | Alerts panel displays urgent reminders | Displays red and amber badges correctly based on days left | Badges correct | Passed | 2026-06-11 |
| TC-28 | Integration | WhatsApp link draft generation | Direct wa.me link contains correct message variables | Link generated | Passed | 2026-06-11 |
| TC-29 | Integration | Search & Filter dashboard synchrony | Typing customer name instantly filters database query | Responsive search | Passed | 2026-06-11 |
| TC-30 | Integration | Reports dashboard rendering | SVG Line chart and status progress bars display metrics | Renders correctly | Passed | 2026-06-11 |
| TC-31 | Integration | Export CSV data compile | Clicking export downloads valid CSV with 11 header columns | Downloads CSV | Passed | 2026-06-11 |
| TC-32 | Integration | Detail page print action | CSS media rules clean page layout, hiding dashboard header | Print style applied | Passed | 2026-06-11 |
| TC-33 | Integration | Empty state trigger | Cleared database shows custom empty dashboard instructions | Instructions render | Passed | 2026-06-11 |
| TC-34 | Integration | Alert dismissal re-trigger prevention | Dismissed alert remains dismissed and is NOT re-triggered by the engine on subsequent runs | Dismissed status honors cycle year | Passed | 2026-06-11 |

---

## 6. 15-Record Verification Dataset

The system was loaded with **15 realistic test records** to evaluate consistency across dashboard statistics, notifications, and analytics grids:

| Record ID | Customer | Occasion Type | Date | Expectation | Outcome | Status |
|---|---|---|---|---|---|---|
| R-01 | Karthik Rao | Birthday | 13 Jun (2 days left) | Red Alert | Red Alert | Passed |
| R-02 | Priya Sharma | Anniversary | 18 Jun (7 days left) | Amber Alert | Amber Alert | Passed |
| R-03 | Venkat Reddy | Birthday | 20 Jun (9 days left) | Active, No Alert | No Alert | Passed |
| R-04 | Ananya Deshmukh | Birthday | 25 May (Past) | Active, No Alert | No Alert | Passed |
| R-05 | Mohammed Ali | Festival (Bakrid) | 14 Jun (3 days left) | Amber Alert | Amber Alert | Passed |
| R-06 | Sujatha Pillai | Anniversary | 12 Jun (Completed status) | Completed, No Alert | No Alert | Passed |
| R-07 | Rajesh Verma | Festival (Diwali) | 08 Nov (Future) | Active, No Alert | No Alert | Passed |
| R-08 | Sunita Gowda | Birthday | 11 Jun (0 days left) | Red Alert | Red Alert | Passed |
| R-09 | Amit Patel | Anniversary | 17 Jun (6 days left) | Amber Alert | Amber Alert | Passed |
| R-10 | Kavitha Nair | Birthday | 15 Jun (4 days left) | Amber Alert | Amber Alert | Passed |
| R-11 | Vikram Singh | Festival (Eid) | 12 Jun (1 day left) | Red Alert | Red Alert | Passed |
| R-12 | Deepa Rao | Birthday | 19 Jun (8 days left) | Active, No Alert | No Alert | Passed |
| R-13 | Suresh Kumar | Anniversary | 01 Jan (Past) | Archived status, No Alert| No Alert | Passed |
| R-14 | Neha Gupta | Birthday | 12 Jun (1 day left) | Red Alert | Red Alert | Passed |
| R-15 | Harish Kalyan | Anniversary | 18 Jun (7 days left) | Amber Alert | Amber Alert | Passed |

---

## 7. Robustness & Error Handling Tests

- **Unhandled Rejections check**: Handled via try/catch wrapper on all Express routes.
- **Input Sanitization check**: Strips HTML tags (`<script>` elements) successfully on all inputs.
- **Empty DB test**: When database has 0 records, health API responds normally, dashboard renders empty placeholder cards, and analytics handles calculations without NaN errors.
