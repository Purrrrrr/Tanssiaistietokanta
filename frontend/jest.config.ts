import type {Config} from 'jest'

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
  ],
  setupFiles: ['<rootDir>/src/__mocks__/jestSetup.js'],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^libraries/(.*)$': '<rootDir>/src/libraries/$1',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
  },
}

export default config
