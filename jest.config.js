module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  clearMocks: true,
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/src/demo_tests/'],
};
