define([
    'jscore/core',
    './ProcessDiagramTabView',
    'flow-automation-lib/process-definition-diagram/ProcessDefinitionDiagram',
    'flow-automation-lib/process-activity-diagram/ProcessActivityDiagram',
    'i18n!flow-instance-details/dictionary.json',
    'widgets/InlineMessage',
    'jscore/ext/net',
    'flow-automation-lib/services/PollingSynchronizer',
    '../../ext/utils/UriInfo'
], function (core, View, ProcessDefinitionDiagram, ProcessActivityDiagram, dictionary, InlineMessage,
             net, PollingSynchronizer, UriInfo) {
    'use strict';

    var faBaseUrl = 'flowautomation/v1';
    var FLOW_INSTANCE_DETAILS_DIAGRAM = "FlowInstanceDetailsDiagram";

    return core.Region.extend({

        view: function () {
            return new View({dictionary: dictionary});
        },

        onViewReady: function (options) {
            this.view.getActivityButton().addEventHandler("click", function () {
                if (this.processDefinitionDiagram) {
                    this.processDefinitionDiagram.detach();
                }
                this.processActivityDiagram.attachTo(this.view.getDiagram());
            }.bind(this));
            this.view.getDefinitionButton().addEventHandler("click", function () {
                if (this.processActivityDiagram) {
                    this.processActivityDiagram.detach();
                }
                this.processDefinitionDiagram.attachTo(this.view.getDiagram());
            }.bind(this));
        },

        onStart: function () {
            this.view.showActionsAndDiagramSection();
            this.view.hideErrorSection();

            this.recreateProcessDefinitionDiagram();

            this.recreateProcessActivityDiagram();

            // Attach processActivityDiagram - using click handler to ensure correct button in radio button group is selected
            this.view.checkActivityButton();

            this.pollingSubscriber = this.getEventBus().subscribe('FlowInstanceDetails:adjustPolling', this.handlePolling.bind(this));
        },

        onStop: function () {
            this.destroyProcessActivityDiagram();
            this.destroyProcessDefinitionDiagram();
            PollingSynchronizer.remove(FLOW_INSTANCE_DETAILS_DIAGRAM);
            this.getEventBus().unsubscribe('FlowInstanceDetails:adjustPolling', this.pollingSubscriber);
        },

        handlePolling: function (event) {
            if (event.fetchDiagram) { // fetch request: do a fetch and stop the polling if active.
                if (this.processActivityDiagram) {
                    this.processActivityDiagram.handlePolling();
                }
                PollingSynchronizer.remove(FLOW_INSTANCE_DETAILS_DIAGRAM);
            } else if (event.pollDiagram) { // start polling.
                PollingSynchronizer.agg(FLOW_INSTANCE_DETAILS_DIAGRAM, this.doPolling, this);
            } else { //stop polling if active
                PollingSynchronizer.remove(FLOW_INSTANCE_DETAILS_DIAGRAM);
            }
        },

        recreateProcessActivityDiagram: function () {
            this.destroyProcessActivityDiagram();
            this.processActivityDiagram = new ProcessActivityDiagram({
                executionName: UriInfo.getExecutionName(),
                flowId: UriInfo.getFlowId()
            });
        },

        destroyProcessActivityDiagram: function () {
            if (this.processActivityDiagram) {
                this.processActivityDiagram.destroy();
            }
        },

        recreateProcessDefinitionDiagram: function () {
            this.destroyProcessDefinitionDiagram();
            net.ajax({
                url: faBaseUrl + '/executions?flow-id=' + UriInfo.getFlowId() + '&flow-execution-name=' + UriInfo.getExecutionName(),
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (executions) {
                    var execution = executions[0];
                    var flowVersion = execution.flowVersion;
                    this.processDefinitionDiagram = new ProcessDefinitionDiagram({
                        flowId: UriInfo.getFlowId(),
                        flowVersion: flowVersion
                    });
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        destroyProcessDefinitionDiagram: function () {
            if (this.processDefinitionDiagram) {
                this.processDefinitionDiagram.destroy();
            }
        },

        doPolling: function () {
            if (this.processActivityDiagram) {
                this.processActivityDiagram.handlePolling();
            }
        },

        handleServerError: function () {
            // remove diagram
            this.view.hideActionsAndDiagramSection();

            // show inline error
            if (this.inlineMessage) {
                this.inlineMessage.destroy();
            }

            this.inlineMessage = new InlineMessage({
                icon: 'error',
                header: dictionary.get('errorResponse.unableToRetrieveDataHeader')
            });
            this.inlineMessage.attachTo(this.view.getErrorSection());
            this.view.showErrorSection();
        }
    });
});