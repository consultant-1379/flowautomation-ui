define([
    'jscore/core',
    'jscore/ext/net',
    'i18n!flow-automation/dictionary.json',
    'widgets/Dialog',
    'flow-automation-lib/flow-execute/FlowExecute',
    'flow-automation-lib/helper/flow',
    'flow-automation-lib/flow-instance/flowInstanceStopAction',
    './InstanceDeleteActionManager'
], function (core, net, dictionary, Dialog, FlowExecute, flowHelper, flowInstanceStopAction, deleteAction) {
    var eventBus;
    var executeHeader = "";
    var headerName = "";
    var selectedFlowData;
    var location;

    /**
     * extracted behavior to show and configure the hidden fields
     * @param dialog
     * @private
     */
    function _displayDialog(dialog) {
        dialog.show();
        dialog.view.getOptionalContent().getNative().style.display = "none";
    }

// Define the different possible actions we can have.
    var actions = {

        'execute': {
            name: dictionary.get("execute.executeText"),
            type: "button",
            disabled: false,
            action: function () {
                var form = new FlowExecute({
                    eventBus: eventBus,
                    flowName: flowHelper.generateFlowName(headerName)
                });
                form.addEventHandler('flowstart:success', function (data) {
                    eventBus.publish('flow:startedSuccess', data, true);
                });

                function getButtonText() {
                    if (selectedFlowData.setupPhaseRequired === true) {
                        return dictionary.get("execute.flowContinueButtonText");
                    } else {
                        return dictionary.get("execute.flowExecuteButtonText");
                    }
                }

                var dialog = new Dialog({
                    header: executeHeader,
                    optionalContent: "checkUserFlowExecutionPermission:true",
                    content: form,
                    buttons: [{
                        caption: getButtonText(),
                        action: startFlowInstance
                    }, {
                        caption: dictionary.get("execute.cancel"),
                        action: destroyDialog
                    }]
                });
                if (selectedFlowData.setupPhaseRequired === true) {
                    dialog.options.content.setFlowSetupPhaseRequiredMessage();
                }
                _displayDialog(dialog);
                var executeSubscriber = eventBus.subscribe('FlowExecute:execute', startFlowInstance);

                var confirmationDialog;

                function startFlowInstance() {
                    if (form.getInstanceData().name) {
                        if (selectedFlowData.setupPhaseRequired === true) {
                            form.executeFlow(form.getInstanceData(), dialog, selectedFlowData);
                            eventBus.unsubscribe(executeSubscriber);
                        } else {
                            confirmationDialog = new Dialog({
                                header: dictionary.get("execute.confirmExecutionHeader"),
                                content: dictionary.get("execute.confirmExecutionContent"),
                                buttons: [
                                    {
                                        caption: dictionary.get("execute.flowExecuteButtonText"),
                                        action: startFlowInstanceAfterConfirmation
                                    },
                                    {
                                        caption: dictionary.get("execute.cancel"),
                                        action: destroyConfirmationDialog
                                    }
                                ]
                            });
                            dialog.hide();
                            confirmationDialog.show();
                        }
                    }
                }

                function destroyConfirmationDialog() {
                    confirmationDialog.destroy();
                    _displayDialog(dialog);
                }

                function startFlowInstanceAfterConfirmation() {
                    confirmationDialog.destroy();
                    form.executeFlow(form.getInstanceData(), dialog, selectedFlowData);
                    eventBus.unsubscribe(executeSubscriber);
                }

                function destroyDialog() {
                    dialog.destroy();
                    eventBus.unsubscribe(executeSubscriber);
                }
            }.bind(this)
        }
    };

    function getViewFlowInstanceDetailsAction(flowInstance) {
        var openUsertasks = flowInstance && (typeof flowInstance.userTasks === 'object');
        return {
            name: dictionary.get('actions.flowInstanceDetails'),
            type: "button",
            color: 'darkBlue',
            action: function () {
                location.setLocation('flow-automation/flowinstancedetails?flowId=' + flowInstance.flowId + '&source=' + flowInstance.flowSource + '&executionName=' + flowInstance.name + '&userTasks=' + openUsertasks + '&state=' + flowInstance.state + '&flowVersion=' + flowInstance.flowVersion);
            }.bind(this)
        };
    }

    return {

        getFlowInstanceActions: function (flowInstance) {
            var flowInstanceActions = [getViewFlowInstanceDetailsAction(flowInstance)];

            flowInstanceActions.push(flowInstanceStopAction.getAction({
                'flowInstance': flowInstance,
                'eventBus': eventBus
            }));

            flowInstanceActions.push(deleteAction.getAction({
                'flowInstance': flowInstance,
                'eventBus': eventBus
            }));

            eventBus.publish('topsection:contextactions', flowInstanceActions);
        },

        getFlowActions: function (isSelectedRow, isEnable) {
            if (isSelectedRow) {
                eventBus.publish('topsection:contextactions', this.getInstanceDefaultActions(isEnable));
            } else {
                eventBus.publish('topsection:contextactions', []);
                eventBus.publish('topsection:leavecontext');
            }
        },

        setLocation: function (theLocation) {
            location = theLocation;
        },

        setEventBus: function (theEventBus) {
            eventBus = theEventBus;
        },

        setExecuteHeader: function (header) {
            executeHeader = dictionary.get("execute.dialog") + header;
            headerName = header;
        },

        setSelectedFlowData: function (data) {
            selectedFlowData = data;
        },

        redirectToFlowInstanceDetails: function (flowInstance) {
            if (Array.isArray(flowInstance) && flowInstance.length) {
                var openUsertasks = flowInstance && (typeof flowInstance[0].userTasks === 'object');
                location.setLocation('flow-automation/flowinstancedetails?flowId=' + flowInstance[0].flowId + '&source=' + flowInstance[0].flowSource + '&executionName=' + flowInstance[0].name + '&userTasks=' + openUsertasks + '&state=' + flowInstance[0].state);
            }
        },

        getInstanceDefaultActions: function (enabled) {
            var actionsList = [];
            if (!flowHelper.isInternalFlow(selectedFlowData.source)) {
                actions.execute.disabled = !enabled;
                actionsList.push(actions.execute);
            }
            return actionsList;
        }
    };
});