define([
    'jscore/core',
    'text!./_readOnly.hbs',
    'styles!./_readOnly.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wReadOnly';

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

        getTitle: function () {
            return this.getViewElement('-inner-titleBox-title');
        },

        setTitle: function (title) {
            this.getTitle().setText(title);
        },

        getValue: function(){
            return this.getViewElement("-inner-valueBox-value");
        },

        setDefaultValue: function (value) {
            this.getValue().setText(value);
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
            this.getViewElement('-inner').setStyle('display', 'inline-block');
        },


        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        }

    });
});
