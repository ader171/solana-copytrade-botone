// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"], // Points to your tests
  moduleNameMapper: {
    "^@utils/(.*)$": "<rootDir>/src/utils/$1", // Maps your aliases
    "^@constants/(.*)$": "<rootDir>/constants/$1",
  },
};
