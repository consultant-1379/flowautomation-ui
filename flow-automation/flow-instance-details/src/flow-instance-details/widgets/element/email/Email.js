define([
    'jscore/core',
    './EmailView',
    'i18n!flow-instance-details/dictionary.json',
    'widgets/TextArea',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, dictionary, TextArea, Info, utils, InfoIcon) {

    'use strict';
    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.key = options.key;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
            this.required = options.required;
        },

        requiredFieldIsEmpty: function () {
            if (this.view.isHidden()) {
                return false;
            }
            if (this.textArea.getValue().length < 1 && this.required) {
                this.view.setValidationError(dictionary.get('errors.requiredFieldNeedsToBeGreaterThanOne'));
                this.error = true;
                return true;
            }
            return false;
        },

        isValidEmailAddress: function (email) {
            var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegex.test(email);
        },

        isValid: function () {
            var emailAddresses = this.getValue();
            for (var index = 0; index < emailAddresses.length; index++) {
                if (!this.isValidEmailAddress(emailAddresses[index])) {
                    this.view.setValidationError(dictionary.get('errors.invalidEmailAddress') + ": " + emailAddresses[index]);
                    this.error = true;
                    return false;
                }
            }
            this.error = false;
            return true;
        },

        onViewReady: function () {
            var label = this.property.name || this.key;
            this.view.setLabel(utils.concatIfExist(label, this.property.nameExtra));


            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }

            this.textArea = new TextArea({
                width: '300px',
                rows: 5
            });

            if (this.property.items && this.property.items.default && this.property.items.default.length > 0) {
                this.textArea.setValue(this.property.items.default.join(","));
            }
            if (this.property.items && this.property.default && this.property.default.length > 0) { //need to verify this
                this.textArea.setValue(this.property.default.join(","));
            }
            this.textArea.attachTo(this.view.getTextArea());

            if (this.required) {
                this.view.setRequired();
            }
            this.textArea.addEventHandler("change", this.runValidation.bind(this));

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

            this._setInfo();
        },


        _setInfo: function () {
            this.info = new Info({text: this.property.info, indentLevel: this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());

        },

        runValidation: function () {
            if (this.isValid()) {
                this.view.hideError();
                this.error = false;
            }
            this.trigger('Text:InputValidation');
        },

        hide: function () {
            this.view.hide();
            this.error = false;
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        getValue: function () {
            var emailAddresses = this.textArea.getValue();
            this.property.returnValue = emailAddresses ? emailAddresses.split(',')
                .map(function (email) {
                    return email.trim();
                })
                .filter(function (email) {
                    return email.length !== 0;
                }) : [];

            return this.property.returnValue;
        }
    });
});