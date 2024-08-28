/*global define*/
define([
    'jscore/core',
    'template!./_tableSettingsButton.hbs',
    'styles!./_tableSettingsButton.less',
    'i18n!flow-automation-lib/dictionary.json'
], function (core, template, styles) {
    'use strict';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getSettingsButton: function () {
            return this.getElement().find('.eaFlowAutomationLib-tableSettingsButton-icon');
        },

        disableSettingsButton: function () {
            this.getSettingsButton()
                .setProperty('className', 'ebIcon ebIcon_settings ebIcon_disabled eaFlowAutomationLib-tableSettingsButton-icon');
        },

        enableSettingsButton: function () {
            this.getSettingsButton()
                .setProperty('className', 'ebIcon ebIcon_settings eaFlowAutomationLib-tableSettingsButton-icon');
        }
    });
});