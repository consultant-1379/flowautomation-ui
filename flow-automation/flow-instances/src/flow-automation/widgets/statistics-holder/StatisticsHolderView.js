define([
    'jscore/core',
    'template!./_statisticsHolder.hbs',
    'styles!./_statisticsHolder.less'
], function (core, template, styles) {
    'use strict';
    var parent = '.eaFlowAutomation-statisticsHolder';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setUserNumber: function (text) {
            return this.getElement().find(parent + '-userTasksNumber').setText(text);
        },

        setExecutingNumber: function (text) {
            return this.getElement().find(parent + '-executingNumber').setText(text);
        },

        setSetUpNumber: function (text) {
            return this.getElement().find(parent + '-setUpNumber').setText(text);
        },

        setExecutedNumber: function (text) {
            return this.getElement().find(parent + '-executedNumber').setText(text);
        },

        setCancelledNumber: function (text) {
            return this.getElement().find(parent + '-cancelledNumber').setText(text);
        },

        setStoppedNumber: function (text) {
            return this.getElement().find(parent + '-stoppedNumber').setText(text);
        },

        setFailedNumber: function (text) {
            return this.getElement().find(parent + '-failedNumber').setText(text);
        }
    });
});