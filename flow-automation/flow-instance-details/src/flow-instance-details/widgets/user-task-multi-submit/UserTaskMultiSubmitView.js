define([
    'jscore/core',
    'template!./_userTaskMultiSubmit.hbs',
    'styles!./_userTaskMultiSubmit.less'

], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setUsertaskName: function (usertaskName) {
            this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-top-selection-summary-usertasks-title-text').setText(usertaskName);
        },

        setTotalUserTasks: function (totalUsertasks) {
            this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-top-selection-summary-usertasks-count').setText(totalUsertasks);
        },

        setSelectedUserTasks: function (selectedUsertasks) {
            this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-top-selection-summary-selected-count').setText(selectedUsertasks);
        },

        getSelectAllButtonContainer: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-top-selection-buttons-selectAll');
        },

        getSelectNoneButtonContainer: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-top-selection-buttons-selectNone');
        },

        getUserTasksContainer: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-usertasks');
        },

        hideUsertasksFooterNote: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-information-message').setStyle('display', 'none');
        },

        getFooterInformationContainer: function () {
            return this.getElement().find('.eaFlowInstanceDetails-wUserTaskMultiSubmit-information');
        }

    });
});