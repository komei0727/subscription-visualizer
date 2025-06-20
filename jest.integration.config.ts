import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig: Config = {
  displayName: 'integration',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/tests/integration/setup.ts'
  ],
  testMatch: [
    '<rootDir>/tests/integration/db/**/*.test.ts',
    '<rootDir>/tests/integration/services/**/*.test.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 1, // Run integration tests sequentially
}

export default createJestConfig(customJestConfig)