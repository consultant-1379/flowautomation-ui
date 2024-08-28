define([
    'jscore/core',
    './ReportTabView',
    'i18n!flow-instance-details/dictionary.json',
    '../execution/Execution',
    '../setup-data/SetupData'
], function (core, View, dictionary, Execution, SetupData) {
    'use strict';

    return core.Region.extend({

        view: function () {
            return new View({dictionary: dictionary});
        },

        onViewReady: function () {
            this.view.getActionExecution().addEventHandler("click", this._attachExecution.bind(this));
            this.view.getActionSetupData().addEventHandler("click", this._attachSetupData.bind(this));

            this.execution = new Execution({context: this.getContext()});
        },

        onStart: function () {
            //by default open Execution
            this.view.checkExecutionButton();

            this.execution.start(this.view.getReportContent());
            this._attachExecution();
        },

        onStop: function () {
            this.execution.stop();
            this.stopSetup();
        },

        _attachExecution: function () {
            if (!this.execution.isAttached()) {
                this.stopSetup();
                this.execution.attach();
            }
        },

        stopSetup: function () {
            if (this.setupData) {
                this.setupData.stop();
            }
        },

        _attachSetupData: function () {
            if (!(this.setupData && this.setupData.isAttached())) {
                this.stopSetup();
                this.setupData = new SetupData({context: this.getContext()});
                this.execution.detach();
                this.setupData.start(this.view.getReportContent());
            }
        }

    });
});