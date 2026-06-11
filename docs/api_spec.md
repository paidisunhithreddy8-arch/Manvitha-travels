# API Specification - Customer Occasion-Based Booking Reminder System

This document outlines the API endpoints provided by the backend Express server. All request and response bodies use JSON format.

---

## 1. Customers API

### `GET /api/customers`
Retrieves all customer records.
* **Response:**
  ```json
  [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+91 9876543210",
      "created_at": "2026-06-01 10:00:00"
    }
  ]
  ```

### `POST /api/customers`
Creates a new customer.
* **Request Body:**
  ```json
  {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+91 9123456789"
  }
  ```
* **Response:**
  ```json
  {
    "id": 2,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+91 9123456789",
    "created_at": "2026-06-11 10:00:00"
  }
  ```

---

## 2. Reminders API

### `POST /api/customer_occasionbased_booking_remi`
Creates a new booking reminder.
* **Request Body:**
  ```json
  {
    "customer_id": 1,
    "occasion_type": "birthday",
    "occasion_date": "2026-06-20",
    "festival_name": "",
    "status": "Active",
    "notes": "Prefers sedan or SUV for weekend outstation trips."
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "customer_id": 1,
    "occasion_type": "birthday",
    "occasion_date": "2026-06-20",
    "reminder_date": "2026-06-13",
    "festival_name": "",
    "status": "Active",
    "notes": "Prefers sedan or SUV for weekend outstation trips.",
    "created_at": "2026-06-11 10:00:00",
    "updated_at": "2026-06-11 10:00:00"
  }
  ```

### `GET /api/customer_occasionbased_booking_remi`
Retrieves all reminders, supporting search, status filter, and pagination.
* **Query Parameters:**
  - `status`: Filter by status (`Active`, `Completed`, `Archived`). Optional.
  - `search`: Search query (searches customer name, festival name, or notes). Optional.
  - `page`: Page number (default: 1). Optional.
  - `limit`: Records per page (default: 20). Optional.
* **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "customer_id": 1,
        "customer_name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+91 9876543210",
        "occasion_type": "birthday",
        "occasion_date": "2026-06-20",
        "reminder_date": "2026-06-13",
        "festival_name": "",
        "status": "Active",
        "notes": "Prefers sedan or SUV for weekend outstation trips.",
        "created_at": "2026-06-01 10:00:00",
        "updated_at": "2026-06-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
  ```

### `GET /api/customer_occasionbased_booking_remi/:id`
Retrieves details of a single reminder, including the associated customer.
* **Response:**
  ```json
  {
    "id": 1,
    "customer_id": 1,
    "customer_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+91 9876543210",
    "occasion_type": "birthday",
    "occasion_date": "2026-06-20",
    "reminder_date": "2026-06-13",
    "festival_name": "",
    "status": "Active",
    "notes": "Prefers sedan or SUV for weekend outstation trips.",
    "created_at": "2026-06-01 10:00:00",
    "updated_at": "2026-06-01 10:00:00"
  }
  ```

### `PUT /api/customer_occasionbased_booking_remi/:id`
Updates an existing reminder.
* **Request Body:**
  ```json
  {
    "occasion_type": "birthday",
    "occasion_date": "2026-06-20",
    "festival_name": "",
    "status": "Active",
    "notes": "Updated: Prefers SUV only."
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "customer_id": 1,
    "occasion_type": "birthday",
    "occasion_date": "2026-06-20",
    "reminder_date": "2026-06-13",
    "festival_name": "",
    "status": "Active",
    "notes": "Updated: Prefers SUV only.",
    "created_at": "2026-06-01 10:00:00",
    "updated_at": "2026-06-11 10:00:00"
  }
  ```

### `PATCH /api/customer_occasionbased_booking_remi/:id/status`
Updates only the status of a reminder.
* **Request Body:**
  ```json
  {
    "status": "Completed"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "message": "Status updated successfully",
    "data": {
      "id": 1,
      "status": "Completed"
    }
  }
  ```

---

## 3. Alerts API

### `GET /api/alerts/active`
Runs the processing engine and returns all active alerts (occasions within 7 days of the system date **June 11, 2026**), sorted by urgency.
* **Response:**
  ```json
  [
    {
      "id": 1,
      "reminder_id": 1,
      "customer_name": "Jane Doe",
      "occasion_type": "birthday",
      "occasion_date": "2026-06-20",
      "days_until": 2,
      "urgency": "Red",
      "alert_date": "2026-06-11"
    }
  ]
  ```

---

## 4. Reports & Analytics API

### `GET /api/reports/summary`
Returns dashboard analytics summary counts, monthly trends, and status distribution data.
* **Response:**
  ```json
  {
    "stats": {
      "totalCustomers": 12,
      "totalReminders": 18,
      "activeReminders": 10,
      "activeAlertsCount": 3
    },
    "statusDistribution": {
      "Active": 10,
      "Completed": 5,
      "Archived": 3
    },
    "urgencyDistribution": {
      "Red": 1,
      "Amber": 2
    },
    "occasionTypeDistribution": {
      "birthday": 8,
      "anniversary": 6,
      "festival": 4
    },
    "monthlyTrend": [
      { "month": "Jan", "count": 1 },
      { "month": "Feb", "count": 2 },
      { "month": "Jun", "count": 8 }
    ]
  }
  ```
