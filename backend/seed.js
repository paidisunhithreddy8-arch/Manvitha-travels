import { getDatabase } from './database.js';

async function seed() {
  console.log('Seeding database...');
  const db = await getDatabase();

  // Clear existing data (in correct dependency order)
  await db.run('DELETE FROM alerts');
  await db.run('DELETE FROM customer_occasionbased_booking_remi');
  await db.run('DELETE FROM customers');

  // Insert customers
  const customers = [
    { name: 'Karthik Rao', email: 'karthik.rao@gmail.com', phone: '+91 9885012345' },
    { name: 'Priya Sharma', email: 'priya.sharma@yahoo.com', phone: '+91 9848011223' },
    { name: 'Venkat Reddy', email: 'venkat.reddy@rediffmail.com', phone: '+91 9177654321' },
    { name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 9908123456' },
    { name: 'Mohammed Ali', email: 'm.ali@outlook.com', phone: '+91 9849054321' },
    { name: 'Sujatha Pillai', email: 'sujatha.p@gmail.com', phone: '+91 9440123456' }
  ];

  const customerIds = [];
  for (const c of customers) {
    const res = await db.run(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [c.name, c.email, c.phone]
    );
    customerIds.push(res.lastID);
  }

  // Insert reminders relative to system date June 11, 2026
  // Note: birthday and anniversary year will be mapped to 2026 by the logic.
  // 1. Karthik Rao: Birthday on June 13 (2 days away) -> triggers Red alert
  // 2. Priya Sharma: Anniversary on June 18 (7 days away) -> triggers Amber alert
  // 3. Venkat Reddy: Birthday on June 20 (9 days away) -> active but no alert yet
  // 4. Ananya Deshmukh: Birthday on May 25 (past) -> no alert, active status
  // 5. Mohammed Ali: Festival (Bakrid Travel) on June 14 (3 days away) -> triggers Amber alert
  // 6. Sujatha Pillai: Anniversary on June 12 (1 day away, completed) -> status completed, no alert
  
  const reminders = [
    {
      customer_id: customerIds[0],
      occasion_type: 'birthday',
      occasion_date: '1990-06-13', // Birthday June 13
      reminder_date: '1990-06-06',
      festival_name: null,
      status: 'Active',
      notes: 'Prefers Toyota Innova Crysta. Likes chauffeur-driven corporate tours.'
    },
    {
      customer_id: customerIds[1],
      occasion_type: 'anniversary',
      occasion_date: '2015-06-18', // Anniversary June 18
      reminder_date: '2015-06-11',
      festival_name: null,
      status: 'Active',
      notes: 'Outstation trips to Srisailam. Prefers SUV.'
    },
    {
      customer_id: customerIds[2],
      occasion_type: 'birthday',
      occasion_date: '1988-06-20', // Birthday June 20
      reminder_date: '1988-06-13',
      festival_name: null,
      status: 'Active',
      notes: 'Self-drive rental if available, otherwise sedan.'
    },
    {
      customer_id: customerIds[3],
      occasion_type: 'birthday',
      occasion_date: '1992-05-25', // Birthday May 25 (Already past in 2026)
      reminder_date: '1992-05-18',
      festival_name: null,
      status: 'Active',
      notes: 'Regular local transfer customer.'
    },
    {
      customer_id: customerIds[4],
      occasion_type: 'festival',
      occasion_date: '2026-06-14', // Festival June 14 (3 days away)
      reminder_date: '2026-06-07',
      festival_name: 'Bakrid',
      status: 'Active',
      notes: 'Family trip. Requires Tempo Traveller.'
    },
    {
      customer_id: customerIds[5],
      occasion_type: 'anniversary',
      occasion_date: '2010-06-12', // Anniversary June 12 (Completed status)
      reminder_date: '2010-06-05',
      festival_name: null,
      status: 'Completed',
      notes: 'Already booked a sedan for outstation trip.'
    },
    {
      customer_id: customerIds[0],
      occasion_type: 'festival',
      occasion_date: '2026-11-08', // Festival Nov 8 (Diwali) -> active, no alert
      reminder_date: '2026-11-01',
      festival_name: 'Diwali',
      status: 'Active',
      notes: 'Prefers premium sedan.'
    }
  ];

  for (const r of reminders) {
    await db.run(
      `INSERT INTO customer_occasionbased_booking_remi 
       (customer_id, occasion_type, occasion_date, reminder_date, festival_name, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.customer_id, r.occasion_type, r.occasion_date, r.reminder_date, r.festival_name, r.status, r.notes]
    );
  }

  console.log('Database seeded successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
