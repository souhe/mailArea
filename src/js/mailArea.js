var EmailSelector = function (template, emailList, maxInputWidth, styleInactive, styleEdit, styleApproved, styleUnApproved, autocompleteUrl) {
    this.template = template.clone();
    template.remove();
    this.$emailList = emailList;
    this.$newField = null;
    this.emailList = new Array();
    this.fieldRemoved = false;
    this.maxInputWidth = maxInputWidth;
    this.validate = this.validateEmail;
    this.autocompleteUrl = autocompleteUrl;
    if(autocompleteUrl) {        
        this.validate = this.validateColleague; 
    }

    // Styles
    this.styleInactive = styleInactive;
    this.styleApproved = styleApproved;
    this.styleEdit = styleEdit;
    this.styleUnApproved = styleUnApproved;
    this.stylesAll = this.styleInactive + " " + this.styleApproved + " " + this.styleEdit + " " + this.styleUnApproved;

    this.addEmptyEmailField();
    this.$editedField = null;

    // Event handlers
    var curr = this;
    this.$emailList.click(function () {
        curr.$newField.focus();
    });


};

EmailSelector.prototype.AddAoutocompleteToField = function(input) {
    var curr = this;
    input.autocomplete({
        minLength: 2,

        source: function(request, response) {
            $.ajax({
                url: curr.autocompleteUrl,
                dataType: "json",
                data: {
                    phrase: request.term
                },
                success: function(data) {
                    response($.map(data, function(item) {
                        var fullName = item.TitleName + " " + item.FirstName + " " + item.SurName;
                        if (item.TrustLevelName == null) {
                            item.TrustLevelName = "";
                        }
                        return {
                            data: item,
                            label: fullName,
                            value: fullName,
                            desc: item.TrustLevelName
                        };
                    }));
                }
            });
        },

        select: function (event, ui) {
            input.val(ui.item.value);
            input.data("code", ui.item.data.Code);
            curr.$newField.focus();
        },
        autoFocus: true,
        search: function () {
            input.data("code", null);
        }
    }).data("autocomplete")._renderItem = function (ul, item) {
        return $("<li>")
            .data("item.autocomplete", item)
            .append("<a>" + item.label + '<p class="directorate-name">' + item.desc + "</p></a>")
            .appendTo(ul);
    };
};

EmailSelector.prototype.addEmptyEmailField = function () {
    var count = this.$emailList.children('.' + this.styleInactive).length;
    if (count === 0) {
        var field = this.template.clone().addClass(this.styleInactive);
        field.appendTo(this.$emailList);

        this.$newField = field.find('input');

        field.find('input:text').autoGrowInput({
            comfortZone: 15,
            minWidth: 30,
            maxWidth: this.maxInputWidth
        });
        if(this.autocompleteUrl) { //if autocomplete is set
          console.log("lol");
            this.AddAoutocompleteToField(field.find('input:text'));
        }

        //event handlers:
        var curr = this;
        field.find('input').click(function (e) {
            e.stopPropagation();
        });
        field.find('input.email-input').focus(function (e) {
            //set new field as edited 
            if (!curr.$lastEdited || $(this).get(0) !== curr.$lastEdited.get(0)) {
                curr.$editedField = $(this).parents('.email-container');
                curr.$editedField.removeClass(curr.stylesAll).addClass(curr.styleEdit).find(".dots").hide();
                curr.addEmptyEmailField();
            } 
        });

        field.find('input:text').focusout(function () {
            curr.$lastEdited = $(this);
            curr.addEmail($(this));
            curr.$lastEdited = $(this);
        });

        field.find('input').keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which),
                condition = false;
            if(curr.autocompleteUrl) {
                condition = code == 13 || code == 44 || code == 59 || code == 11; //11
            }else {
                condition = code == 13 || code == 44 || code == 59;
            }
            if (condition) {
                e.preventDefault();
                curr.$newField.focus();
            }
        });

        field.find('.email-remove').click(function () {
            curr.removeEmail(field);
        });
    }
    return $('.email-container .' + this.styleInactive);
};

EmailSelector.prototype.removeEmail = function (field) {
    field.remove();
    this.fieldRemoved = true;
};

EmailSelector.prototype.addEmail = function (email) {
    var curr = this;
    email.val($.trim(email.val()));
    if (email) {
        if (email.val() === "") { //if email is empty
            setTimeout(function() {
                curr.removeEmail(email.parents('.email-container'));
            }, 200);
        } else {
            if (this.validate(email)) {
                email.parents('.email-container').removeClass(this.stylesAll).addClass(this.styleApproved);
            } else {
                email.parents('.email-container').removeClass(this.stylesAll).addClass(this.styleUnApproved);
            }
            var actualWidth = email.width();
            email.parent('li').css("min-width", actualWidth + 25);
            if (email.autoGrowInput('isLonger')) {
                email.parents('.email-container').find(".dots").show();
            }else {
                email.parents('.email-container').find(".dots").hide();
            }
        }
    }
};

EmailSelector.prototype.getEmails = function () {
    this.emailList = [];
    var curr = this;
    this.$emailList.children('.email-container').each(function () {
        var input = $(this).find('input');
        if (curr.validate(input)) {
            curr.emailList.push(input.val().toString());
        }
    });
    return this.emailList;
};

EmailSelector.prototype.getColleagues = function () {
    var colleaguesList = [];
    var curr = this;
    this.$emailList.children('.email-container').each(function () {
        var input = $(this).find('input');
        if (curr.validate(input)) {
            colleaguesList.push(input.data("code"));
        }
    });
    return colleaguesList;
};

EmailSelector.prototype.validateEmail = function (input) {
    var email = input.val();
    var regex = /^((((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))|([^<>@]+\<(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))\>))$/i;
    return regex.test(email);
};

EmailSelector.prototype.validateColleague = function (input) {
    var code = input.data("code");

    if (code) {
        // guid length
        if (code.length == 36) {
            return true;
        } else {
            return false;
        }
    }
    return false;
};

EmailSelector.prototype.validateLength = function (input) {
    var testSubject = $('<tester/>').css({
        position: 'absolute',
        top: -9999,
        left: -9999,
        width: 'auto',
        fontSize: input.css('fontSize'),
        fontFamily: input.css('fontFamily'),
        fontWeight: input.css('fontWeight'),
        letterSpacing: input.css('letterSpacing'),
        whiteSpace: 'nowrap'
    });

    //if (val === (val = input.val())) { return; }
    var val = input.val();
    // Enter new content into testSubject
    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    testSubject.html(escaped);

    var testerWidth = testSubject.width(),
        currentWidth = input.width();

    if (testerWidth < currentWidth) {
        return true;
    }

    return false;
};

var methods = {
    settings: {
        emails: null
    },
    init: function(o) {
        var settings = $.extend({
            width: this.width(),
            minHeight: this.height(),
            styleInactive: 'inactive',
            styleEdit: 'edit',
            styleApproved: 'approved',
            styleUnApproved: 'unapproved',
            autocompleteUrl: null,
            onAdd: function(email){return null;},
            onRemove: function(email){return null;},
            onChange: function(oldEmail, newEmail){return null;},
            onSomethingChange: function(emails){return null;}
        }, o);

        this.addClass('mail-area');
        var $template = $('<li class="email-container template"><input type="text" class="email-input"/><div class="dots">...</div><a href="#" class="email-remove"><div class="icon-email-remove"></div></a></li>');

        var $emailList = $('<ul/>').addClass('email-list');
        $emailList.appendTo(this);

        $emailList.css("min-height", settings.height);
        $emailList.width(settings.width);
        methods.settings.emails = new EmailSelector($template, $emailList, settings.width - 40, settings.styleInactive, settings.styleEdit, settings.styleApproved, settings.styleUnApproved, settings.autocompleteUrl);
        this.data("emails", methods.settings.emails);
    },
    get: function() {
        return this.data("emails").getEmails();
    },
    getCodes: function () {
        var emails = this.data("emails");
        return emails.getColleagues();
    }
};

module.exports = methods;