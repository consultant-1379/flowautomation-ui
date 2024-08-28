/*global define*/
define([
    'jscore/core',
    'template!./LinkCell.hbs',
    "styles!./LinkCell.less"
], function (core, template, style) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wTableLinkCell';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return style;
        },

        setLinkValue: function (linkText, link) {
            var linkElement = this.getElement().find(parentEl + '-link');
            linkElement.setText(linkText);
            linkElement.setAttribute('href', link);
        },

        hideNotSupplied: function () {
            this.getElement().find(parentEl + '-notSupplied').setStyle('display', 'none');
        },

        hideLink: function () {
            this.getElement().find(parentEl + '-link').setStyle('display', 'none');
        }
    });
});
