
{
  "extensionsToTreatAsEsm": [".js"],
  "testEnvironment": "jsdom",
  "testMatch": ["**/tests/**/*.test.js"],
  "moduleNameMapper": {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  "transform": {},
  "transformIgnorePatterns": [
    "node_modules/(?!(module-to-transform)/)"
  ],
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "collectCoverageFrom": [
    "js/**/*.js",
    "!js/main.js",
    "!js/constants.js"
  ],
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"]
}
