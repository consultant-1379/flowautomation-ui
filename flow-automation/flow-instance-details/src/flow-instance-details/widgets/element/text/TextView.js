define([
    'jscore/core',
    'text!./_text.hbs',
    'styles!./_text.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wText';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (classId) {
            return this.getElement().find(parentEl + classId);
        },

        getLabel: function () {
            return this.getViewElement('-content-label');
        },

        setLabel: function (label) {
            this.getLabel().setText(label);
        },

        setDefaultValue: function (value) {
            this.getViewElement("-content-value").setValue(value);
        },

        getValue: function () {
            return this.getViewElement("-content-value").getValue();
        },

        getValueElement: function () {
            return this.getViewElement("-content-value");
        },

        setDisabled: function () {
            this.getViewElement("-content-value").setAttribute("readonly", "");
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');

        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'flex');
        },

        isHidden: function () {
            if (this.getViewElement('-inner').getStyle('display') === 'none') {
                return true;
            }
            return false;
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        },

        setRequired: function () {
            this.getViewElement("-content-label").setAttribute("class", "ebLabel-text eaFlowInstanceDetails-wText-content-label ebLabel-text_required");
        },

        setValidationError: function (message) {
            this.getViewElement("-error").setStyle('display', 'inline-block');
            this.getViewElement("-content-value").setStyle("border", "1px solid #e32119");
            this.getViewElement("-error-text").setStyle('display', 'inline-block');
            this.getViewElement('-error-text').setText(message);
        },

        hideError: function () {
            this.getViewElement("-content-value").setStyle("border", "1px solid #b3b3b3");
            this.getViewElement("-error").setStyle('display', 'none');
            this.getViewElement("-error-text").setStyle('display', 'none');
        }
    });
});
