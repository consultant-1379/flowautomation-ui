define([
    'jscore/core',
    'template!./_userTaskSummary.hbs',
    'styles!./_userTaskSummary.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wUserTaskSummary';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (classId) {
            return this.getElement().find(parentEl + classId);
        },

        setName: function (name) {
            this.getViewElement("-summary-name").setText(name);
        },
        setFlow: function (flow) {
            this.getViewElement("-summary-flow").setText(flow);
        },
        setVersion: function (version) {
            this.getViewElement("-summary-version").setText(version);
        },

        showStoppedStateIcon: function (showIcon) {
            var stateIconElement = this.getViewElement("-summaryData-dataDiv-stateIcon");
            if (showIcon === true) {
                stateIconElement.setStyle('display', 'inline-block');
            } else {
                stateIconElement.setStyle('display', 'none');
            }
        },

        setState: function (state) {
            this.showStoppedStateIcon(isExecutionStopped(state));
            this.getViewElement("-status-state").setText(state);
        },
        setStart: function (start) {
            this.getViewElement("-status-start").setText(start);
        },
        setEnd: function (end) {
            this.getViewElement("-status-end").setText(end);
        },
        setStartedBy: function (startedBy) {
            this.getViewElement("-status-started-by").setText(startedBy);
        },
        setResult: function (result) {
            this.getViewElement("-status-result").setText(result);
        }
    });

    function isExecutionStopped(state) {
        return state && state.toLowerCase() === "stopped";
    }
});
