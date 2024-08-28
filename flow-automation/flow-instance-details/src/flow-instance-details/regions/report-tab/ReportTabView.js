define([
    'jscore/core',
    'template!./_reportTab.hbs',
    'styles!./_reportTab.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rReportTab';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getReportContent: function () {
            return this.getElement().find(parentEl + '-data');
        },

        getActionExecution: function () {
            return this.getElement().find(parentEl + '-actions-execution');
        },

        getActionSetupData: function () {
            return this.getElement().find(parentEl + '-actions-setupData');
        },

        checkExecutionButton: function () {
            this.getElement().find(parentEl + '-actions-setupData-input').getNative().checked = false;
            this.getElement().find(parentEl + '-actions-execution-input').getNative().checked = true;
        },

        setTitle: function (title) {
            this.getElement().find(parentEl + '-header').setText(title);
        }

    });
});