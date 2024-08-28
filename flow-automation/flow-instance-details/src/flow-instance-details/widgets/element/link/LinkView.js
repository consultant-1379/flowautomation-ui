define([
    'jscore/core',
    'text!./_link.hbs',
    'styles!./_link.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wLink';

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
            return this.getViewElement('-label');
        },

        setLabel: function (label) {
            this.getLabel().setText(label);
        },

        getLink: function () {
            return this.getViewElement("-link");
        },

        setLink: function (linkText, value) {
            var linkElement = this.getLink();
            linkElement.setText(linkText);
            linkElement.setAttribute('href', value);
        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'inline-block');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        }
    });
});
