const Handlebars = require('handlebars');
const qs = require('qs');

const { username } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const registerHbsHelper = () => {
    Handlebars.registerHelper('isAdmin', function (context, options) {
        if (context === 'Admin') {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifContains', function (arg1, arg2, options) {
        return arg1.includes(arg2) ? options.fn(this) : options.inverse(this);
    });
};

const displayData = ({ template, parent_element, content, position }) => {
    const compiled_template = Handlebars.compile(template.innerHTML);
    const html = compiled_template(content);

    position ? parent_element.insertAdjacentHTML(position, html) : (parent_element.innerHTML = html);
};

const displayAsList = (list, type) => {
    let items = [];

    if (type === 'users') {
        list.forEach((item) => {
            const name = item.username === username ? `${item.username} (you)` : item.username;

            items.push(name);
        });
    } else {
        items = list;
    }

    // todo: delete! for testing purposes only
    // for (let i = 0; i < 7; i++) {
    //     items.push(`*${type.substring(0, type.length - 1)}-${i}`);
    // }

    if (items.length > 5) {
        const set1 = items.slice(0, 5);
        const set2 = items.slice(5, items.length);

        displayData({
            template: document.querySelector('#more-items-template'),
            parent_element: document.querySelector(`#${type}-section`),
            content: {
                set1,
                set2,
                type,
            },
        });
    } else {
        displayData({
            template: document.querySelector('#list-template'),
            parent_element: document.querySelector(`#${type}-section`),
            content: {
                items,
                type,
            },
        });
    }
};

const isMobile = function () {
    var isMobile = window.matchMedia('only screen and (max-width: 770px)');

    return isMobile.matches ? true : false;
};

module.exports = {
    registerHbsHelper,
    displayData,
    displayAsList,
    isMobile,
};
