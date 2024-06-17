import type {Config} from 'jest'

const config: Config = {
  verbose: true,
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
  ],
}

export default config
