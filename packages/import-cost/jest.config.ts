import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    collectCoverageFrom: ['src/**/*.{js,ts}'],
    collectCoverage: true,
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
    testEnvironment: 'node',
    verbose: true,
    setupFilesAfterEnv: ['jest-extended'],
    reporters: ['default', 'jest-html-reporters']
};
// eslint-disable-next-line import/no-default-export
export default config;
