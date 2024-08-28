define([
    'jscore/core',
    'text!./_integer.hbs',
    'styles!./_integer.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wInteger';

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

        getSpinnerHolder: function () {
            return this.getViewElement('-spinner');
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

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        padBottom: function (){
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        }
    });
});
