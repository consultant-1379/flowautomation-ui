define([
    'jscore/core',
    'text!./_email.hbs',
    'styles!./_email.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wEmail';

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

        getInfo: function(){
            return this.getViewElement('-info');
        },

        getLabel: function () {
            return this.getViewElement('-content-label');
        },

        setLabel: function (label) {
            this.getLabel().setText(label);
        },

        getTextArea: function () {
            return this.getViewElement("-content-value");
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        },

        getValue: function () {
            return this.getViewElement("-content-value").getValue();
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

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'inline-block');
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
            this.getViewElement("-content-label").setAttribute("class", "ebLabel-text eaFlowInstanceDetails-wEmail-content-label ebLabel-text_required");
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
