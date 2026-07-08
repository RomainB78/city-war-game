module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^shared$': '<rootDir>/../shared/src'
  },
  testMatch: ['**/__tests__/**/*.test.ts']
};
