/*global define*/
define([
    'jscore/core',
    'template!./_flowExecute.hbs',
    'styles!./_flowExecute.less',
    'i18n!flow-automation-lib/dictionary.json'
], function (core, template, styles, dictionary) {
    'use strict';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getFlowInstanceNameInput: function () {
            return this.getElement().find('.eaFlowAutomationLib-wFlowExecute-container-flowInstanceName');
        },

        getFlowInstanceName: function () {
            return this.getFlowInstanceNameInput().getValue().trim();
        },

        setFlowInstanceNameInput: function(text) {
            this.getFlowInstanceNameInput().setValue(text);
        },

        getFlowInstanceNameErrorText: function() {
            return this.getElement().find('.eaFlowAutomationLib-wFlowExecute-container-flowInstanceNameErrorText');
        },

        removeFlowInstanceNameError: function() {
            this.setTextAndStyle('','error', 'false');
        },

        setFlowInstanceNameError: function(text) {
            this.setTextAndStyle(text,'error', 'true');
        },

        removeValidationError: function() {
            this.getFlowInstanceNameInput().removeModifier("borderColor_red");
            this.removeFlowInstanceNameError();
        },


        setValidationError: function(errorMessage) {
            this.setFlowInstanceNameError(errorMessage);
            this.getFlowInstanceNameInput().setModifier("borderColor_red");
        },

        setTextAndStyle: function(text, error, bool) {
            this.getFlowInstanceNameErrorText().setModifier(error, bool);
            this.getFlowInstanceNameErrorText().setText(text);
        },

        getFlowSetupPhaseRequiredMessage: function(){
            return this.getElement().find('.eaFlowAutomationLib-wFlowExecute-container-flowSetupPhaseRequiredMessage');
        },

        setFlowSetupPhaseRequiredMessage: function(){
            this.getFlowSetupPhaseRequiredMessage().setText(dictionary.get("execute.setupPhaseRequiredNote"));
        }
    });
});