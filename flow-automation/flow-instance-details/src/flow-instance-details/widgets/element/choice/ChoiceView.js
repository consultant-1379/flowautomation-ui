define([
    'jscore/core',
    'template!./_choice.hbs',
    'styles!./_choice.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wChoice';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
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

        getChoiceElement: function () {
            return this.getViewElement('-input');
        },

        setChecked: function (checked) {
            this.getChoiceElement().getNative().checked = checked;
        },

        setValue: function (value) {
            this.getChoiceElement().setAttribute("value", value);
        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
            this.getViewElement('-info').setStyle('display', 'none');
        },

        isHidden: function () {
            return this.getViewElement('-inner').getStyle('display') === 'none';
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'flex');
            this.getViewElement('-info').setStyle('display', 'block');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        },

        removePaddingOnParent: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '0px');
        }
    });
});