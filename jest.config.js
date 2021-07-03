module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/demo_tests/*.ts'],
  clearMocks: true,
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  verbose: true,
  resetMocks: true,
};
