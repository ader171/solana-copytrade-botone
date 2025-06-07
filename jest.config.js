// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/solana-dex-parser/src'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1'
  },
  testMatch: [
    '**/src/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '**/solana-dex-parser/src/__tests__/**/*.[jt]s?(x)'
  ]
};
