const nodemon = require('nodemon');
const jestPuppeteerConfig = require('../../../jest-puppeteer.config');

const timeout = 40000;

beforeAll(async () => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
});

// await jestPuppeteer.debug();

// todo: error redirects
// todo: feedback error messages for email
// todo: re-login to show saved messages

describe('end-to-end tests for chat app', () => {
    describe('on load', () => {
        test(
            `page should have 'myChat' as title`,
            async () => {
                const title = await page.title();

                expect(title).toBe('myChat');
            },
            timeout
        );

        test(
            'page should have focus on the email input box',
            async () => {
                const is_email_text_focused = await page.$eval(
                    '[data-testid="email-text"]',
                    (element) => document.activeElement === element
                );

                expect(is_email_text_focused).toBe(true);
            },
            timeout
        );
    });

    describe('input validation', () => {
        test(
            'if missing all three fields, should show validation errors',
            async () => {
                await page.click('#start-button');

                const is_email_feedback1_shown = await page.$eval(
                    '[data-testid="email-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_email_feedback1_shown).toBe(true);

                const is_username_feedback1_shown = await page.$eval(
                    '[data-testid="username-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_username_feedback1_shown).toBe(true);

                const is_room_feedback_shown = await page.$eval(
                    '[data-testid="room-feedback"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_room_feedback_shown).toBe(true);
            },
            timeout
        );

        test(
            'if email is missing, should show validation error',
            async () => {
                await page.click('#username-text');
                await page.type('#username-text', 'kaye');

                await page.click('#room-text');
                await page.type('#room-text', 'javascript');

                await page.click('#start-button');

                const is_email_feedback1_shown = await page.$eval(
                    '[data-testid="email-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_email_feedback1_shown).toBe(true);

                const is_username_feedback1_shown = await page.$eval(
                    '[data-testid="username-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_username_feedback1_shown).toBe(false);

                const is_room_feedback_shown = await page.$eval(
                    '[data-testid="room-feedback"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_room_feedback_shown).toBe(false);
            },
            timeout
        );

        test(
            'if username is missing, should show validation error',
            async () => {
                const usernameInput = await page.$('#username-text');
                await usernameInput.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');

                await page.click('#email-text');
                await page.type('#email-text', 'kaye@gmail.com');

                await page.click('#start-button');

                const is_email_feedback1_shown = await page.$eval(
                    '[data-testid="email-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_email_feedback1_shown).toBe(false);

                const is_username_feedback1_shown = await page.$eval(
                    '[data-testid="username-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_username_feedback1_shown).toBe(true);

                const is_room_feedback_shown = await page.$eval(
                    '[data-testid="room-feedback"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_room_feedback_shown).toBe(false);
            },
            timeout
        );

        test(
            'if room is missing, should show validation error',
            async () => {
                await page.click('#username-text');
                await page.type('#username-text', 'kaye');

                const roomInput = await page.$('#room-text');
                await roomInput.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');

                await page.click('#start-button');

                const is_email_feedback1_shown = await page.$eval(
                    '[data-testid="email-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_email_feedback1_shown).toBe(false);

                const is_username_feedback1_shown = await page.$eval(
                    '[data-testid="username-feedback1"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_username_feedback1_shown).toBe(false);

                const is_room_feedback_shown = await page.$eval(
                    '[data-testid="room-feedback"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                expect(is_room_feedback_shown).toBe(true);
            },
            timeout
        );

        test(
            'if email is invalid, should show validation error',
            async () => {
                await page.click('#room-text');
                await page.type('#room-text', 'javascript');

                const emailInput = await page.$('#email-text');
                await emailInput.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');

                await page.click('#email-text');
                await page.type('#email-text', 'kaye!gmail.com');

                await page.click('#start-button').catch((e) => console.log('hello'));

                await page.waitForSelector('#email-feedback', { visible: true });

                const is_email_feedback_shown = await page.$eval(
                    '[id="email-feedback"]',
                    (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                );

                console.log(is_email_feedback_shown);

                expect(is_email_feedback_shown).toBe(true);
            },
            timeout
        );
    });

    describe('submit form', () => {
        // test('if all fields are valid, should submit form when button is clicked', () => {}, timeout);
    });
});
