// Node.js native fetch is used (supported in Node v18+)

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 STARTING BACKEND INTEGRATION TESTS FOR CUSTOMER REMINDER SYSTEM...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check Route
    const healthRes = await fetch(`${API_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with 200 status');
    assert(healthJson.status === 'ok', 'Health response status is "ok"');
    assert(healthJson.project === 'customer-occasion-based-bookin', 'Health project name matches spec');

    // Test 2: Create a Customer
    const customerPayload = {
      name: 'Rohan Deshmukh',
      email: 'rohan.d@manvitha.com',
      phone: '+91 9999000011'
    };
    const createCustRes = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload)
    });
    const createdCust = await createCustRes.json();
    assert(createCustRes.status === 201, 'Customer creation responds with 201 status');
    assert(createdCust.name === 'Rohan Deshmukh', 'Customer name matches payload');
    assert(createdCust.id !== undefined, 'Customer is assigned a database ID');

    // Test 3: Input Validation - Missing customer email
    const invalidCustRes = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Invalid Cust', phone: '123' })
    });
    const invalidCustJson = await invalidCustRes.json();
    assert(invalidCustRes.status === 400, 'Customer post with missing email fails with 400');
    assert(invalidCustJson.success === false, 'Error body returns success: false');

    // Test 4: Create a Reminder Preference
    // Date: 2026-06-18 (exactly 7 days away from REFERENCE_DATE 2026-06-11)
    // Should trigger Amber alert
    const reminderPayload = {
      customer_id: createdCust.id,
      occasion_type: 'birthday',
      occasion_date: '1990-06-18', // June 18
      festival_name: '',
      status: 'Active',
      notes: 'Outstation trips to Tirupati. Prefers SUV.'
    };
    const createRemRes = await fetch(`${API_URL}/customer_occasionbased_booking_remi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderPayload)
    });
    const createdRem = await createRemRes.json();
    assert(createRemRes.status === 201, 'Reminder creation responds with 201 status');
    assert(createdRem.reminder_date === '1990-06-11', 'Reminder date correctly calculated as 7 days prior');
    assert(createdRem.status === 'Active', 'Reminder initial status is Active');

    // Test 5: Verify GET All Reminders
    const getRemRes = await fetch(`${API_URL}/customer_occasionbased_booking_remi`);
    const remList = await getRemRes.json();
    assert(getRemRes.status === 200, 'GET /api/customer_occasionbased_booking_remi responds with 200');
    assert(remList.data.length > 0, 'Reminder list returns populated array');
    assert(remList.data[0].customer_name !== undefined, 'Customer name is correctly joined from customers table');

    // Test 6: Verify Single Reminder Details
    const getSingleRes = await fetch(`${API_URL}/customer_occasionbased_booking_remi/${createdRem.id}`);
    const singleRem = await getSingleRes.json();
    assert(getSingleRes.status === 200, 'GET reminder by ID returns 200 status');
    assert(singleRem.id === createdRem.id, 'Returned reminder ID matches requested ID');

    // Test 7: Verify Core Processing Logic - Alerts Generation
    // Since today is 2026-06-11, Rohan's birthday is June 18 (7 days away) -> triggers Amber Alert.
    // Karthik's birthday is June 13 (2 days away) -> triggers Red Alert.
    const alertsRes = await fetch(`${API_URL}/alerts/active`);
    const activeAlerts = await alertsRes.json();
    assert(alertsRes.status === 200, 'GET /api/alerts/active responds with 200');
    
    // Find the alert we just triggered for Rohan
    const rohanAlert = activeAlerts.find(a => a.reminder_id === createdRem.id);
    assert(rohanAlert !== undefined, 'Alert is automatically generated for upcoming occasion');
    assert(rohanAlert.urgency === 'Amber', 'Alert urgency is correctly set to Amber (7 days left)');
    assert(rohanAlert.days_until === 7, 'Alert days_until is correctly computed as 7');

    // Test 8: Update Reminder notes and status
    const updatePayload = {
      customer_id: createdCust.id,
      occasion_type: 'birthday',
      occasion_date: '1990-06-18',
      festival_name: '',
      status: 'Completed',
      notes: 'Booking secured! Customer reserved an Innova.'
    };
    const updateRes = await fetch(`${API_URL}/customer_occasionbased_booking_remi/${createdRem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const updatedRem = await updateRes.json();
    assert(updateRes.status === 200, 'PUT /api/customer_occasionbased_booking_remi/:id returns 200 status');
    assert(updatedRem.status === 'Completed', 'Reminder status successfully updated to Completed');
    assert(updatedRem.notes.includes('Booking secured'), 'Notes field updated successfully');

    // Test 9: Verify dismissed alerts after setting reminder to Completed
    const postAlertsRes = await fetch(`${API_URL}/alerts/active`);
    const postActiveAlerts = await postAlertsRes.json();
    const rohanAlertPost = postActiveAlerts.find(a => a.reminder_id === createdRem.id);
    assert(rohanAlertPost === undefined, 'Active alert is automatically dismissed/filtered out when status transitions away from Active');

    // Test 10: Reports Summary Validation
    const reportsRes = await fetch(`${API_URL}/reports/summary`);
    const reportsJson = await reportsRes.json();
    assert(reportsRes.status === 200, 'GET /api/reports/summary responds with 200');
    assert(reportsJson.stats.totalCustomers >= 1, 'Analytics detects customer base correctly');
    assert(reportsJson.statusDistribution.Completed >= 1, 'Analytics groups Completed status count correctly');

    // Test 11: Alert Dismissal & Re-triggering Prevention
    const alertsToDismissRes = await fetch(`${API_URL}/alerts/active`);
    const activeAlertsToDismiss = await alertsToDismissRes.json();
    assert(activeAlertsToDismiss.length > 0, 'Active alerts exist to perform dismissal test');
    
    if (activeAlertsToDismiss.length > 0) {
      const alertToDismiss = activeAlertsToDismiss[0];
      const dismissRes = await fetch(`${API_URL}/alerts/${alertToDismiss.alert_id}/dismiss`, {
        method: 'PATCH'
      });
      const dismissJson = await dismissRes.json();
      assert(dismissRes.status === 200, 'Dismissing alert returns 200 status');
      assert(dismissJson.success === true, 'Dismissing alert returns success: true');

      // Re-fetch active alerts - this triggers the engine calculation again!
      const postDismissAlertsRes = await fetch(`${API_URL}/alerts/active`);
      const postDismissAlerts = await postDismissAlertsRes.json();
      const foundDismissed = postDismissAlerts.find(a => a.alert_id === alertToDismiss.alert_id);
      assert(foundDismissed === undefined, 'Dismissed alert remains dismissed and is NOT re-triggered by the engine on subsequent runs');
    }

  } catch (err) {
    console.error('❌ CRITICAL TEST SCRIPT ERROR:', err);
    failed++;
  }

  console.log('\n======================================');
  console.log(`🏁 TEST EXECUTION COMPLETE`);
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
