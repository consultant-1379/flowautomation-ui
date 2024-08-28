define([
    'jscore/core',
    './TextView',
    'i18n!flow-instance-details/dictionary.json',
   '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, dictionary, Info, utils, InfoIcon) {

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

        addValidation: function () {
            if (this.required) {
                this.view.setRequired();
            }
            if (this.property.maxLength) {
                this.maxLength = this.property.maxLength;
            }
            if (this.property.minLength) {
                this.minLength = this.property.minLength;
            }
            if (this.property.pattern) {
                this.regex = this.property.pattern;
            }
        },

        requiredFieldIsEmpty: function () {
            if (this.view.isHidden()) {
                return false;
            }
            if (this.minLength && this.view.getValue().length < this.minLength && this.required) {
                this.view.setValidationError(dictionary.get('errors.requiredField') + this.minLength + dictionary.get('errors.characters'));
                this.error = true;
                return true;
            } else if (this.view.getValue().length < 1 && this.required) {
                this.view.setValidationError(dictionary.get('errors.requiredFieldNeedsToBeGreaterThanOne'));
                this.error = true;
                return true;
            }
            return false;
        },

        isValid: function () {
            if (this.property.maxLength) {
                if (this.view.getValue().length > this.property.maxLength) {
                    this.view.setValidationError(dictionary.get('errors.maximumLength') + this.property.maxLength + dictionary.get('errors.characters'));
                    this.error = true;
                    return false;
                }
            }
            if (this.property.minLength) {
                if (this.view.getValue().length < this.property.minLength) {
                    if (!this.required && this.view.getValue().length === 0) {
                        this.view.hideError();
                        this.error = false;
                        return true;
                    } else {
                        this.view.setValidationError(dictionary.get('errors.minimumLength') + this.property.minLength + dictionary.get('errors.characters'));
                        this.error = true;
                        return false;
                    }
                }
            }
            if (this.property.pattern) {
                this.regex = this.property.pattern;
                var specialCharsStart = new RegExp(this.property.pattern);
                if (!specialCharsStart.test(this.view.getValue())) {
                    this.view.setValidationError(dictionary.get('errors.pattern') + this.property.pattern);
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
            this.view.setDefaultValue(this.property.default);

            if (this.property.readOnly) {
                this.view.setDisabled();
            }
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }
            this.addValidation();
            this.view.getValueElement().addEventHandler("keyup", this.runValidation.bind(this));

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

           this._setInfo();
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
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
            this.property.returnValue = this.view.getValue();
        }
    });
});