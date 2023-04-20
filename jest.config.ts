import type {Config} from 'jest';

const config: Config = {
  verbose: true,
  testMatch: [
    // '**/test/**/*.test.(ts|js)'
    '**/test/**/*.test.(js)'
  ]
};

export default config;