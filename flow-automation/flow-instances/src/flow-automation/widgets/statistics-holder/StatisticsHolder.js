define([
    'jscore/core',
    './StatisticsHolderView',
    'i18n!flow-automation/dictionary.json'
], function (core, View, Dictionary) {
    'use strict';
    return core.Widget.extend({

        View: function () {
            return new View({
                dictionary: Dictionary
            });
        },

        onViewReady: function () {
            this.statistics = {};
            this.clearStats();
        },

        clearStats: function () {
            this.statistics.userTasks = 0;
            this.statistics.executed = 0;
            this.statistics.executing = 0;
            this.statistics.setUp = 0;
            this.statistics.stopped = 0;
            this.statistics.failed = 0;
            this.updateStats();
        },

        setStatsToUnknown: function () {
            this.statistics.userTasks = "-";
            this.statistics.executed = "-";
            this.statistics.executing = "-";
            this.statistics.setUp = "-";
            this.statistics.stopped = "-";
            this.statistics.failed = "-";
            this.updateStats();
        },

        updateStats: function () {
            this.setUserTasks(this.statistics.userTasks);
            this.setExecutingNumber(this.statistics.executing);
            this.setSetUp(this.statistics.setUp);
            this.setExecuted(this.statistics.executed);
            this.setStopped(this.statistics.stopped);
            this.setFailed(this.statistics.failed);
        },

        incrementStats: function (row) {
            if (row.userTasks && row.userTasks.text) {
                this.statistics.userTasks += row.userTasks.text;
            }
            switch (row.state) {
                case Dictionary.get("COMPLETED"):
                    this.statistics.executed += 1;
                    break;
                case Dictionary.get("EXECUTING"):
                    this.statistics.executing += 1;
                    break;
                case Dictionary.get("CONFIRM_EXECUTE"):
                case Dictionary.get("SETTING_UP"):
                    this.statistics.setUp += 1;
                    break;
                case Dictionary.get("STOPPED"):
                    this.statistics.stopped += 1;
                    break;
                case Dictionary.get("FAILED"):
                    this.statistics.failed += 1;
                    break;
                case Dictionary.get("FAILED_SETUP"):
                    this.statistics.failed += 1;
                    break;
                case Dictionary.get("FAILED_EXECUTE"):
                    this.statistics.failed += 1;
                    break;
            }
        },

        setUserTasks: function (number) {
            this.view.setUserNumber(number);
        },

        setExecutingNumber: function (number) {
            this.view.setExecutingNumber(number);
        },

        setSetUp: function (number) {
            this.view.setSetUpNumber(number);
        },

        setExecuted: function (number) {
            this.view.setExecutedNumber(number);
        },

        setCancelled: function (number) {
            this.view.setCancelledNumber(number);
        },

        setStopped: function (number) {
            this.view.setStoppedNumber(number);
        },

        setFailed: function (number) {
            this.view.setFailedNumber(number);
        },
    });
});