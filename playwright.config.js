const { defineConfig } = require('@playwright/test');
const env = require('./configs/envSelector');
const fs = require('fs');

console.log('Running ENV:', env.envName);
console.log('BaseURL:', env.baseURL);

if (!fs.existsSync('./allure-results')) {
  fs.mkdirSync('./allure-results', { recursive: true });
}

if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results', { recursive: true });
}

const authFile = './auth.json';
const hasAuth = fs.existsSync(authFile);

module.exports = defineConfig({
  testDir: './tests',

  timeout: 60000,

  retries: process.env.CI ? 2 : 0,

   workers: 1, 

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],

  use: {
    baseURL: env.baseURL,
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },

  projects: [

    // Run login only if session does not exist
    ...(!hasAuth ? [{
      name: 'setup',
      testMatch: /login\.setup\.spec\.js/
    }] : []),

    {
      name: 'chromium',
      ...(hasAuth ? {} : { dependencies: ['setup'] }),
      use: {
        browserName: 'chromium',
        storageState: authFile
      }
    }

  ]
});