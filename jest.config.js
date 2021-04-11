module.exports = {
    collectCoverageFrom: ['src/*/*.js', 'src/*.js', '!src/index.js'],
    globals: {
        URL: 'http://localhost',
    },
    // testMatch: ['**/tests/**/*.test.js'],
    testPathIgnorePatterns: ['<rootDir>/tests/e2e', '<rootDir>/node_modules'],
    verbose: true,
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testEnvironment: 'node',
};
