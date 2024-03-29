/* eslint-disable no-undef */
require('../../jest-puppeteer.config');

const timeout = 40000;

let page2;
jest.setTimeout(20000);

beforeAll(async () => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
});

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

const getElementValue = async (activePage, targetElement) => {
    return await activePage.$eval(targetElement, (element) => element.innerHTML.trim());
};

const getInputValue = async (activePage, targetInput) => {
    return await activePage.$eval(targetInput, (input) => input.value);
};

const getAdminMessages = async (activePage) => {
    return await activePage.$$eval('div[id*=Admin] p', (options) => {
        return options.map((item) => item.innerHTML);
    });
};

const getSentMessages = async (activePage) => {
    return await activePage.$$eval('#messages-div div.row.sent p', (messages) => {
        return messages.map((message) => message.innerHTML);
    });
};

const getReceivedMessages = async (activePage) => {
    return await activePage.$$eval('#messages-div div.row.received p', (messages) => {
        return messages.map((message) => message.innerHTML);
    });
};

const joinExistingRooom = async (activePage, email, username) => {
    await activePage.click('#email-text');
    await activePage.type('#email-text', email);

    await activePage.click('#username-text');
    await activePage.type('#username-text', username);

    await activePage.click('#active-rooms');

    await activePage.waitForSelector('#active-rooms-menu', { visible: true });

    await activePage.click('#active-rooms-menu > a');

    await activePage.waitForTimeout(1000);

    await activePage.click('#start-button');

    await activePage.waitForSelector('#messages-div', { visible: true });

    await activePage.waitForTimeout(1000);
};

const joinNewRoom = async (activePage, email, username, room) => {
    await activePage.click('#email-text');
    await activePage.type('#email-text', email);

    await activePage.click('#username-text');
    await activePage.type('#username-text', username);

    await activePage.click('#room-text');
    await activePage.type('#room-text', room);

    await activePage.click('#start-button');

    await activePage.waitForSelector('#messages-div', { visible: true });

    await activePage.waitForTimeout(1000);
};

describe('End-to-end tests for chat app', () => {
    describe('First user', () => {
        describe('Index page', () => {
            describe('On load', () => {
                test(
                    `Page should have 'myChat' as title`,
                    async () => {
                        const title = await page.title();

                        expect(title).toBe('myChat');
                    },
                    timeout
                );

                test(
                    'Page should have focus on the email input box',
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

            describe('Input validation', () => {
                test(
                    'If missing all three fields, should show validation errors',
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
                    'If email and username are missing, should show validation errors on both fields',
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
                    'If email and room are missing, should show validation errors on both fields',
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
                    'If username and room are missing, should show validation errors on both fields',
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
                    'If only email is missing, should show validation error',
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
                    'If only username is missing, should show validation error',
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
                    'If only room is missing, should show validation error',
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
                    'If email is invalid, should show validation error',
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

            describe('Submit form', () => {
                test(
                    'If all fields are valid, should submit form when button is clicked',
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

        describe('Chat page', () => {
            test(
                'Message section, should display welcome message from admin',
                async () => {
                    await page.waitForSelector('.messages-box', { visible: true });
                    await page.waitForTimeout(2000);

                    const adminMessage = await getElementValue(page, 'div[id*=Admin] p');

                    expect(adminMessage).toContain('Welcome');
                },
                timeout
            );

            test(
                `Sidebar, should show room name in 'Current Chat Room' section`,
                async () => {
                    await page.waitForSelector('#current-room-section', { visible: true });

                    const room = await getElementValue(page, '#current-room-section div');

                    expect(room).not.toBe('');
                },
                timeout
            );

            test(
                `Sidebar, should show name in 'Users' section`,
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

    describe('Second user', () => {
        beforeAll(async () => {
            page2 = await browser.newPage();
            await page2.goto(URL, { waitUntil: 'domcontentloaded' });

            await page.waitForTimeout(2000);
        });

        describe('Index page', () => {
            describe('Available rooms button', () => {
                test(
                    'Should show button (with options hidden)',
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
                    'Should show options when button is clicked',
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
                    'Should have options available (the same number as current active rooms)',
                    async () => {
                        const options_count = await page2.$$eval('#active-rooms-menu a', (options) => options.length);

                        expect(options_count).toBe(2);
                    },
                    timeout
                );

                test(
                    'On hover, option should correctly change color',
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
                    'On click, option should be selected as active room',
                    async () => {
                        const option_text = await getElementValue(page2, '#active-rooms-menu > a');

                        await page2.click('#active-rooms-menu > a');

                        const button_text = await getElementValue(page2, '#active-room-text');

                        expect(button_text).toBe(option_text);
                    },
                    timeout
                );

                test(
                    'On click, should clear room input value',
                    async () => {
                        await page2.click('#room-text');
                        await page2.type('#room-text', 'test');

                        await page2.click('#active-rooms');

                        await page2.waitForSelector('#active-rooms-menu', { visible: true });

                        await page2.click('#active-rooms-menu > a');

                        const room_text_value = await getInputValue(page2, '#room-text');

                        expect(room_text_value).toBe('');
                    },
                    timeout
                );

                test(
                    'Clear selection option, should reset button to default',
                    async () => {
                        await page2.click('#active-rooms');
                        await page2.waitForSelector('#active-rooms-menu', { visible: true });

                        await page2.click('a#clear');

                        const button_text = await getElementValue(page2, '#active-room-text');

                        expect(button_text).toBe('Join an active room');
                    },
                    timeout
                );
            });

            describe('Modal window (room existing)', () => {
                beforeAll(async () => {
                    await page2.click('#email-text');
                    await page2.type('#email-text', 'kaye.cenizal@gmail.com');

                    await page2.click('#username-text');
                    await page2.type('#username-text', 'kaye');

                    await page2.click('#room-text');
                    await page2.type('#room-text', 'html');
                });

                test(
                    'Should be displayed if room already exists',
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
                    `If open and 'No' is clicked, should close modal`,
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
                    `If open and 'X' is clicked, should close modal`,
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

                test(
                    `If open and 'Yes' is clicked, should auto-select room in active rooms dropdown`,
                    async () => {
                        await page2.waitForSelector('#duplicate-room-modal', { hidden: true });

                        await page2.keyboard.press('Enter');

                        await page2.waitForSelector('#duplicate-room-modal', { visible: true });

                        await page2.waitForSelector('#duplicate-room-modal-yes-button', { visible: true });
                        await page2.click('#duplicate-room-modal-yes-button');

                        await page2.waitForSelector('#duplicate-room-modal', { hidden: true });

                        const button_text = await getElementValue(page2, '#active-room-text');

                        expect(button_text).not.toBe('Join an active room');
                    },
                    timeout
                );
            });

            describe('Input validation (duplicate credentials)', () => {
                beforeAll(async () => {
                    await clearField(page2, '#email-text');
                    await page2.click('#email-text');
                    await page2.type('#email-text', 'callie.par@gmail.com');

                    await clearField(page2, '#username-text');
                    await page2.click('#username-text');
                    await page2.type('#username-text', 'callie');
                });

                test(
                    'If email and username are already in use, should display error message on both fields',
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
                    'If email is changed, should hide error message on email field',
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
                    'If username is changed, should hide error message on username field',
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
                    'If only email is in use, should display error message on email field',
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
                    'If only username is in use, should display error message on username field',
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

            describe('Submit form', () => {
                test(
                    'If all fields are valid, should submit form when enter is pressed',
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

            describe('Chat page', () => {
                test(
                    'Message section, focus should be on the message textbox',
                    async () => {
                        const is_message_text_focused = await page2.$eval(
                            '#message-textbox',
                            (element) => document.activeElement === element
                        );

                        expect(is_message_text_focused).toBe(true);
                    },
                    timeout
                );
            });
        });
    });

    describe('First and second user  (same chatroom interaction tests)', () => {
        describe('Sidebar', () => {
            test(
                `First user: Should show 2 names in the 'Users' section`,
                async () => {
                    await page2.waitForSelector('#users-section', { visible: true });

                    const page2_names = await page2.$$eval('#users div', (options) => {
                        return options.map((item) => item);
                    });

                    expect(page2_names).toHaveLength(2);
                },
                timeout
            );

            test(
                `Second user: Should show 2 names in the 'Users' section`,
                async () => {
                    await page.waitForSelector('#users-section', { visible: true });

                    const page1_names = await page.$$eval('#users div', (options) => {
                        return options.map((item) => item);
                    });

                    expect(page1_names).toHaveLength(2);
                },
                timeout
            );
        });

        describe('Admin message', () => {
            test(
                'First user: If another user joined in, should get notification message from admin',
                async () => {
                    await page.bringToFront();

                    const admin_messages = await getAdminMessages(page);

                    expect(admin_messages[1]).toContain('has joined!');
                },
                timeout
            );
        });

        describe('Messaging', () => {
            test(
                'Second user: If Enter key is pressed after typing, should send message',
                async () => {
                    await page2.bringToFront();

                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', 'Hi, this is a test.');

                    await page2.keyboard.press('Enter');

                    await page2.waitForTimeout(2000);

                    const message_value = await getElementValue(page2, '#messages-div div.row.sent p');

                    expect(message_value).toBe('Hi, this is a test.');
                },
                timeout
            );

            test(
                'First user: Should be able to receive message',
                async () => {
                    await page.bringToFront();

                    await page.waitForTimeout(2000);

                    const received_messages = await getReceivedMessages(page);

                    expect(received_messages[received_messages.length - 1]).toBe('Hi, this is a test.');
                },
                timeout
            );

            test(
                'First user: If Send button is clicked, should send message',
                async () => {
                    await page.click('#message-textbox');
                    await page.type('#message-textbox', 'Test 1, 2, 3.');

                    await page.click('button[type=submit]');

                    await page.waitForTimeout(2000);

                    const sent_messages = await getSentMessages(page);

                    expect(sent_messages[sent_messages.length - 1]).toBe('Test 1, 2, 3.');
                },
                timeout
            );

            test(
                'First user: If Enter key is pressed, should clear message text box',
                async () => {
                    await page.click('#message-textbox');
                    await page.type('#message-textbox', 'Hello');

                    await page.keyboard.press('Enter');

                    await page.waitForTimeout(2000);

                    const message_text_value = await getInputValue(page, '#message-textbox');

                    expect(message_text_value).toBe('');
                },
                timeout
            );

            test(
                'Second user: If Send button is clicked, should clear message text box',
                async () => {
                    await page2.bringToFront();

                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', 'Hi!');

                    await page2.keyboard.press('Enter');

                    await page2.waitForTimeout(2000);

                    const message_text_value = await getInputValue(page2, '#message-textbox');

                    expect(message_text_value).toBe('');
                },
                timeout
            );

            test(
                'Second user: If message is long and Enter key is pressed, should still send message',
                async () => {
                    const testMessage =
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non mi in nisi mattis laoreet in ut felis. Quisque libero leo, faucibus nec nibh vestibulum, finibus rutrum lorem. Etiam tincidunt lectus metus, a dignissim urna dictum eget. In hac habitasse platea dictumst. Aliquam enim turpis, facilisis eu libero nec, consectetur tincidunt felis. Suspendisse ut lectus et velit molestie volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.';

                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', testMessage);

                    await page2.keyboard.press('Enter');

                    await page2.waitForTimeout(2000);

                    const sent_messages = await getSentMessages(page2);

                    expect(sent_messages[sent_messages.length - 1]).toBe(testMessage);
                },
                timeout
            );

            test(
                'First user: Should be able to receive long message',
                async () => {
                    const testMessage =
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non mi in nisi mattis laoreet in ut felis. Quisque libero leo, faucibus nec nibh vestibulum, finibus rutrum lorem. Etiam tincidunt lectus metus, a dignissim urna dictum eget. In hac habitasse platea dictumst. Aliquam enim turpis, facilisis eu libero nec, consectetur tincidunt felis. Suspendisse ut lectus et velit molestie volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.';

                    await page.bringToFront();

                    await page.waitForTimeout(1000);

                    const received_messages = await getReceivedMessages(page);

                    expect(received_messages[received_messages.length - 1]).toBe(testMessage);
                },
                timeout
            );

            test(
                'Second user: If textbox is empty, should not send message',
                async () => {
                    await page2.bringToFront();

                    await page2.waitForTimeout(1000);

                    await page2.click('#message-textbox');
                    await page2.keyboard.press('Enter');

                    await page2.waitForTimeout(1000);

                    const sent_messages = await getSentMessages(page2);

                    expect(sent_messages).toHaveLength(3);
                },
                timeout
            );

            test(
                'Second user: If message contains offensive words, should not send message',
                async () => {
                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', 'Damn!');
                    await page2.keyboard.press('Enter');

                    await page2.waitForTimeout(1000);

                    const sent_messages = await getSentMessages(page2);

                    expect(sent_messages).toHaveLength(3);
                },
                timeout
            );
        });

        describe('Typing indicator', () => {
            test(
                `First/second users: If one user started typing, should display indicator on other user's screen`,
                async () => {
                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', 'Typing test...');

                    await page2.waitForTimeout(1000);

                    await page.bringToFront();

                    await page.waitForTimeout(1000);

                    const received_messages = await getReceivedMessages(page);

                    expect(received_messages[received_messages.length - 1]).toBe('...');
                },
                timeout
            );

            test(
                `First/second users: If textbox is cleared, should remove typing indicator from other user's screen`,
                async () => {
                    await page2.bringToFront();

                    await clearField(page2, '#message-textbox');

                    await page2.waitForTimeout(1000);

                    await page.bringToFront();

                    await page.waitForTimeout(1000);

                    const received_messages = await getReceivedMessages(page);

                    expect(received_messages).toHaveLength(5);
                },
                timeout
            );
        });

        describe('Emoji picker', () => {
            describe('First user', () => {
                test(
                    'If emoji button is clicked, should display emoji picker',
                    async () => {
                        await page.bringToFront();

                        await page.click('.emoji-button');

                        const is_emoji_picker_shown = await getDisplayValue(page, '.emoji-picker__wrapper');

                        expect(is_emoji_picker_shown).toBe(true);
                    },
                    timeout
                );

                test(
                    'If other element gets focus, should hide emoji picker',
                    async () => {
                        await page.click('#messages-div');

                        const is_emoji_picker_shown = await getDisplayValue(page, '.emoji-picker__wrapper');

                        expect(is_emoji_picker_shown).toBe(false);
                    },
                    timeout
                );

                test(
                    'If emoji is clicked, should add to message textbox',
                    async () => {
                        await page.click('.emoji-button');

                        await page.waitForSelector('.emoji-picker__wrapper', { visible: true });

                        await page.click('button[title="smiling face with heart-eyes"]');

                        await page.waitForTimeout(1000);

                        const message_text_value = await getInputValue(page, '#message-textbox');

                        expect(message_text_value).toBe('😍');
                    },
                    timeout
                );

                test(
                    'If Enter key is pressed, should send message with emoji',
                    async () => {
                        await page.keyboard.press('Enter');

                        await page.waitForTimeout(2000);

                        const sent_messages = await getSentMessages(page);

                        expect(sent_messages[sent_messages.length - 1]).toBe('😍');
                    },
                    timeout
                );

                test(
                    'If message textbox has text and an emoji is clicked, should insert emoji at cursor location',
                    async () => {
                        await page.click('#message-textbox');
                        await page.type('#message-textbox', 'Emoji test');

                        const message_textbox = await page.$('#message-textbox');
                        await message_textbox.click({ clickCount: 1 });

                        for (let i = 0; i < 5; ++i) {
                            await page.keyboard.press('ArrowLeft');
                        }

                        await page.click('.emoji-button');

                        await page.waitForSelector('.emoji-picker__wrapper', { visible: true });

                        await page.click('button[title="smiling face with hearts"]');

                        await page.waitForTimeout(1000);

                        const message_text_value = await getInputValue(page, '#message-textbox');

                        expect(message_text_value).toBe('Emoji🥰 test');
                    },
                    timeout
                );

                test(
                    'If Send button is pressed, should send message with emoji',
                    async () => {
                        await page.click('button[type=submit]');

                        await page.waitForTimeout(2000);

                        const sent_messages = await getSentMessages(page);

                        expect(sent_messages[sent_messages.length - 1]).toBe('Emoji🥰 test');
                    },
                    timeout
                );
            });

            describe('Second user', () => {
                test(
                    'Should receive message with emoji',
                    async () => {
                        await page2.bringToFront();

                        await page2.waitForTimeout(1000);

                        const received_messages = await getReceivedMessages(page2);

                        expect(received_messages[received_messages.length - 1]).toBe('Emoji🥰 test');
                    },
                    timeout
                );
            });
        });

        describe('On user disconnect', () => {
            test(
                'First user: If second user leaves the chatroom, should get admin notification',
                async () => {
                    await page2.close();

                    await page.bringToFront();

                    await page.waitForTimeout(1000);

                    const admin_messages = await getAdminMessages(page);

                    expect(admin_messages[admin_messages.length - 1]).toContain('has left!');
                },
                timeout
            );
        });

        describe('On user join - load chatroom messages', () => {
            beforeEach(async () => {
                page2 = await browser.newPage();
                await page2.goto(URL, { waitUntil: 'domcontentloaded' });

                await page2.waitForTimeout(1000);
            });

            afterEach(async () => {
                await page2.waitForTimeout(1000);

                await page2.close();
            });

            test('If user has sent messages, should get both sent and received messages', async () => {
                await joinExistingRooom(page2, 'kaye.cenizal@gmail.com', 'kaye');

                const received_messages = await getReceivedMessages(page2);

                expect(received_messages.length).toBeGreaterThan(0);

                const sent_messages = await getSentMessages(page2);

                expect(sent_messages.length).toBeGreaterThan(0);
            });

            test('If user has no sent messages, should get received messages', async () => {
                await joinExistingRooom(page2, 'john.par@gmail.com', 'john');

                const received_messages = await getReceivedMessages(page2);

                expect(received_messages.length).toBeGreaterThan(0);

                const sent_messages = await getSentMessages(page2);

                expect(sent_messages).toEqual([]);
            });
        });
    });

    describe('First and second user (different chatroom interaction tests)', () => {
        beforeAll(async () => {
            page2 = await browser.newPage();
            await page2.goto(URL, { waitUntil: 'domcontentloaded' });

            await page2.waitForTimeout(1000);
        });

        describe('Messaging', () => {
            test(
                'First/second users: should not receive message sent from another room',
                async () => {
                    await joinNewRoom(page2, 'michael.cenizal@gmail.com', 'renz', 'cobol');

                    await page2.click('#message-textbox');
                    await page2.type('#message-textbox', 'Message from cobol room');

                    await page2.click('button[type=submit]');

                    await page.bringToFront();

                    const received_messages = await getReceivedMessages(page);

                    expect(received_messages).toEqual(expect.not.arrayContaining(['Message from cobol room']));
                },
                timeout
            );
        });

        describe('Sidebar', () => {
            describe('Other Chat Rooms section', () => {
                test(`First user: Should display second user's room in the list`, async () => {
                    const page1_other_room = await getElementValue(page, '#rooms-section div a');

                    expect(page1_other_room).not.toBe('');
                });

                test(
                    `Second user: Should display first user's room in the list`,
                    async () => {
                        await page2.bringToFront();

                        await page2.waitForSelector('#rooms-section', { visible: true });

                        await page2.waitForTimeout(1000);

                        const page2_other_room = await getElementValue(page2, '#rooms-section div a');

                        expect(page2_other_room).not.toBe('');
                    },
                    timeout
                );

                test(
                    'First user: If other room becomes inactive, should remove name from list',
                    async () => {
                        await page2.close();

                        await page.bringToFront();

                        await page.waitForSelector('#rooms-section', { visible: true });

                        await page.waitForTimeout(1000);

                        const page1_other_room = await getElementValue(page, '#rooms-section div');

                        expect(page1_other_room).toBe('');
                    },
                    timeout
                );
            });
        });
    });

    describe('Join another room (from sidebar)', () => {
        describe('Join room modal', () => {
            const roomName = 'node.js';

            test(
                'If room name is clicked, should show modal',
                async () => {
                    page2 = await browser.newPage();
                    await page2.goto(URL, { waitUntil: 'domcontentloaded' });

                    await page2.waitForTimeout(1000);

                    await joinNewRoom(page2, 'kaye.cenizal@gmail.com', 'kaye', roomName);

                    await page.bringToFront();

                    await page.evaluate(() => {
                        localStorage.removeItem('join-room-modal-checked');
                    });

                    await page.waitForTimeout(1000);

                    await page.click('#rooms-section div a');

                    await page.waitForSelector('#join-room-modal', { visible: true });

                    const join_room_modal = await page.$('#join-room-modal');
                    const join_room_modal_className = await getClassName(page, join_room_modal);

                    expect(join_room_modal_className).toContain('show');
                },
                timeout
            );

            test(
                `If 'Do not show me again' is ticked, should not display modal again`,
                async () => {
                    await page.waitForTimeout(2000);

                    await page.evaluate(() => {
                        document.querySelector('#join-room-modal-checkbox-no-show').checked = true;
                        localStorage.setItem('join-room-modal-checked', true);
                    });

                    await page.click('#chosen-room + button'); // No button

                    await page.waitForSelector('#join-room-modal', { visible: false });

                    const newPagePromise = new Promise((tab) => page.once('popup', tab));

                    await page.click('#rooms-section div a'); // join room again

                    const newPage = await newPagePromise; // declare new tab, now you can work with it

                    expect(newPage.url()).toContain(`chat.html?room=${roomName}`);

                    await newPage.close();

                    await page2.close();
                },
                timeout
            );
        });

        describe('Error modal', () => {
            let newPage;

            afterAll(async () => {
                await page2.close();
            });

            test(
                'If credentials are already in use, should show modal',
                async () => {
                    page2 = await browser.newPage();
                    await page2.goto(URL, { waitUntil: 'domcontentloaded' });

                    await page2.waitForTimeout(1000);

                    await joinNewRoom(page2, 'callie@gmail.com', 'callie', 'java');

                    await page.bringToFront();

                    const newPagePromise = new Promise((tab) => page.once('popup', tab));

                    await page.click('#rooms-section div a'); // join room again

                    newPage = await newPagePromise; // declare new tab, now you can work with it

                    await newPage.waitForSelector('#error-modal', { visible: true });

                    const error_modal = await newPage.$('#error-modal');
                    const error_modal_className = await getClassName(newPage, error_modal);

                    expect(error_modal_className).toContain('show');
                },
                timeout
            );

            test(
                'If OK button is clicked, should return to login page',
                async () => {
                    await newPage.waitForSelector('#error-modal-yes-button', { visible: true });
                    await newPage.click('#error-modal-yes-button');

                    await page.waitForTimeout(2000);

                    expect(newPage.url()).toBe('http://localhost/?');

                    await newPage.close();
                },
                timeout
            );
        });
    });

    describe('On mobile', () => {
        beforeAll(async () => {
            await page.setViewport({
                width: 480,
                height: 853,
            });
        });

        test(
            'Should show a collapsed sidebar and a hamburger icon',
            async () => {
                await page.bringToFront();

                await page.waitForTimeout(1000);

                const sidebar_menu = await page.$('#sidebar-menu');
                const sidebar_menu_className = await getClassName(page, sidebar_menu);

                expect(sidebar_menu_className).not.toContain('active');

                const is_hamburger_icon_shown = await getDisplayValue(page, '#sidebar-toggler-2');

                expect(is_hamburger_icon_shown).toBe(true);
            },
            timeout
        );

        test(
            'If hamburger icon is clicked, should show sidebar',
            async () => {
                await page.click('#sidebar-toggler-2');

                await page.waitForTimeout(1000);

                const sidebar_menu = await page.$('#sidebar-menu');
                const sidebar_menu_className = await getClassName(page, sidebar_menu);

                expect(sidebar_menu_className).toContain('active');
            },
            timeout
        );

        test(
            'If sidebar is displayed, should show overlay on other half of screen',
            async () => {
                const overlay = await page.$('.overlay');

                const overlay_classname = await getClassName(page, overlay);

                expect(overlay_classname).toContain('active');
            },
            timeout
        );

        test(
            'If hamburger icon is clicked again, should close sidebar',
            async () => {
                await page.click('#sidebar-toggler-1');

                await page.waitForTimeout(1000);

                const sidebar_menu = await page.$('#sidebar-menu');
                const sidebar_menu_className = await getClassName(page, sidebar_menu);

                expect(sidebar_menu_className).not.toContain('active');
            },
            timeout
        );

        test(
            'If overlay is clicked, should close sidebar',
            async () => {
                await page.click('#sidebar-toggler-2');

                await page.waitForSelector('#sidebar-menu', { visible: true });

                await page.evaluate(() => {
                    document.querySelector('div.overlay').click();
                });

                await page.waitForTimeout(1000);

                const sidebar_menu = await page.$('#sidebar-menu');
                const sidebar_menu_className = await getClassName(page, sidebar_menu);

                expect(sidebar_menu_className).not.toContain('active');
            },
            timeout
        );
    });

    describe('Exit modal', () => {
        test(
            'If exit button is clicked, should show modal',
            async () => {
                await page.click('#exit-room-button');

                await page.waitForTimeout(1000);

                const exit_room_modal = await page.$('#exit-room-modal');
                const exit_room_modal_className = await getClassName(page, exit_room_modal);

                expect(exit_room_modal_className).toContain('show');
            },
            timeout
        );

        test(
            `If 'No' is clicked, should close modal`,
            async () => {
                await page.waitForSelector('#exit-room-modal .modal-no-button', { visible: true });

                await page.click('#exit-room-modal .modal-no-button');

                const exit_room_modal = await page.$('#exit-room-modal .modal-no-button');
                const exit_room_modal_className = await getClassName(page, exit_room_modal);

                expect(exit_room_modal_className).not.toContain('show');
            },
            timeout
        );

        test(
            `If 'Yes' is clicked, should return to login page`,
            async () => {
                await page.waitForSelector('#exit-room-modal', { visible: false });

                await page.click('#exit-room-button');

                await page.waitForSelector('#exit-room-modal', { visible: true });

                await page.click('#exit-room-modal .modal-yes-button');

                await page.waitForTimeout(2000);

                expect(page.url()).toBe('http://localhost/?');
            },
            timeout
        );
    });
});
