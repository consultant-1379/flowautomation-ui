define([
    'jscore/core',
    'template!./_message.hbs',
    'styles!./_message.less'
], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wMessage';

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

        getInnerElement: function() {
            return this.getViewElement('-inner');
        },

        getContent: function () {
            return this.getViewElement('-content');
        },

        setBorderStyle: function (borderStyle) {
            this.getContent().setModifier(borderStyle);
        },

        // ------------------ default method ---------------------- //

        indent: function (valueToIndent) {
            this.getContent().setStyle('margin-left', valueToIndent + 'px');
        },

        hide: function () {
            this.getInnerElement().setStyle('display', 'none');
        },

        reveal: function () {
            this.getInnerElement().setStyle('display', 'flex');
            this.getInnerElement().setStyle('width', 'auto');
        },

        padBottom: function () {
            this.getInnerElement().setStyle('margin-bottom', '15px');
        }
    });
});
