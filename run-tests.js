const { exec } = require('child_process');

console.log("🚀 Starting Playwright Test Bot...");

exec('npx playwright test', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`⚠️ STDERR: ${stderr}`);
  }

  console.log(`✅ Test Results:\n${stdout}`);

  console.log("📊 Opening report...");
  exec('npx playwright show-report');
});