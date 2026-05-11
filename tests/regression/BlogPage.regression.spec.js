const { test, expect } = require('@playwright/test');
const BlogPage = require('../../pages/BlogPage');
const BasePage = require('../../pages/BasePage');

test.describe('Regression - Sprint 2 - Blog Page', () => {

  test('Validate Blog breadcrumb @regression', async ({ page, request }) => {

    const blogpage = new BlogPage(page, request);

    await blogpage.navigate('/blog');
    await blogpage.validateBreadcrumb();

  });

  test('Validate all blog links @regression', async ({ page, request }) => {

    test.setTimeout(180000);

    const basePage = new BasePage(page, request);
    await basePage.navigate('/blog');

    const brokenLinks = await basePage.validateAllBlogsLinks();

    expect(brokenLinks).toEqual([]);

  });

});
