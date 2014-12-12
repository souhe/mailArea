var EmailSelector = function (template, emailList, maxInputWidth, styleInactive, styleEdit, styleApproved, styleUnApproved, events, emails) {
    this.template = template.clone();
    template.remove();
    this.$emailList = emailList;
    this.$newField = null;
    this.emailList = new Array();
    this.fieldRemoved = false;
    this.maxInputWidth = maxInputWidth;
    this.validate = this.validateEmail;
    this.events = events;
    // Styles
    this.styleInactive = "inactive";
    this.styleApproved = "approved";
    this.styleEdit = "edit";
    this.styleUnApproved = "unapproved";
    
    this.AdditionnalStyleInactive = styleInactive;
    this.AdditionnalStyleApproved = styleApproved;
    this.AdditionnalStyleEdit = styleEdit;
    this.AdditionnalStyleUnApproved = styleUnApproved;
    this.stylesAll = this.styleInactive + " " + this.styleApproved + " " + this.styleEdit + " " + this.styleUnApproved;

    if(emails && emails.length > 0){
        for (var i = 0; i < emails.length; i++){
            this.addEmailField(emails[i]);
        }
    }
    this.addEmptyEmailField();
    this.$editedField = null;
    
    // Event handlers
    var curr = this;
    this.$emailList.click(function () {
        curr.$newField.focus();
    });


};

EmailSelector.prototype.addEmailField = function(email){
    var field = this.addEmptyEmailField(email);
    var input = field.find('input');
    this.addEmail(input, true);
}

EmailSelector.prototype.addEmptyEmailField = function (email) {
    var count = this.$emailList.children('.' + this.styleInactive).length;
    if (count === 0) {
        var field = this.template.clone().addClass(this.styleInactive);
        field.appendTo(this.$emailList);

        this.$newField = field.find('input');
        this.$newField.val(email);
        
        field.find('input:text').autoGrowInput({
            comfortZone: 15,
            minWidth: 30,
            maxWidth: this.maxInputWidth
        });

        //event handlers:
        var curr = this;
        field.find('input').click(function (e) {
            e.stopPropagation();
        });
        field.find('input.email-input').focus(function (e) {
            //set new field as edited 
            if(!$(this).parents('.email-container').hasClass(curr.styleEdit)){
                curr.$editedField = $(this).parents('.email-container');
                curr.$editedField.removeClass(curr.stylesAll).addClass(curr.styleEdit).find(".dots").hide();
                curr.addEmptyEmailField();
            } 
        });

        field.find('input:text').focusout(function () {
            curr.addEmail($(this));
        });

        field.find('input').keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which),
                condition = false;

            condition = code == 13 || code == 44 || code == 59;

            if (condition) {
                e.preventDefault();
                curr.$newField.focus();
            }
        });

        field.find('.email-remove').click(function () {
            curr.removeEmail(field);
        });
        
        return field;
    }
    return $('.email-container .' + this.styleInactive);
};

EmailSelector.prototype.removeEmail = function (field) {
    if(field.hasClass(this.styleApproved)){
        if(typeof this.events.onRemove === "function"){
            this.events.onRemove(field.find('input').val());
        }
    }
    field.remove();
    this.fieldRemoved = true;
};

EmailSelector.prototype.addEmail = function (email, isInitial) {
    var curr = this;
    email.val($.trim(email.val()));
    if (email) {
        if (email.val() === "") { //if email is empty
            setTimeout(function() {
                curr.removeEmail(email.parents('.email-container'));
            }, 200);
        } else {  
            if (this.validate(email)) {
                var value = email.val();
                var lastProperVal = email.data("lastProperVal");
                
                email.parents('.email-container').removeClass(this.stylesAll).addClass(this.styleApproved);
                if(!lastProperVal){
                    if(!isInitial && typeof this.events.onAdd === "function"){
                        this.events.onAdd(value);
                    }
                }else if(value !== lastProperVal) {
                    if(!isInitial && typeof this.events.onAdd === "function"){
                        this.events.onChange(lastProperVal, value);
                    }
                }
                
                email.data("lastProperVal", value)
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

EmailSelector.prototype.validateEmail = function (input) {
    var email = input.val();
    var regex = /^((((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))|([^<>@]+\<(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))\>))$/i;
    return regex.test(email);
};

var methods = {
    settings: {
        emails: null
    },
    init: function(o) {
        var settings = $.extend({
            emails: [],
            width: this.width()
            minHeight: this.height(),
            styleInactive: '',
            styleEdit: '',
            styleApproved: '',
            styleUnApproved: '',
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
        var events = {
            onAdd: settings.onAdd,
            onRemove: settings.onRemove,
            onChange: settings.onChange,
            onSomethingChange: settings.onSomethingChange
        }
        methods.settings.emails = new EmailSelector($template, $emailList, settings.width - 40, settings.styleInactive, settings.styleEdit, settings.styleApproved, settings.styleUnApproved, events, settings.emails);
        this.data("emails", methods.settings.emails);
    },
    get: function() {
        return this.data("emails").getEmails();
    }
};

module.exports = methods;