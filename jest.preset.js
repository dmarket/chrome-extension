const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(facade.spec).+(ts|js)?(x)'],
  passWithNoTests: true,
  collectCoverage: true,
  coverageReporters: ['text'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
