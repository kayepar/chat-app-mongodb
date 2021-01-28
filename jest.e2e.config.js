module.exports = {
    // setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    collectCoverageFrom: ['src/*/*.js', 'src/*.js'],
    preset: 'jest-puppeteer',
    globals: {
        URL: 'http://localhost',
    },
    testMatch: ['**/tests/e2e/*.test.js'],
    verbose: true,
};
