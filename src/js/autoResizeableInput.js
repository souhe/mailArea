(function ($) {
    'use strict'
    
    var methods = {
        settings: {
            longer: false
        },
        isLonger: function () {
            return methods.settings.longer;
        },
        init : function (o) {
            o = $.extend({
                maxWidth: 1000,
                minWidth: 0,
                comfortZone: 70
            }, o);

            this.filter('input:text').each(function () {

                var minWidth = o.minWidth || $(this).width(),
                    val = '',
                    input = $(this),
                    testSubject = $('<tester/>').css({
                        position: 'absolute',
                        top: -9999,
                        left: -9999,
                        width: 'auto',
                        fontSize: input.css('fontSize'),
                        fontFamily: input.css('fontFamily'),
                        fontWeight: input.css('fontWeight'),
                        letterSpacing: input.css('letterSpacing'),
                        whiteSpace: 'nowrap'
                    }),

                    check = function () {

                            if (val === (val = input.val())) {
                                return;
                            }

                            // Enter new content into testSubject
                            var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            testSubject.html(escaped);

                            // Calculate new width + whether to change
                            var testerWidth = testSubject.width(),
                                newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                                currentWidth = input.width(),
                                isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < o.maxWidth);

                            // Animate width
                            if (isValidWidthChange) {
                                input.width(newWidth);
                                input.parent('li').css("min-width", newWidth);
                                methods.settings.longer = false;
                            } else {

                                if (testerWidth > currentWidth) {
                                    methods.settings.longer = true;
                                }
                            }
                    };
                testSubject.insertAfter(input);
                $(this).bind('keydown keyup blur update', check);
            });

            return this;
        }
    };

    $.fn.autoGrowInput = function (method) {
        //mathods calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {

        }
    };

})(jQuery);