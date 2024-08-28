define([
    'jscore/core',
    'template!./_userTaskTab.hbs',
    'styles!./_userTaskTab.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rUserTaskTab';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getUserTasks: function () {
            return this.getElement().find(parentEl + '-userTasks');
        },

        getUserTasksDetails: function () {
            return this.getElement().find(parentEl + '-userTasksDetails');
        },

        isMobileSize: function () {
            return window.matchMedia("(max-width: 852px)").matches;
        }
    });
});