# Database Schema - Customer Occasion-Based Booking Reminder System

This document outlines the SQLite schema used in the project.

## Tables

### 1. `customers`
Stores core customer contact information.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `name` | TEXT | NOT NULL | Customer's full name |
| `email` | TEXT | NOT NULL | Email address |
| `phone` | TEXT | NOT NULL | Phone number |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date customer was added |

### 2. `customer_occasionbased_booking_remi`
Stores the reminder preferences and occasions for bookings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `customer_id` | INTEGER | FOREIGN KEY REFERENCES `customers(id)` | Linked customer |
| `occasion_type` | TEXT | NOT NULL | Type: `birthday`, `anniversary`, or `festival` |
| `occasion_date` | TEXT | NOT NULL | Date of the occasion (YYYY-MM-DD) |
| `reminder_date` | TEXT | NOT NULL | Date reminder should trigger (YYYY-MM-DD, calculated as occasion_date - 7 days) |
| `festival_name` | TEXT | NULL | Name of festival (if type is `festival`) |
| `status` | TEXT | NOT NULL CHECK IN ('Active', 'Completed', 'Archived') | Current status |
| `notes` | TEXT | NULL | Special travel preferences or notes |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date record was created |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date record was updated |

### 3. `alerts`
Stores active notifications triggered by the processing engine when reminders are due.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `reminder_id` | INTEGER | FOREIGN KEY REFERENCES `customer_occasionbased_booking_remi(id)` | Linked reminder |
| `alert_date` | TEXT | NOT NULL | Date the alert was generated |
| `status` | TEXT | NOT NULL CHECK IN ('Active', 'Dismissed') | Alert status |
| `urgency` | TEXT | NOT NULL CHECK IN ('Red', 'Amber') | Red (<=2 days), Amber (3-7 days) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Time alert was created |
