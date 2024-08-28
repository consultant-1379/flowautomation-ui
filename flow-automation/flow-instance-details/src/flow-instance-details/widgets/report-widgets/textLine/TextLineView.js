define([
    'jscore/core',
    'template!./_textLine.hbs',
    'styles!./_textLine.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rTextLine';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getTextName: function () {
            return this.getElement().find(parentEl + '-name');
        },

        getTextValue: function () {
            return this.getElement().find(parentEl + '-value');
        },

        getTextLink: function () {
            return this.getElement().find(parentEl + '-link');
        },

        setTextName: function (text) {
            return this.getTextName().setText(text);
        },

        setNameWidth: function (width) {
            var totalWidth = (width * 9) + 10 + 'px';
            this.getTextName().setStyle("width", totalWidth);
        },

        setGenericWidth: function () {
            this.getTextName().setStyle("width", '20%');
        },

        setTextValue: function (text) {
            return this.getTextValue().setText(text);
        },

        setLinkValue: function (text, link) {
            var linkElement = this.getTextLink();
            linkElement.setText(text);
            linkElement.setAttribute('href', link);
        },

        styleForSummary: function () {
            this.getElement().setStyle('display', 'inline-block');
            this.getElement().setStyle('width', '20%');
            this.getTextValue().setStyle('padding-top', '12px');

            if (this.getTextLink()) {
                this.getTextValue().setStyle('padding-top', '0px');
            } else {
                this.getTextValue().setStyle('padding-top', '12px');
            }
        }
    });
});