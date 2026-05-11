const { test, expect } = require('@playwright/test');
const VisitOurStorePage = require('../../pages/VisitOurStore');

test.describe('Regression - Sprint 2 - Contact Us Page', () => {

  test('Validate Contact Us breadcrumb @regression', async ({ page, request }) => {

    const visitOurStore = new VisitOurStorePage(page, request);

    await visitOurStore.navigate('information/book-appointment');
    await visitOurStore.validateBreadcrumb();
    await visitOurStore.BookAndAppientment(); // if you want to fill form

  });

});