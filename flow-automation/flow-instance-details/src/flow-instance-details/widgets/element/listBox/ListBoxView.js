define([
    'jscore/core',
    'text!./_listBox.hbs',
    'styles!./_listBox.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wListBox';

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

        getListBox: function () {
            return this.getViewElement('-listBox');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
        },

        isHidden: function () {
            if (this.getViewElement('-inner').getStyle('display') === 'none') {
                return true;
            }
            return false;

        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'inline-block');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        }
    });
});