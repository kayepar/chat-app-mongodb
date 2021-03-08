module.exports = {
    collectCoverageFrom: ['src/*/*.js', 'src/*.js', '!src/index.js'],
    globals: {
        URL: 'http://localhost',
    },
    // testMatch: ['**/tests/**/*.test.js'],
    testPathIgnorePatterns: ['<rootDir>/tests/e2e'],
    verbose: true,
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    testEnvironment: 'node',
};
