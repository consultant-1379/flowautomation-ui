/*global define*/
define([
    'jscore/core',
    'template!./_flowImport.hbs',
    'styles!./_flowImport.less',
    'i18n!flow-catalog/dictionary.json'
], function (core, template, styles) {
    'use strict';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getImportFileInput: function () {
            return this.getElement().find('.eaFlowCatalog-wFlowImport-container-flowPackage-Input');
        },

        getImportedFile: function () {
            return this.getImportFileInput().getProperty("files")[0];
        },

        getInputStatusError: function () {
            return this.getElement().find('.ebInput-statusError');
        },

        setInputStatusErrorText: function (text) {
            return this.getInputStatusError().setText(text);
        },

        getFlowNameInput: function () {
            return this.getElement().find('.eaFlowCatalog-wFlowImport-container-flowName');
        },

        getFlowName: function () {
            return this.getFlowNameInput().getValue();
        },

        getFlowDescriptionInput: function () {
            return this.getElement().find('.eaFlowCatalog-wFlowImport-container-flowDescription');
        },

        getFlowDescription: function () {
            return this.getFlowDescriptionInput().getValue();
        },

        getInlineError: function () {
            return this.getElement().find('.eaFlowCatalog-wFlowImport-inlineError');
        },

        showInlineError: function () {
            this.getInlineError().removeModifier('hidden');
        },

        hideInlineError: function () {
            this.getInlineError().setModifier('hidden');
        },

        getInlineErrorMessage: function () {
            return this.getElement().find('.eaFlowCatalog-wFlowImport-inlineErrorMessage');
        },

        setInlineErrorMessage: function (text) {
            this.getInlineErrorMessage().setText(text);
        }
    });
});