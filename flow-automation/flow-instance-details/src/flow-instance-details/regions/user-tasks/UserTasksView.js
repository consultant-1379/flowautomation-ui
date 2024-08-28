define([
    'jscore/core',
    'template!./_userTasks.hbs',
    'styles!./_userTasks.less'

], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getUserTaskList: function () {
            return this.getElement().find('.eaFlowInstanceDetails-rUserTasks-userTaskList-content');
        },

        getUserTaskForm: function () {
            return this.getElement().find('.eaFlowInstanceDetails-rUserTasks-userTaskForm');
        },

        getUserTaskButtonHolder: function () {
            return this.getElement().find('.eaFlowInstanceDetails-rUserTasks-userTaskList-header-userTaskButtonHolder');
        },

        hideUserTaskButton: function () {
            this.getUserTaskButtonHolder().setStyle('display','none');
        },

        showUserTaskButton: function () {
            this.getUserTaskButtonHolder().setStyle('display','block');
        }
    });
});