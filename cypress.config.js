const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:3000",
    supportFile: "tests/cypress/support/e2e.js",
    specPattern: "tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    videosFolder: "tests/cypress/videos",
    screenshotsFolder: "tests/cypress/screenshots"
  },
  env: {
    token: "NzA0NDEyMjg5NzU5MDUxOTM2.G8UaV3.9xGErWswXp91lelU-SxvS3MhxVZrnSIaWv7nnc"
  }
})
