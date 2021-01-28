module.exports = {
    collectCoverageFrom: ['src/*/*.js', 'src/*.js', '!src/index.js'],
    globals: {
        URL: 'http://localhost',
    },
    // testMatch: ['**/tests/**/*.test.js'],
    testPathIgnorePatterns: ['<rootDir>/tests/e2e'],
    verbose: true,
};
