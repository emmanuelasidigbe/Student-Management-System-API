import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Use ts-jest for handling TypeScript
  testEnvironment: "node", // Use node environment for testing
  clearMocks: true, // Clear mock data between tests

  // Collect code coverage
  collectCoverage: true,
  coverageDirectory: "coverage",

  // Transform TypeScript files
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // File extensions for modules
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],

  // Detect test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

  // Ignore patterns for testing
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Ignore transformation for node_modules
  transformIgnorePatterns: ["/node_modules/"],

  // Add root directory if necessary
  // rootDir: "<rootDir>",
};

export default config;
