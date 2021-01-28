const Handlebars = require('handlebars');

const displayData = ({ template, parent_element, content, position }) => {
    const compiled_template = Handlebars.compile(template.innerHTML);
    const html = compiled_template(content);

    position ? parent_element.insertAdjacentHTML(position, html) : (parent_element.innerHTML = html);
};

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

const isMobile = function () {
    var isMobile = window.matchMedia('only screen and (max-width: 770px)');

    return isMobile.matches ? true : false;
};

module.exports = {
    registerHbsHelper,
    displayData,
    isMobile,
};
