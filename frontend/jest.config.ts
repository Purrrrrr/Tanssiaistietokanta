import type {Config} from 'jest'

const config: Config = {
  verbose: true,
  preset: 'ts-jest/presets/js-with-ts',
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
  ],
}

export default config
