const { EmojiButton } = require('@joeattardi/emoji-button');

const picker = new EmojiButton({
    style: 'twemoji',
    position: 'top-start',
    showAnimation: false,
    emojiSize: '22px',
    emojisPerRow: 7,
    rows: 5,
    showSearch: false,
    showPreview: false,
    showRecents: false,
});

picker.on('emoji', (selection) => {
    const message_text = document.querySelector('#message-textbox');
    const cursor_position = message_text.selectionStart;
    const message = `${message_text.value.substring(0, cursor_position)}${
        selection.emoji
    }${message_text.value.substring(cursor_position, message_text.value.length)}`;

    message_text.value = message;
});

picker.on('hidden', () => {
    const message_text = document.querySelector('#message-textbox');
    const message_length = message_text.value.length;
    message_text.focus();
    message_text.setSelectionRange(message_length, message_length);
});

const emoji_button = document.querySelector('.emoji-button');
emoji_button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    picker.togglePicker(emoji_button);
});
