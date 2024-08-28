define([
    'jscore/core',
    'text!./_dateTime.hbs',
    'styles!./_dateTime.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wdatePicker';

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

        getStartDateTimeSelector: function () {
            return this.getViewElement('-content-label');
        },

        setLabel: function (label) {
            this.getLabel().setText(label);
        },

        setDefaultValue: function (value) {
            this.getViewElement("-content-value").setValue(value);
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');

        },

        getValue: function () {
            return this.getViewElement("-content-value").getValue();
        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'inline-block');
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        },

        getValueElement: function () {
            return this.getViewElement("-content-value");
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        }
    });
});
