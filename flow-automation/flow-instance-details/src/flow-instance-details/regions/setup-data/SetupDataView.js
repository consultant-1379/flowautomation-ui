define([
    'jscore/core',
    'template!./_setupData.hbs',
    'styles!./_setupData.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rSetupData';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getSetupDataContent: function () {
            return this.getElement().find(parentEl + '-setupData');
        },

        getSetupDataButton: function () {
            return this.getElement().find(parentEl + '-button');
        },

        getButtonText: function () {
            return this.getSetupDataButton().getText();
        },

        setButtonText: function (text) {
            this.getSetupDataButton().setText(text);
        },

        hideButton: function () {
            this.getSetupDataButton().setStyle('display', 'none');
        }
    });
});