'use strict';
var validateEmail = require('./emailValidator.js');

var MailArea = function(options){
    this.emails = [];    
    this.options = options;
    this.styles = {
        edited: "edited",
        inProgress: "in-progress",
        valid: "valid",
        invalid: "invalid"
    };
    
    this.template = $('<li class="email-container template"><input type="text" class="email-input"/><div class="dots">...</div><a href="#" class="email-remove"><div class="icon-email-remove"></div></a></li>');
    
    this.$emptyItem = null;

};

MailArea.prototype.addEmail = function($emailItem){
    var curr = this;
    var value = $emailItem.find('input').val();
    var isValid = validateEmail(value);
    
    curr.emails.push({
        email: value, 
        isValid: isValid, 
        validationMessage: ""
    });
    
    if(isValid){
        curr.changeEmailItemClass($emailItem, curr.styles.valid);
    }else{
        curr.changeEmailItemClass($emailItem, curr.styles.invalid);
    }
};

MailArea.prototype.updateEmail = function(oldEmail, newEmail){
    var curr = this;
    var isValid = validateEmail(value);
    
    var email = {
        email: newEmail, 
        isValid: isValid, 
        validationMessage: ""
    };
    var idx = curr.emails.replaceByWhenProp("email", oldEmail, email);
    
    if(isValid){
        curr.changeEmailItemClass($emailItem, curr.styles.valid);
    }else{
        curr.changeEmailItemClass($emailItem, curr.styles.invalid);
    }
};

MailArea.prototype.removeEmail = function($emailItem){
    var curr = this;
    var value = $emailItem.find('input').val();
    
    var idx = curr.emails.indexOfByProp('email', value);
    curr.emails.splice(idx, 1);
    
    $emailItem.remove();
};

MailArea.prototype.createEmptyEmailItem = function(email){
    var curr = this;
    
    var $emailItem = curr.template.clone().addClass(this.styleInactive);
    $emailItem.appendTo(this.$emailList);

    var $input = $emailItem.find('input');
    $input.val(email);

    $input.autoGrowInput({
        comfortZone: 15,
        minWidth: 30,
        maxWidth: curr.maxInputWidth  //TODO: add this field to opotions
    });

    applyItemEvents($emailItem);
};

MailArea.prototype.getEmails = function(){
    return this.emails.where(function(email){
        return email.isValid;
    });
};

MailArea.prototype.reload = function(){
    
};

MailArea.prototype.isValid = function(){
    
};

MailArea.prototype.changeEmailItemClass = function($emailItem, newClass){
    var allClasses = this.cssClasses.map(function(e){ return '.' + e; }).join(' ');
    $emailItem.find('input').removeClass(allClasses).addClass(newClass);
};

MailArea.prototype.applyEvents = function($emailItem){
    var curr = this;
    var $input = field.find('input');
    var $removeButton = $emailItem.find('.email-remove');
    
    $input.click(function (e) {
        e.stopPropagation();
    });
    
    $input.focus(function (e) {
        if($emailItem === curr.$editedItem && !$emailItem.hasClass(curr.styleInProgress)){ //TODO: move in-progress to options
            curr.$editedItem = $emailItem;
            curr.changeEmailItemClass($emailItem, curr.styleEdit);
            $emailItem.find(".dots").hide(); //TODO: autohide in html/css      
        } 
        
        if($emailItem === curr.$emptyItem){
            curr.createEmptyEmailItem();
        }
    });

    $input.focusout(function () {
        curr.addEmail($(this).parents('.email-container')); //?
    });

    $input.keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which),
            condition = false;

        condition = code == 13 || code == 44 || code == 59;

        if (condition) {
            e.preventDefault();
            curr.$emptyItem.find('input').focus();
        }
    });

    $removeButton.click(function () {
        curr.removeEmail($emailItem);
    });
}

module.exports = {
    settings: {
        emails: null
    },
    init: function(o) {
        var settings = $.extend({
            emails: [],
            width: this.width(),
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

        this.data("emails", new MailArea(settings));
    },
    getEmails: function() {
        return this.data("emails").getEmails();
    },
    reload: function(emails){
        this.data("emails").reload(emails);
    },
    isValid: function(){
        return this.data("emails").isValid();
    }  
};

Array.prototype.getBy = Array.prototype.getBy || function (prop, value) {
    var i = this.length;
    while (i--) {
        if (this[i][prop] === value) {
            return this[i];
        }
    }
    return null;
};

Array.prototype.getBy = Array.prototype.indexOfByProp || function (prop, value) {
    var i = this.length;
    while (i--) {
        if (this[i][prop] === value) {
            return i;
        }
    }
    return null;
};

Array.prototype.replaceByWhenProp = Array.prototype.replacePropBy || function (prop, value, obj) {
    var i = this.length;
    while (i--) {
        if (this[i][prop] === oldValue) {
            this[i] = obj;
            return;
        }
    }
};

Array.prototype.where = Array.prototype.where || function (callback) {
    if (typeof callback === 'function') {
        var data = [];
        for (var i = 0; i < this.length; i++) {
            if (callback(this[i])) {
                data.push(this[i]);
            }
        }
        return data;
    }
    return null;
};