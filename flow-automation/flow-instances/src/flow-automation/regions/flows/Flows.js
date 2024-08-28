define([
    'jscore/core',
    'jscore/ext/net',
    './FlowsView',
    'widgets/SelectionList',
    'widgets/InlineMessage',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/messageUtils',
    'i18n!flow-automation/dictionary.json',
    '../../services/FlowService',
    'widgets/Dialog',
    '../../ext/InstanceActionManager',
    'flow-automation-lib/helper/utils',
    'flow-automation-lib/services/Notifications',
    'container/api'
], function (core, net, View, SelectionList, InlineMessage, ErrorHandler, messageUtils, Dictionary, FlowService, Dialog, ActionManager,
             utils, Notifications, container) {
    'use strict';
    return core.Region.extend({

        view: function () {
            return new View({
                dictionary: Dictionary
            });
        },

        onStart: function () {
            this.initialId = utils.getURLSearchParams().get("flowId");
        },

        onViewReady: function () {
            this.fetchFlows();
            this.eventBus = this.getEventBus();
            ActionManager.setEventBus(this.eventBus);
            this.eventBus.subscribe('flow:startedSuccess', this.onFlowStartSuccess.bind(this));
            this.eventBus.subscribe('FlowInstances:resumed', this.resumingInstances.bind(this));
            this.eventBus.subscribe('FlowInstances:leaving', this.leavingInstances.bind(this));
            FlowService.flowList.addEventHandler('rowselect', this.addExecuteToActionBar.bind(this));
            this.contextMenuEvtHandler();
        },

        leavingInstances: function () {
            this.getEventBus().publish('topsection:leavecontext');
            FlowService.flowList.unselectAllRows();
        },

        resumingInstances: function (flowId) {
            FlowService.selectRowWithFlowId(flowId);
            this.fetchFlows();
            this.getEventBus().publish('FlowInstances:Start', flowId);
        },

        fetchFlows: function () {
            FlowService.fetchFlows(this.displayFlows.bind(this), this.setFetchFlowError.bind(this));
        },

        selectRowWhenRightClicked: function (row) {
            this.selectedFlowData = row.options.model;
            this.selectedFlowData.selected = true;
            this.eventBus.publish('Flows:rightClick', row, true);
        },

        addExecuteToActionBar: function (row, isSelected) {
            if (isSelected === false) {
                utils.setURLParams("flowId", '');
                ActionManager.getFlowActions(false, false);
            } else {
                this.selectedFlowData = row.options.model;
                utils.setURLParams("flowId", this.selectedFlowData.flowId);
                ActionManager.setExecuteHeader(this.selectedFlowData.name);
                ActionManager.setSelectedFlowData(this.selectedFlowData);
                this.handleContext(row);
            }
        },

        publishActions: function (data, userPermission) {
            var executePermission = userPermission.execute.permission || userPermission.execute.strategy !== 'reject';
            var actions = ActionManager.getInstanceDefaultActions(data.flowEnabled && executePermission);
            if (actions && actions.length > 0) {
                this.eventBus.publish('topsection:contextactions', actions);
                if (!!data.resolve) {
                    data.resolve(actions);
                }
            } else {
                this.eventBus.publish('topsection:leavecontext');
                if (!!data.reject) {
                    data.reject();
                }
            }
        },

        handleContext: function (row, resolve, reject) {
            var data = {
                flowEnabled: row.options.model.enabled,
                resolve: resolve,
                reject: reject
            };
            FlowService.getUserPermissions(row.options.model.flowId).then(
                this.publishActions.bind(this, data).bind(this),
                this.publishActions.bind(this, data, {
                    "execute": {
                        "permission": false,
                        "strategy": "reject"
                    }
                }));
        },

        contextMenuEvtHandler: function () {
            FlowService.flowList.addEventHandler('rowevents:contextmenu', function (row, e) {
                ActionManager.setExecuteHeader(row.options.model.name);
                this.selectedFlowData = row.options.model;
                ActionManager.setSelectedFlowData(this.selectedFlowData);
                this.selectRowWhenRightClicked(row);
                FlowService.flowList.unselectAllRows();
                FlowService.flowList.selectRows(function (r) {
                    return (r === row);
                });

                container.getEventBus().publish('contextmenu:show', e, function () {
                    return new Promise(function (resolve, reject) {
                        this.handleContext(row, resolve, reject);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        onFlowStartSuccess: function (data) {
            this.getEventBus().publish('FlowInstances:newInstance', data);
        },

        selectAFlowIfApplicable: function (selectedFlow) {
            if (selectedFlow) {
                FlowService.flowList.selectRows(function (row) {
                    return (row.getData().flowId === selectedFlow.flowId);
                }.bind(this));
            }
        },

        getSelectedFlow: function () {
            var selectedFlow;
            if (this.initialId) {
                selectedFlow = {};
                selectedFlow.flowId = this.initialId;
                this.initialId = null;
            }
            if (FlowService.getSelectedRow().length > 0) {
                selectedFlow = FlowService.getSelectedRow()[0].options.model;
            }
            return selectedFlow;
        },

        displayFlowsOrNoFlowsMessage: function (flowsToDisplay) {
            if (flowsToDisplay.length === 0) {
                this.getNewInlineMsg(Dictionary.get('flowWarnings.noFlows'));
                this.noFlowsFound.attachTo(this.view.getListHolder());
            } else {
                FlowService.flowList.setData(flowsToDisplay);
                FlowService.flowList.attachTo(this.view.getListHolder());
                this.view.removeBordersInList();
            }
            if (this.serverError) {
                this.serverError.destroy();
                this.serverError = null;
            }
        },

        createRowsForTable: function (flows, selectedFlow, flowsToDisplay) {
            flows.map(function (flow) {
                if (selectedFlow && selectedFlow.flowId === flow.id) {
                    return flowsToDisplay.push({
                        name: flow.name,
                        flowId: flow.id,
                        selected: true,
                        enabled: flow.status === 'enabled',
                        source: flow.source,
                        setupPhaseRequired: flow.flowVersions.find(function (version) {
                            return version.active === true;
                        }).setupPhaseRequired
                    });
                }
                return flowsToDisplay.push({
                    name: flow.name,
                    flowId: flow.id,
                    selected: false,
                    enabled: (flow.status === 'enabled'),
                    source: flow.source,
                    setupPhaseRequired: flow.flowVersions.find(function (version) {
                        return version.active === true;
                    }).setupPhaseRequired
                });
            });
        },

        checkForIncorrectURL: function (flows) {
            if (this.initialId) {
                var idExists = false;
                for (var flow in flows) {
                    if (flows[flow].id === this.initialId) {
                        idExists = true;
                        break;
                    }
                }
                if (!idExists) {
                    this.eventBus.publish('Flows:idInUrlDoesNotExist');
                }
            }
        },

        displayFlows: function (flows) {
            this.checkForIncorrectURL(flows);
            this.destroyNoFlowsNotification();
            var flowsToDisplay = [];
            var selectedFlow = this.getSelectedFlow();

            this.createRowsForTable(flows, selectedFlow, flowsToDisplay);
            this.displayFlowsOrNoFlowsMessage(flowsToDisplay);
            FlowService.sortTableAlphabetically();

            if (!!selectedFlow) {
                FlowService.selectRowWithFlowId(selectedFlow.flowId);
                this.addExecuteToActionBar(FlowService.getSelectedRow()[0]);
            }

            this.view.removeBordersInList();
        },

        setFetchFlowError: function (error, response) {
            //todo refractory with customError
            if (this.serverError) {
                this.serverError.destroy();
            }

            var errorCode = response.getStatus();
            var responseText = response.getResponseText();
            var errorBody = messageUtils.getErrorMessage(errorCode, responseText);

            switch (errorCode) {

                case 401:
                case 403:
                case 404:
                    ErrorHandler.fullScreenError(errorBody);

                    break;

                default:
                    this.getNewInlineErrorMsg(errorBody).attachTo(this.view.getListHolder());
                    container.getEventBus().publish('container:loader-hide');
                    FlowService.flowList.detach();
            }
        },

        destroyNoFlowsNotification: function () {
            if (this.noFlowsFound) {
                this.noFlowsFound.destroy();
            }
        },

        getNewInlineMsg: function (header) {
            this.noFlowsFound = new InlineMessage({
                header: header,
                icon: 'infoMsgIndicator'
            });
        },

        getNewInlineErrorMsg: function (errorBody) {
            this.serverError = new InlineMessage({
                header: errorBody.userMessage.title,
                icon: 'error',
                description: errorBody.userMessage.body
            });
            return this.serverError;
        }
    });
});