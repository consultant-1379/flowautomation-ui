define([
    'jscore/core',
    'template!./_reportText.hbs',
    'styles!./_reportText.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rText';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        isMobileSize: function () {
            return window.matchMedia("(max-width: 852px)").matches;
        },

        getFullText: function () {
            return this.getElement().find(parentEl + '-text');
        }
    });
});