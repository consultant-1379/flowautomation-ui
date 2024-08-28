/*global define*/
define([
    'jscore/core',
    'template!./_eventTab.hbs',
    'styles!./_eventTab.less'
], function (core, template, styles) {
    'use strict';
    var __prefix = '.eaFlowInstanceDetails-rEventTaskTab';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getLeftDiv: function () {
            return this.getElement().find(__prefix + '-div-left');
        },

        getDetails: function () {
            return this.getElement().find(__prefix + '-div-right');
        },

        showEventDetails: function () {
            this.getElement().find(__prefix + '-div-left').setStyle("width", "78%");
            this.getElement().find(__prefix + '-div-right').setStyle("display", "block");
        },

        hiddenEventDetails: function () {
            this.getElement().find(__prefix + '-div-right').setStyle("display", "none");
            this.getElement().find(__prefix + '-div-left').setStyle("width", "100%");
        },

        isMobileSize: function () {
            return window.matchMedia("(max-width: 852px)").matches;
        }

    });
});