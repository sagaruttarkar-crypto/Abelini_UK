const dev = require('./dev.env');
const staging = require('./staging.env');
const prod = require('./prod.env');

const environments = {
  dev,
  staging,
  prod
};

// ✅ FIX: trim + normalize
const selectedEnv = (process.env.TEST_ENV || 'prod').trim().toLowerCase();

if (!environments[selectedEnv]) {
  throw new Error(
    `Invalid TEST_ENV value: "${selectedEnv}". Allowed values: ${Object.keys(environments).join(', ')}`
  );
}

module.exports = environments[selectedEnv];