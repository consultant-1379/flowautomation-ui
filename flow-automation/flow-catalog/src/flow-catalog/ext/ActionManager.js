define([
    'jscore/core',
    'jscore/ext/net',
    'i18n!flow-catalog/dictionary.json',
    'widgets/Dialog',
    '../widgets/flow-import/FlowImport',
    'flow-automation-lib/flow-execute/FlowExecute',
    'flow-automation-lib/helper/flow'
], function (core, net, dictionary, Dialog, FlowImport, FlowExecute, flowHelper) {
    var eventBus;
    var executeHeader = "";
    var headerName = "";
    var flowId;
    var selectedFlowData;

    /**
     * extracted behavior to show and configure the hidden fields
     * @param dialog
     * @private
     */
    function _displayDialog(dialog) {
        dialog.show();
        dialog.view.getOptionalContent().getNative().style.display = "none";
    }

    function getFlowActionsBySource() {
        var flowActions = [actions.viewAllInstances];

        if (!flowHelper.isInternalFlow(selectedFlowData.source)) {
            var executePermission = selectedFlowData.userPermission && (selectedFlowData.userPermission.execute.permission || selectedFlowData.userPermission.execute.strategy !== 'reject');
            actions.execute.disabled = selectedFlowData.status === 'disabled' || !executePermission;
            flowActions.push(actions.execute);
            flowActions.push(actions.disable);
        }
        return flowActions;

    }

    // Define the different possible actions we can have.
    var actions = {
        'import': {
            type: 'button',
            name: dictionary.flow.importFlow,
            color: "darkBlue",
            action: function () {
                var form = new FlowImport({
                    eventBus: eventBus
                });
                form.addEventHandler('flowimport:success', function (message) {
                    eventBus.publish('flow:importedSuccess', message, true);
                });

                var dialog = new Dialog({
                    header: dictionary.get("flow.selectFlowPackage"),
                    content: form,
                    buttons: [{
                        caption: dictionary.import.import,
                        color: 'darkBlue',
                        action: function () {
                            form.submitForm(dialog);
                        }
                    }, {
                        caption: dictionary.import.cancel,
                        action: function () {
                            dialog.destroy();
                        }
                    }]
                });
                dialog.show();
                eventBus.publish('ActionManager:importFlowFormDisplayed');

                function focusImportFlowButton() {
                    var importButton = dialog.getButtons().find(function (button) {
                        return button.options.caption === dictionary.import.import;
                    });

                    importButton.getElement().focus();
                }

                eventBus.subscribe('FileSelector:selectionChange', focusImportFlowButton);
            }.bind(this)
        },

        'separator': {
            type: 'separator'
        },

        'viewAllInstances': {
            name: dictionary.flow.viewInstancesOfFlow,
            type: "button",
            action: function () {
                eventBus.publish('ActionManager:setLocationToInstances', flowId);
            }.bind(this)
        },

        'execute': {
            name: dictionary.execute.executeText,
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

                var setupPhaseRequired = selectedFlowData.flowVersions.find(function (version) {
                    return version.active === true;
                }).setupPhaseRequired;

                function getButtonText() {
                    return dictionary.get(setupPhaseRequired ? "execute.flowContinueButtonText" : "execute.flowExecuteButtonText");
                }

                var dialog = new Dialog({
                    header: executeHeader,
                    optionalContent: "checkUserFlowExecutionPermission:true",
                    content: form,
                    buttons: [{
                        caption: getButtonText(),
                        action: startFlowInstance
                    }, {
                        caption: dictionary.execute.cancel,
                        action: destroyDialog
                    }]
                });

                if (setupPhaseRequired === true) {
                    dialog.options.content.setFlowSetupPhaseRequiredMessage();
                }
                _displayDialog(dialog);
                var executeSubscriber = eventBus.subscribe('FlowExecute:execute', startFlowInstance);

                var confirmationDialog;

                function startFlowInstance() {
                    if (form.getInstanceData().name) {
                        if (setupPhaseRequired === true) {
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
        },

        'disable': {
            name: dictionary.get("flow.disable"),
            type: "button",
            action: function () {
                eventBus.publish('topsectionactions:flowstatuschanged');
            }
        }
    };

    return {
        setEventBus: function (theEventBus) {
            eventBus = theEventBus;
        },

        setExecuteHeader: function (header) {
            executeHeader = dictionary.execute.dialog + header;
            headerName = header;
        },

        setSelectedFlowData: function (data) {
            selectedFlowData = data;
        },

        setFlowId: function (flowIdToSet) {
            flowId = "flowId=" + flowIdToSet;
        },

        getCurrentContextActions: function () {
            return actions;
        },

        updateCurrentContextActions: function (updatedActions) {
            actions = updatedActions;
        },

        getDefaultActions: function () {
            return [actions.import];
        },

        getContextActions: function (flowData) {
            var flowActions = [actions.import, actions.separator];
            if (flowData.selected) {
                Array.prototype.push.apply(flowActions, getFlowActionsBySource());
                flowActions.splice(4, 0, actions.separator);
            }
            return flowActions;
        },

        getFlowActionsBySource: getFlowActionsBySource
    };
});