var mailArea = require('./mailArea.js');
var autoResizeableInput = require('./autoResizeableInput.js');
var betterMailArea = require('./betterMailArea.js');

$.fn.autoGrowInput = function (method) {
    //mathods calling logic
    if (autoResizeableInput[method]) {
        return autoResizeableInput[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
        return autoResizeableInput.init.apply(this, arguments);
    } else {

    }
};

$.fn.mailArea = function (method) {
    //mathods calling logic
    if (mailArea[method]) {
        return mailArea[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
        return mailArea.init.apply(this, arguments);
    } else {

    }
};
