module.exports = {
    launch: {
        headless: false,
        slowMo: 40,
        devtools: true,
        args: ['--window-size=1920,1080'],
        dumpio: true,
    },
    server: {
        command: 'node src/index.js',
        port: 80,
    },
};
