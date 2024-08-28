define([
    'jscore/core',
    'text!./_info.hbs',
    'styles!./_info.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wInfo';

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

        getInfo: function () {
            return this.getViewElement('-inner-text');
        },

        setInfo: function (infoText) {
            this.getInfo().setText(infoText);
        },

        hideInfo: function () {
            this.getInfo().setStyle('display', 'none');
        },

        showInfo: function () {
            this.getInfo().setStyle('display', 'block');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');

        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'block');
        }

    });

});