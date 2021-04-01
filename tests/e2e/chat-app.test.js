/* eslint-disable no-undef */
require('../../jest-puppeteer.config');

const timeout = 40000;

let page2;

beforeAll(async () => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
});

// await jestPuppeteer.debug();

const clearField = async (activePage, id) => {
    const element = await activePage.$(id);
    await element.click({ clickCount: 3 });
    await activePage.keyboard.press('Backspace');
};

const getDisplayValue = async (activePage, id) => {
    return await activePage.$eval(
        id,
        (element) => window.getComputedStyle(element).getPropertyValue('display') !== 'none'
    );
};

const getClassName = async (activePage, targetElement) => {
    return await activePage.evaluate((element) => element.className, targetElement);
};

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

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(true);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="room-feedback"]'
                        );

                        expect(is_username_feedback1_shown).toBe(true);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

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

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(true);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(true);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(false);
                    },
                    timeout
                );

                test(
                    'if email and room are missing, should show validation errors on both fields',
                    async () => {
                        await clearField(page, '#room-text');

                        await page.click('#username-text');
                        await page.type('#username-text', 'kaye');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(true);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(false);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if username and room are missing, should show validation errors on both fields',
                    async () => {
                        await clearField(page, '#username-text');

                        await page.click('#email-text');
                        await page.type('#email-text', 'kaye@gmail.com');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(false);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(true);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if only email is missing, should show validation error',
                    async () => {
                        await clearField(page, '#email-text');

                        await page.click('#username-text');
                        await page.type('#username-text', 'kaye');

                        await page.click('#room-text');
                        await page.type('#room-text', 'javascript');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(true);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(false);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(false);
                    },
                    timeout
                );

                test(
                    'if only username is missing, should show validation error',
                    async () => {
                        await clearField(page, '#username-text');

                        await page.click('#email-text');
                        await page.type('#email-text', 'kaye@gmail.com');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(false);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(true);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(false);
                    },
                    timeout
                );

                test(
                    'if only room is missing, should show validation error',
                    async () => {
                        await page.click('#username-text');
                        await page.type('#username-text', 'kaye');

                        await clearField(page, '#room-text');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(false);

                        const is_username_feedback1_shown = await getDisplayValue(
                            page,
                            '[data-testid="username-feedback1"]'
                        );

                        expect(is_username_feedback1_shown).toBe(false);

                        const is_room_feedback_shown = await getDisplayValue(page, '[data-testid="room-feedback"]');

                        expect(is_room_feedback_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if email is invalid, should show validation error',
                    async () => {
                        await page.click('#room-text');
                        await page.type('#room-text', 'javascript');

                        await clearField(page, '#email-text');
                        await page.click('#email-text');
                        await page.type('#email-text', 'kaye!gmail.com');

                        await page.click('#start-button');

                        const is_email_feedback1_shown = await getDisplayValue(page, '[data-testid="email-feedback1"]');

                        expect(is_email_feedback1_shown).toBe(true);
                    },
                    timeout
                );
            });

            // has only
            describe('submit form', () => {
                test(
                    'if all fields are valid, should submit form when button is clicked',
                    async () => {
                        await clearField(page, '#email-text');
                        await page.click('#email-text');
                        await page.type('#email-text', 'callie.par@gmail.com');

                        await clearField(page, '#username-text');
                        await page.click('#username-text');
                        await page.type('#username-text', 'callie');

                        await clearField(page, '#room-text');
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

    // has only
    describe('second user', () => {
        beforeAll(async () => {
            page2 = await browser.newPage();
            await page2.goto(URL, { waitUntil: 'domcontentloaded' });

            await page.waitForTimeout(2000);
        });

        describe('index page', () => {
            // has skip
            describe('available rooms button', () => {
                test(
                    'should show button (with options hidden)',
                    async () => {
                        const is_available_rooms_shown = await getDisplayValue(page2, '#active-rooms');

                        expect(is_available_rooms_shown).toBe(true);

                        const active_rooms_menu = await page2.$('#active-rooms-menu');
                        const active_rooms_menu_className = await getClassName(page2, active_rooms_menu);

                        expect(active_rooms_menu_className).not.toContain('show');
                    },
                    timeout
                );

                test(
                    'should show options when button is clicked',
                    async () => {
                        await page2.click('#active-rooms');
                        await page.waitForTimeout(2000);

                        const active_rooms_menu = await page2.$('#active-rooms-menu');
                        const active_rooms_menu_className = await getClassName(page2, active_rooms_menu);

                        expect(active_rooms_menu_className).toContain('show');
                    },
                    timeout
                );

                test(
                    'should have two options available',
                    async () => {
                        const options_count = await page2.$$eval('#active-rooms-menu a', (options) => options.length);

                        expect(options_count).toBe(2);
                    },
                    timeout
                );

                test(
                    'on hover, option should correctly change color',
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

                test(
                    'on click, option should be selected as active room',
                    async () => {
                        const option_text = await page2.$eval('#active-rooms-menu > a', (div) => div.innerHTML.trim());

                        await page2.click('#active-rooms-menu > a');

                        const button_text = await page2.$eval('#active-room-text', (span) => span.innerHTML.trim());

                        expect(button_text).toBe(option_text);
                    },
                    timeout
                );

                test(
                    'on click, should clear room input value',
                    async () => {
                        await page2.click('#room-text');
                        await page2.type('#room-text', 'test');

                        await page2.click('#active-rooms');

                        await page2.waitForSelector('#active-rooms-menu', { visible: true });

                        await page2.click('#active-rooms-menu > a');

                        const room_text_value = await page2.$eval('#room-text', (input) => input.value.trim());

                        expect(room_text_value).toBe('');
                    },
                    timeout
                );

                test(
                    `clear selection option, should reset button`,
                    async () => {
                        await page2.click('#active-rooms');
                        await page2.waitForSelector('#active-rooms-menu', { visible: true });

                        await page2.click('a#clear');

                        const button_text = await page2.$eval('#active-room-text', (span) => span.innerHTML.trim());

                        expect(button_text).toBe('Join an active room');
                    },
                    timeout
                );
            });

            describe('modal window (room existing)', () => {
                beforeAll(async () => {
                    await page2.click('#email-text');
                    await page2.type('#email-text', 'kaye.cenizal@gmail.com');

                    await page2.click('#username-text');
                    await page2.type('#username-text', 'kaye');

                    await page2.click('#room-text');
                    await page2.type('#room-text', 'html');
                });

                test(
                    'should be displayed if room already exists',
                    async () => {
                        await page2.keyboard.press('Enter');

                        await page2.waitForSelector('#duplicate-room-modal', { visible: true });

                        const duplicate_room_modal = await page2.$('#duplicate-room-modal');
                        const duplicate_room_modal_className = await getClassName(page2, duplicate_room_modal);

                        expect(duplicate_room_modal_className).toContain('show');
                    },
                    timeout
                );

                test(
                    `if open and 'No' is clicked, should close modal`,
                    async () => {
                        await page2.waitForSelector('#duplicate-room-modal-no-button', { visible: true });

                        await page2.click('#duplicate-room-modal-no-button');

                        const duplicate_room_modal = await page2.$('#duplicate-room-modal-no-button');
                        const duplicate_room_modal_className = await getClassName(page2, duplicate_room_modal);

                        expect(duplicate_room_modal_className).not.toContain('show');
                    },
                    timeout
                );

                test(
                    `if open and 'X' is clicked, should close modal`,
                    async () => {
                        await page2.waitForSelector('#duplicate-room-modal', { hidden: true });

                        await page2.keyboard.press('Enter');

                        await page2.waitForSelector('#duplicate-room-modal', { visible: true });

                        await page2.waitForSelector('#duplicate-room-modal-x-button', { visible: true });
                        await page2.click('#duplicate-room-modal-x-button');

                        const duplicate_room_modal = await page2.$('#duplicate-room-modal-x-button');
                        const duplicate_room_modal_className = await getClassName(page2, duplicate_room_modal);

                        expect(duplicate_room_modal_className).not.toContain('show');
                    },
                    timeout
                );

                // has only
                test(
                    `if open and 'Yes' is clicked, should auto-select room in active rooms dropdown`,
                    async () => {
                        await page2.waitForSelector('#duplicate-room-modal', { hidden: true });

                        await page2.keyboard.press('Enter');

                        await page2.waitForSelector('#duplicate-room-modal', { visible: true });

                        await page2.waitForSelector('#duplicate-room-modal-yes-button', { visible: true });
                        await page2.click('#duplicate-room-modal-yes-button');

                        await page2.waitForSelector('#duplicate-room-modal', { hidden: true });
                        const button_text = await page2.$eval('#active-room-text', (span) => span.innerHTML.trim());

                        expect(button_text).not.toBe('Join an active room');
                    },
                    timeout
                );
            });

            describe('input validation (duplicate credentials)', () => {
                beforeAll(async () => {
                    await clearField(page2, '#email-text');
                    await page2.click('#email-text');
                    await page2.type('#email-text', 'callie.par@gmail.com');

                    await clearField(page2, '#username-text');
                    await page2.click('#username-text');
                    await page2.type('#username-text', 'callie');
                });

                test(
                    'if email and username are already in use, should display error message on both fields',
                    async () => {
                        await page2.keyboard.press('Enter');

                        const is_duplicate_email_error_shown = await getDisplayValue(page2, '#email-feedback');

                        expect(is_duplicate_email_error_shown).toBe(true);

                        const is_duplicate_username_error_shown = await getDisplayValue(page2, '#username-feedback');

                        expect(is_duplicate_username_error_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if email is changed, should hide error message on email field',
                    async () => {
                        await clearField(page2, '#email-text');
                        await page2.click('#email-text');
                        await page2.type('#email-text', 'kaye.cenizal@gmail.com');

                        const is_duplicate_email_error_shown = await getDisplayValue(page2, '#email-feedback');

                        expect(is_duplicate_email_error_shown).toBe(false);

                        const is_duplicate_username_error_shown = await getDisplayValue(page2, '#username-feedback');

                        expect(is_duplicate_username_error_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if username is changed, should hide error message on username field',
                    async () => {
                        await clearField(page2, '#username-text');
                        await page2.click('#username-text');
                        await page2.type('#username-text', 'kaye');

                        const is_duplicate_username_error_shown = await getDisplayValue(page2, '#username-feedback');

                        expect(is_duplicate_username_error_shown).toBe(false);
                    },
                    timeout
                );

                test(
                    'if only email is in use, should display error message on email field',
                    async () => {
                        await clearField(page2, '#email-text');
                        await page2.click('#email-text');
                        await page2.type('#email-text', 'callie.par@gmail.com');

                        await page2.keyboard.press('Enter');

                        const is_duplicate_email_error_shown = await getDisplayValue(page2, '#email-feedback');

                        expect(is_duplicate_email_error_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'if only username is in use, should display error message on username field',
                    async () => {
                        await clearField(page2, '#email-text');
                        await page2.click('#email-text');
                        await page2.type('#email-text', 'kaye.cenizal@gmail.com');

                        await clearField(page2, '#username-text');
                        await page2.click('#username-text');
                        await page2.type('#username-text', 'callie');

                        await page2.keyboard.press('Enter');

                        const is_duplicate_username_error_shown = await getDisplayValue(page2, '#username-feedback');

                        expect(is_duplicate_username_error_shown).toBe(true);
                    },
                    timeout
                );
            });

            // has only
            describe('submit form', () => {
                test(
                    'if all fields are valid, should submit form when enter is pressed',
                    async () => {
                        await clearField(page2, '#email-text');
                        await page2.click('#email-text');
                        await page2.type('#email-text', 'kaye.cenizal@gmail.com');

                        await clearField(page2, '#username-text');
                        await page2.click('#username-text');
                        await page2.type('#username-text', 'kaye');

                        await page2.keyboard.press('Enter');
                        await page2.waitForSelector('#messages-div', { visible: true });

                        expect(page2.url()).toContain('chat.html');
                    },
                    timeout
                );
            });
        });
    });
});
