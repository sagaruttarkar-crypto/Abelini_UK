const { test } = require('@playwright/test');
const CategoryPage = require('../../pages/CategoryPage');

test.describe('Category Page Regression Suite', () => {

  test('Validate All Categories Sequentially @regression', async ({ page }) => {

    test.setTimeout(800000); // 5 minutes (increase because all categories)

    const categoryPage = new CategoryPage(page);

    await categoryPage.validateAllCategories();

  });

});