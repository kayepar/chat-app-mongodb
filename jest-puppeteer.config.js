module.exports = {
    launch: {
        headless: false,
        slowMo: 20,
        devtools: true,
        args: ['--window-size=1920,1080'],
        dumpio: true,
    },
    server: {
        // command: 'node src/server.js',
        command: 'npm run dev-test',
        port: 80,
        launchTimeout: 50000,
        usedPortAction: 'kill',
        debug: true,
    },
};
