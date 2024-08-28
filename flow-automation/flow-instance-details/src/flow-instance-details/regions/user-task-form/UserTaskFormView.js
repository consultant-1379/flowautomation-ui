define([
    'jscore/core',
    'template!./_userTaskForm.hbs',
    'styles!./_userTaskForm.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wUserTaskForm';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getUserTaskFormContent: function () {
            return this.getElement().find(parentEl + "-form");
        },

        getFormContent: function () {
            return this.getElement().find(parentEl + '-form-content');
        },

        getFormContentScrollbar: function () {
            return document.getElementById('utFormContent');
        },

        getFormActions: function () {
            return this.getElement().find(parentEl + '-form-actions');
        },

        setHeaderTitle: function (text) {
            this.getElement().find(parentEl + '-header-title').setText(text);
        },

        showHeaderTitle: function () {
            this.getElement().find(parentEl + '-header-title').setStyle("display", "block");
        },

        hideHeaderTitle: function () {
            this.getElement().find(parentEl + '-header-title').setStyle("display", "none");
        },

        getHeaderTitle: function () {
            return this.getElement().find(parentEl + '-header-title');
        },

        getUserTaskFormHeader: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskForm-header');
        },

        hideHeader: function () {
            this.getUserTaskFormHeader().setStyle("display", "none");
        },

        showHeader: function () {
            this.getUserTaskFormHeader().setStyle("display", "block");
        },

        showError: function () {
            this.getElement().find(parentEl + '-header-error').setStyle("display", "block");
        },

        hideError: function () {
            this.getElement().find(parentEl + '-header-error').setStyle("display", "none");
        },

        setErrorMessage: function (message) {
            this.getElement().find(parentEl + '-header-error-message').setText(message);
        }
    });
});
