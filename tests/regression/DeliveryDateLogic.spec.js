// deliveryDate.spec.js

import { test, expect } from '@playwright/test';

test('Validate delivery date for AU (full logic in one file)', async ({ page, request }) => {

  // ================================
  //  Utility: Fetch AU Holidays
  // ================================
  async function fetchAUHolidays(year) {
    const res = await request.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/AU`);
    if (!res.ok()) throw new Error('Failed to fetch holidays');

    const data = await res.json();

    return data.map(h => new Date(h.date));
  }

  // ================================
  //  Utility: Normalize Holidays (Observed logic)
  // ================================
  function normalizeHoliday(date) {
    const d = new Date(date);
    const day = d.getDay();

    if (day === 6) d.setDate(d.getDate() + 2); // Saturday → Monday
    if (day === 0) d.setDate(d.getDate() + 1); // Sunday → Monday

    return d;
  }

  // ================================
  //  Core Delivery Logic
  // ================================
  function calculateExpectedDeliveryDate(orderDate, publicHolidays) {
    let deliveryDate = new Date(orderDate);

    // Step 1: Default 10 days
    deliveryDate.setDate(deliveryDate.getDate() + 10);

    // Step 2: Check if range includes Sunday
    let includesSunday = false;
    let temp = new Date(orderDate);

    while (temp <= deliveryDate) {
      if (temp.getDay() === 0) {
        includesSunday = true;
        break;
      }
      temp.setDate(temp.getDate() + 1);
    }

    // Step 3: Add extra days
    deliveryDate.setDate(
      deliveryDate.getDate() + (includesSunday ? 6 : 5)
    );

    // Step 4: Adjust if weekend
    if (deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    } else if (deliveryDate.getDay() === 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 2);
    }

    // Step 5: Normalize holidays (observed)
    const normalizedHolidays = publicHolidays.map(normalizeHoliday);

    const isHoliday = (date) =>
      normalizedHolidays.some(h => h.toDateString() === date.toDateString());

    // Step 6: Push if holiday
    while (isHoliday(deliveryDate)) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }

    return deliveryDate;
  }

  // ================================
  //  Test Execution Starts Here
  // ================================

  await page.goto('https://www.abelini.com/product/4-prong-setting-classic-oval-shape-hidden-halo-diamond-engagement-ring-rinw8477-lbg#metal=GL_9K_W'); // 🔁 replace

  // Use AU timezone (VERY IMPORTANT)
  const orderDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
  );

  const year = orderDate.getFullYear();

  //  Fetch holidays (current + next year)
  const holidaysThisYear = await fetchAUHolidays(year);
  const holidaysNextYear = await fetchAUHolidays(year + 1);

  const allHolidays = [...holidaysThisYear, ...holidaysNextYear];

  //  Calculate expected delivery
  const expectedDate = calculateExpectedDeliveryDate(orderDate, allHolidays);

  const formattedExpected = expectedDate.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  console.log('Order Date:', orderDate.toDateString());
  console.log('Expected Delivery:', formattedExpected);

  // ================================
  //  Get UI Value
  // ================================
const rawText = await page
  .locator("//section[@id='product-detail']//p[contains(.,'Delivery')]")
  .first()
  .innerText();

//console.log('Full UI Text:', rawText);

// Extract date
const match = rawText.match(/\d{1,2}(st|nd|rd|th)\s+\w+\s+\d{4}/);

if (!match) {
  throw new Error('Delivery date not found');
}

const actualDateText = match[0];

// Normalize
const normalizedActual = actualDateText.replace(/(st|nd|rd|th)/, '');

console.log('Actual (Normalized):', normalizedActual);
console.log('Expected:', formattedExpected);

// Assertion
expect(normalizedActual).toBe(formattedExpected);

});