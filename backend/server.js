import express from 'express';
import cors from 'cors';
import { getDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Reference Date for calculations (as per system specs)
const REFERENCE_DATE = '2026-06-11';

// Data Sanitization Utility
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Basic sanitization: strip HTML tags and trim whitespace
  return str.replace(/<[^>]*>/g, '').trim();
}

// Data Validation Middleware for Reminders
function validateReminder(req, res, next) {
  const { customer_id, occasion_type, occasion_date, status } = req.body;

  if (!customer_id) {
    return res.status(400).json({ success: false, message: 'Customer ID is required', code: 400 });
  }
  if (!occasion_type || !['birthday', 'anniversary', 'festival'].includes(occasion_type)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing occasion type (must be birthday, anniversary, or festival)', code: 400 });
  }
  if (!occasion_date || !/^\d{4}-\d{2}-\d{2}$/.test(occasion_date)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing occasion date (must be YYYY-MM-DD)', code: 400 });
  }
  if (status && !['Active', 'Completed', 'Archived'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status (must be Active, Completed, or Archived)', code: 400 });
  }
  next();
}

// Health check endpoint (Day 3 requirement)
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({ status: 'ok', project: 'customer-occasion-based-bookin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 500 });
  }
});

// --- CUSTOMERS ROUTES ---

// GET /api/customers
app.get('/api/customers', async (req, res) => {
  try {
    const db = await getDatabase();
    const customers = await db.all('SELECT * FROM customers ORDER BY name ASC');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanPhone = sanitizeString(phone);

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required', code: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format', code: 400 });
    }

    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [cleanName, cleanEmail, cleanPhone]
    );

    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// --- REMINDERS ROUTES ---

// GET /api/customer_occasionbased_booking_remi
app.get('/api/customer_occasionbased_booking_remi', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const db = await getDatabase();

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `
      SELECT r.*, c.name as customer_name, c.email, c.phone 
      FROM customer_occasionbased_booking_remi r
      JOIN customers c ON r.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR r.festival_name LIKE ? OR r.notes LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Get count for pagination
    let countQuery = query.replace('r.*, c.name as customer_name, c.email, c.phone', 'COUNT(*) as total');
    const totalResult = await db.get(countQuery, params);
    const total = totalResult.total;

    // Apply sorting & pagination
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const data = await db.all(query, params);

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// POST /api/customer_occasionbased_booking_remi
app.post('/api/customer_occasionbased_booking_remi', validateReminder, async (req, res) => {
  try {
    const { customer_id, occasion_type, occasion_date, festival_name, status = 'Active', notes } = req.body;

    const cleanFestivalName = sanitizeString(festival_name);
    const cleanNotes = sanitizeString(notes);

    // Calculate reminder_date (7 days before occasion_date)
    const dateObj = new Date(occasion_date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid occasion date', code: 400 });
    }
    dateObj.setDate(dateObj.getDate() - 7);
    const reminder_date = dateObj.toISOString().split('T')[0];

    const db = await getDatabase();

    // Verify customer exists
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customer_id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found', code: 404 });
    }

    const result = await db.run(
      `INSERT INTO customer_occasionbased_booking_remi 
       (customer_id, occasion_type, occasion_date, reminder_date, festival_name, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, occasion_type, occasion_date, reminder_date, cleanFestivalName || null, status, cleanNotes]
    );

    const newReminder = await db.get(
      `SELECT r.*, c.name as customer_name, c.email, c.phone 
       FROM customer_occasionbased_booking_remi r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [result.lastID]
    );

    // Trigger calculation of alerts to see if the new reminder immediately qualifies
    await runBusinessLogicEngine(db);

    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// GET /api/customer_occasionbased_booking_remi/:id
app.get('/api/customer_occasionbased_booking_remi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const reminder = await db.get(
      `SELECT r.*, c.name as customer_name, c.email, c.phone 
       FROM customer_occasionbased_booking_remi r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder record not found', code: 404 });
    }
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// GET /api/customer_occasionbased_booking_remi/:id/detail
app.get('/api/customer_occasionbased_booking_remi/:id/detail', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const reminder = await db.get(
      `SELECT r.*, c.name as customer_name, c.email, c.phone 
       FROM customer_occasionbased_booking_remi r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder record not found', code: 404 });
    }

    // Get alert history for this reminder
    const alertHistory = await db.all(
      'SELECT * FROM alerts WHERE reminder_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({
      ...reminder,
      alerts: alertHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// PUT /api/customer_occasionbased_booking_remi/:id
app.put('/api/customer_occasionbased_booking_remi/:id', validateReminder, async (req, res) => {
  try {
    const { id } = req.params;
    const { occasion_type, occasion_date, festival_name, status, notes } = req.body;

    const cleanFestivalName = sanitizeString(festival_name);
    const cleanNotes = sanitizeString(notes);

    // Calculate new reminder_date
    const dateObj = new Date(occasion_date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid occasion date', code: 400 });
    }
    dateObj.setDate(dateObj.getDate() - 7);
    const reminder_date = dateObj.toISOString().split('T')[0];

    const db = await getDatabase();
    const reminderExists = await db.get('SELECT id FROM customer_occasionbased_booking_remi WHERE id = ?', [id]);
    if (!reminderExists) {
      return res.status(404).json({ success: false, message: 'Reminder record not found', code: 404 });
    }

    await db.run(
      `UPDATE customer_occasionbased_booking_remi 
       SET occasion_type = ?, occasion_date = ?, reminder_date = ?, festival_name = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [occasion_type, occasion_date, reminder_date, cleanFestivalName || null, status, cleanNotes, id]
    );

    // If status is changed to non-Active, clean up linked active alerts
    if (status !== 'Active') {
      await db.run(
        "UPDATE alerts SET status = 'Dismissed' WHERE reminder_id = ? AND status = 'Active'",
        [id]
      );
    }

    // Re-evaluate alerts
    await runBusinessLogicEngine(db);

    const updated = await db.get(
      `SELECT r.*, c.name as customer_name, c.email, c.phone 
       FROM customer_occasionbased_booking_remi r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// PATCH /api/customer_occasionbased_booking_remi/:id/status
app.patch('/api/customer_occasionbased_booking_remi/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Active', 'Completed', 'Archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status (must be Active, Completed, or Archived)', code: 400 });
    }

    const db = await getDatabase();
    const reminderExists = await db.get('SELECT id FROM customer_occasionbased_booking_remi WHERE id = ?', [id]);
    if (!reminderExists) {
      return res.status(404).json({ success: false, message: 'Reminder record not found', code: 404 });
    }

    await db.run(
      'UPDATE customer_occasionbased_booking_remi SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // If status is changed to non-Active, clean up linked active alerts
    if (status !== 'Active') {
      await db.run(
        "UPDATE alerts SET status = 'Dismissed' WHERE reminder_id = ? AND status = 'Active'",
        [id]
      );
    } else {
      // If it becomes Active again, re-run engine to trigger alert if appropriate
      await runBusinessLogicEngine(db);
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { id: parseInt(id), status }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// --- ALERTS ROUTES ---

// GET /api/alerts/active
app.get('/api/alerts/active', async (req, res) => {
  try {
    const db = await getDatabase();

    // Core Processing: run engine to calculate latest alerts relative toREFERENCE_DATE
    await runBusinessLogicEngine(db);

    // Fetch active alerts joined with reminder and customer info
    const activeAlerts = await db.all(`
      SELECT a.id as alert_id, a.alert_date, a.status as alert_status, a.urgency, 
             r.id as reminder_id, r.occasion_type, r.occasion_date, r.festival_name, r.notes,
             c.name as customer_name, c.email, c.phone
      FROM alerts a
      JOIN customer_occasionbased_booking_remi r ON a.reminder_id = r.id
      JOIN customers c ON r.customer_id = c.id
      WHERE a.status = 'Active' AND r.status = 'Active'
      ORDER BY 
        CASE WHEN a.urgency = 'Red' THEN 1 ELSE 2 END ASC,
        r.occasion_date ASC
    `);

    // Add calculations of days_until for the UI
    const refDate = new Date(REFERENCE_DATE);
    const enrichedAlerts = activeAlerts.map(alert => {
      const occDate = new Date(alert.occasion_date);
      let normalizedOccDateStr = alert.occasion_date;
      if (occDate.getUTCFullYear() < 2026) {
        const month = String(occDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(occDate.getUTCDate()).padStart(2, '0');
        normalizedOccDateStr = `2026-${month}-${day}`;
      }
      const diffTime = new Date(normalizedOccDateStr).getTime() - refDate.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...alert,
        days_until: daysUntil >= 0 ? daysUntil : 0
      };
    });

    res.json(enrichedAlerts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// PATCH /api/alerts/:id/dismiss
app.patch('/api/alerts/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const alertExists = await db.get('SELECT id FROM alerts WHERE id = ?', [id]);
    if (!alertExists) {
      return res.status(404).json({ success: false, message: 'Alert record not found', code: 404 });
    }

    await db.run(
      "UPDATE alerts SET status = 'Dismissed' WHERE id = ?",
      [id]
    );

    res.json({ success: true, message: 'Alert dismissed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// --- REPORTS / ANALYTICS ROUTES ---

// GET /api/reports/summary
app.get('/api/reports/summary', async (req, res) => {
  try {
    const db = await getDatabase();

    // Trigger engine to make sure alert counts are up to date
    await runBusinessLogicEngine(db);

    // 1. Stats Summary
    const custCount = await db.get('SELECT COUNT(*) as count FROM customers');
    const remCount = await db.get('SELECT COUNT(*) as count FROM customer_occasionbased_booking_remi');
    const actRemCount = await db.get("SELECT COUNT(*) as count FROM customer_occasionbased_booking_remi WHERE status = 'Active'");
    const actAlertCount = await db.get("SELECT COUNT(*) as count FROM alerts WHERE status = 'Active'");

    // 2. Status Distribution
    const statusRows = await db.all('SELECT status, COUNT(*) as count FROM customer_occasionbased_booking_remi GROUP BY status');
    const statusDistribution = { Active: 0, Completed: 0, Archived: 0 };
    statusRows.forEach(row => {
      statusDistribution[row.status] = row.count;
    });

    // 3. Urgency Distribution
    const urgencyRows = await db.all("SELECT urgency, COUNT(*) as count FROM alerts WHERE status = 'Active' GROUP BY urgency");
    const urgencyDistribution = { Red: 0, Amber: 0 };
    urgencyRows.forEach(row => {
      urgencyDistribution[row.urgency] = row.count;
    });

    // 4. Occasion Type Distribution
    const typeRows = await db.all('SELECT occasion_type, COUNT(*) as count FROM customer_occasionbased_booking_remi GROUP BY occasion_type');
    const occasionTypeDistribution = { birthday: 0, anniversary: 0, festival: 0 };
    typeRows.forEach(row => {
      occasionTypeDistribution[row.occasion_type] = row.count;
    });

    // 5. Monthly Trend (Aggregation of all reminders based on occasion month)
    const allReminders = await db.all('SELECT occasion_date FROM customer_occasionbased_booking_remi');
    const monthlyCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyCounts[m] = 0);
    allReminders.forEach(r => {
      const monthPart = r.occasion_date.split('-')[1];
      if (monthPart) {
        const monthIndex = parseInt(monthPart, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyCounts[months[monthIndex]]++;
        }
      }
    });

    const monthlyTrend = months.map(m => ({
      month: m,
      count: monthlyCounts[m]
    }));

    res.json({
      stats: {
        totalCustomers: custCount.count,
        totalReminders: remCount.count,
        activeReminders: actRemCount.count,
        activeAlertsCount: actAlertCount.count
      },
      statusDistribution,
      urgencyDistribution,
      occasionTypeDistribution,
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error: ' + error.message, code: 500 });
  }
});

// --- CORE BUSINESS LOGIC PROCESSING ENGINE ---
async function runBusinessLogicEngine(dbInstance) {
  const refDate = new Date(REFERENCE_DATE); // '2026-06-11'
  const refYear = refDate.getFullYear();

  // Query only Active reminders
  const activeReminders = await dbInstance.all("SELECT * FROM customer_occasionbased_booking_remi WHERE status = 'Active'");

  for (const reminder of activeReminders) {
    const occDate = new Date(reminder.occasion_date);
    if (isNaN(occDate.getTime())) continue;

    let normalizedOccDateStr = reminder.occasion_date;
    const occYear = occDate.getUTCFullYear();

    // If birthday or anniversary, map year to reference year (2026)
    if (reminder.occasion_type === 'birthday' || reminder.occasion_type === 'anniversary' || occYear < refYear) {
      const month = String(occDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(occDate.getUTCDate()).padStart(2, '0');
      normalizedOccDateStr = `${refYear}-${month}-${day}`;
    }

    const normalizedOccDate = new Date(normalizedOccDateStr);
    
    // Calculate days difference
    const diffTime = normalizedOccDate.getTime() - refDate.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Alert Conditions: occasion is between 0 and 7 days away
    if (daysUntil >= 0 && daysUntil <= 7) {
      const urgency = daysUntil <= 2 ? 'Red' : 'Amber';

      // Check if alert already exists for this reminder in the current year
      const currentYear = REFERENCE_DATE.split('-')[0];
      const existingAlert = await dbInstance.get(
        "SELECT id, urgency, status FROM alerts WHERE reminder_id = ? AND alert_date LIKE ?",
        [reminder.id, `${currentYear}-%`]
      );

      if (!existingAlert) {
        // Insert new alert
        await dbInstance.run(
          `INSERT INTO alerts (reminder_id, alert_date, status, urgency) 
           VALUES (?, ?, 'Active', ?)`,
          [reminder.id, REFERENCE_DATE, urgency]
        );
      } else if (existingAlert.status === 'Active' && existingAlert.urgency !== urgency) {
        // Update urgency (e.g. from Amber to Red as date approaches)
        await dbInstance.run(
          "UPDATE alerts SET urgency = ? WHERE id = ?",
          [urgency, existingAlert.id]
        );
      }
    } else {
      // If occasion is passed or too far in future, dismiss active alerts automatically
      await dbInstance.run(
        "UPDATE alerts SET status = 'Dismissed' WHERE reminder_id = ? AND status = 'Active'",
        [reminder.id]
      );
    }
  }
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`System reference date is configured as: ${REFERENCE_DATE}`);
});
