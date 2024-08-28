define([
    'jscore/core',
    'text!./_actionPanel.hbs',
    'styles!./_actionPanel.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({
        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getActions: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wActionPanel-content');
        },

        getContinueButton: function () {
            return this.getElement().find('.ebBtn_color_paleBlue');
        },

        disableContinueButton: function () {
            this.getContinueButton().setAttribute("disabled", "disabled");
        },

        enableContinueButton: function () {
            this.getContinueButton().removeAttribute('disabled', 'disabled');
        }
    });
});