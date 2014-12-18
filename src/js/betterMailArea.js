'use strict';

var MailArea = function(options){
    this.emails = [];    
    this.options = options;
};

MailArea.prototype.addEmail = function(email){
    var curr = this;
    
    curr.emails.push({email: email, isValid: true, validationMessage: ""});
};

MailArea.prototype.updateEmail = function(oldEmail, newEmail){
    var curr = this;
    
    var idx = curr.emails.getBy("email", oldEmail);
    curr.emails[idx] = newEmail;
};

MailArea.prototype.removeEmail = function(email){
    var curr = this;
    
    var idx = curr.emails.indexOf(email);
    curr.emails.splice(idx, 1);
};

MailArea.prototype.createEmail = function(email){
    
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

        this.data("emails", new MailArea(settings);
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