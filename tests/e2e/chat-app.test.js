/* eslint-disable no-undef */
require('../../jest-puppeteer.config');

const timeout = 40000;

let page2;

beforeAll(async () => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
});

// await jestPuppeteer.debug();

// todo: error redirects
// todo: re-login to show saved messages

describe('end-to-end tests for chat app', () => {
    describe('first user', () => {
        describe('index page', () => {
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
                    'if email and username are missing, should show validation errors on both fields',
                    async () => {
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
                    'if email and room are missing, should show validation errors on both fields',
                    async () => {
                        const roomInput = await page.$('#room-text');
                        await roomInput.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');

                        await page.click('#username-text');
                        await page.type('#username-text', 'kaye');

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

                        expect(is_room_feedback_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if username and room are missing, should show validation errors on both fields',
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

                        expect(is_room_feedback_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if only email is missing, should show validation error',
                    async () => {
                        const emailInput = await page.$('#email-text');
                        await emailInput.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');

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
                    'if only username is missing, should show validation error',
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
                    'if only room is missing, should show validation error',
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

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await page.$eval(
                            '[data-testid="email-feedback1"]',
                            (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                        );

                        expect(is_email_feedback1_shown).toBe(true);
                    },
                    timeout
                );
            });

            describe.only('submit form', () => {
                test(
                    'if all fields are valid, should submit form when button is clicked',
                    async () => {
                        const emailInput = await page.$('#email-text');
                        await emailInput.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');

                        await page.click('#email-text');
                        await page.type('#email-text', 'callie.par@gmail.com');

                        const usernameInput = await page.$('#username-text');
                        await usernameInput.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');

                        await page.click('#username-text');
                        await page.type('#username-text', 'callie');

                        const roomInput = await page.$('#room-text');
                        await roomInput.click({ clickCount: 3 });
                        await page.keyboard.press('Backspace');

                        await page.click('#room-text');
                        await page.type('#room-text', 'html');

                        await page.click('#start-button');

                        await page.waitForTimeout(2000);

                        expect(page.url()).toContain('chat.html');
                    },
                    timeout
                );
            });
        });

        describe('chat page', () => {
            test(
                'message section, should display welcome message from admin',
                async () => {
                    await page.waitForSelector('.messages-box', { visible: true });
                    await page.waitForTimeout(2000);

                    const adminMessage = await page.$eval('div[id*=Admin] p', (element) => element.innerHTML);

                    expect(adminMessage).toContain('Welcome');
                },
                timeout
            );

            test(
                `sidebar, should show room name in 'current chat room' section`,
                async () => {
                    await page.waitForSelector('#current-room-section', { visible: true });

                    const room = await page.$eval('#current-room-section div', (div) => div.innerHTML.trim());

                    expect(room).not.toBe('');
                },
                timeout
            );

            test(
                `sidebar, should show name in 'users' section)`,
                async () => {
                    await page.waitForSelector('#users-section', { visible: true });

                    const names = await page.$$eval('#users div', (options) => {
                        return options.map((item) => item.innerHTML.trim());
                    });

                    expect(names.join(',')).toContain('(you)');
                },
                timeout
            );
        });
    });

    describe.only('second user', () => {
        describe('index page', () => {
            test(
                'should display available rooms button (with options hidden)',
                async () => {
                    page2 = await browser.newPage();

                    await page2.goto(URL, { waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(2000);

                    const is_available_rooms_shown = await page2.$eval(
                        '#active-rooms',
                        (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
                    );

                    expect(is_available_rooms_shown).toBe(true);

                    const active_rooms_menu = await page2.$('#active-rooms-menu');
                    const active_rooms_menu_className = await page2.evaluate(
                        (element) => element.className,
                        active_rooms_menu
                    );

                    expect(active_rooms_menu_className).not.toContain('show');
                },
                timeout
            );

            test(
                'should show options when active rooms button is clicked',
                async () => {
                    await page2.click('#active-rooms');
                    await page.waitForTimeout(2000);

                    const active_rooms_menu = await page2.$('#active-rooms-menu');
                    const active_rooms_menu_className = await page2.evaluate(
                        (element) => element.className,
                        active_rooms_menu
                    );

                    expect(active_rooms_menu_className).toContain('show');
                },
                timeout
            );

            test(
                'should have two options available in active rooms dropdown',
                async () => {
                    const options_count = await page2.$$eval('#active-rooms-menu a', (options) => options.length);

                    expect(options_count).toBe(2);
                },
                timeout
            );

            test(
                'on hover, active rooms options should correctly change color',
                async () => {
                    const first_option = await page2.$('#active-rooms-menu > a');
                    await first_option.hover();

                    const bgcolor_on_hover = await page2.evaluate(
                        (element) => window.getComputedStyle(element).getPropertyValue('background-color'),
                        first_option
                    );

                    expect(bgcolor_on_hover).not.toBe('rgb(255, 255, 255)'); // not white
                },
                timeout
            );
        });
    });
});
