define([
    'jscore/core',
    './UserTaskSummaryView',
    'i18n!flow-instance-details/dictionary.json',
    'container/api',
    'flow-automation-lib/helper/utils'
], function (core, View, Dictionary, container, utils) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                Dictionary: Dictionary
            });
        },

        init: function (options) {
            this.context = options.context;
            this.flowId = options.flowId;
            this.executionName = options.executionName;
        },

        onViewReady: function () {
            this.context.eventBus.subscribe('userTasksSummary:update', this.onUpdate, this);
        },

        onUpdate: function (execution) {
            if (execution) {
                this.view.setName(execution.name || Dictionary.notApplicable);
                this.view.setFlow(execution.flowName || Dictionary.notApplicable);
                this.view.setVersion(execution.flowVersion || Dictionary.notApplicable);
                this.view.setState(execution.state ? Dictionary.get(execution.state) : Dictionary.notApplicable);
                this.view.setStart(execution.startTime ? utils.convertDate(execution.startTime) : Dictionary.notApplicable);
                this.view.setEnd(execution.endTime ? utils.convertDate(execution.endTime) : Dictionary.notApplicable);
                this.view.setStartedBy(execution.executedBy || Dictionary.notApplicable);
                this.view.setResult(execution.summaryReport || Dictionary.notApplicable);
            }
            container.getEventBus().publish('container:loader-hide');
        }

    });
});
