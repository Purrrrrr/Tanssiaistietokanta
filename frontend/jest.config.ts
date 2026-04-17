import type {Config} from 'jest'

const config: Config = {
  verbose: true,
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
  ],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
}

export default config
