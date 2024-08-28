define([
    'jscore/core',
    'jscore/ext/locationController',
    '../../ext/utils/net',
    'widgets/Tabs',
    '../../widgets/user-task-summary/UserTaskSummary',
    './FlowInstanceDetailsView',
    'i18n!flow-instance-details/dictionary.json',
    '../user-task-tab/UserTaskTab',
    '../report-tab/ReportTab',
    '../process-diagram-tab/ProcessDiagramTab',
    'container/api',
    '../../ext/action-manager/ActionStop',
    '../../ext/action-manager/ActionRestart',
    '../../ext/action-manager/ActionCancel',
    '../../ext/action-manager/ActionDownloadData',
    'flow-automation-lib/helper/utils',
    'flow-automation-lib/helper/Loader',
    'flow-automation-lib/helper/execution',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/CustomError',
    'flow-automation-lib/services/Notifications',
    '../event-tab/EventTab',
    'flow-automation-lib/services/PollingSynchronizer',
    '../../ext/utils/UriInfo'
], function (core, LocationController, net, Tabs, UserTaskSummary, View, dictionary, UserTaskTab, ReportTab, ProcessDiagramTab,
             container, actionStop, actionRestart, actionCancel, actionDownloadData, helper,
             Loader, execution, ErrorHandler, CustomError, Notifications, EventTab, PollingSynchronizer, UriInfo) {
    'use strict';

    var FLOW_INSTANCE_DETAILS_SUMMARY = "FlowInstanceDetailsSummary";

    function _fetchExecution(flowId, executionName) {
        return net.ajax({
            url: '/flowautomation/v1/executions?flow-id=' + flowId + '&flow-execution-name=' + executionName,
            type: 'GET',
            dataType: 'json'
        }).then(function (response) {
            if (!response.data || response.data.length === 0) {
                Loader.hide();
                ErrorHandler.fullScreenError({userMessage: dictionary.get("errors.notFoundFlowId")});
            } else {
                UriInfo.setParamFlowVersion(response.data[0].flowVersion);
                return response.data;
            }
        }).catch(function (response) {
            if (response.xhr) {
                CustomError.userTasksErrorHandling(response);
            } else {
                // error
            }
        });
    }

    function _errorIfFlowIdAndExecutionNameEmpty() {
        container.getEventBus().publish('container:error', {
            "header": dictionary.errors.applicationErrorHeader,
            "content": dictionary.errors.missingFlowIdOrExecutionNameInURL
        });
    }

    return core.Region.extend({

        view: function () {
            return new View({
                header: dictionary.header
            });
        },

        onViewReady: function () {
            this.locationController = new LocationController({namespace: this.options.namespace});
            this.userTaskTab = new UserTaskTab({context: this.getContext()});
            this.reportTab = new ReportTab({context: this.getContext()});
            this.processDiagramTab = new ProcessDiagramTab({context: this.getContext()});
            this.eventTab = new EventTab({context: this.getContext()});
        },

        onStart: function () {
            UriInfo.update();
            this.locationController.start();
            container.getEventBus().publish('container:loader');
// IDUN-2980 UI – Removing Action Library
//            this.getEventBus().subscribe('FlowInstanceDetails:actions', this.publishActions, this);
            this.getEventBus().subscribe('FlowInstance:notify', this._onSendNotification, this);
            this.getEventBus().subscribe('UserTasks:NumberOfActiveUserTasks', this.onNewActiveUserTasks, this);
            this.getEventBus().subscribe('UserTasks:noUserTasks', this.handleNoUserTasks, this);
            this.getEventBus().subscribe('UserTask:isConfirmAndReview', this.handleReviewAndConfirmTask, this);

            this.updateActions();

            if (this.userTaskSummary) {
                this.userTaskSummary.destroy();
            }
            this.userTaskSummary = new UserTaskSummary({
                context: this.getContext()
            });
            this.userTaskSummary.attachTo(this.view.getSummary());
            this.startUpdate(UriInfo.getFlowId(), UriInfo.getExecutionName());
        },

        onStop: function () {
            PollingSynchronizer.stop();

            this.locationController.stop();
            //stop subscribe
            this.getEventBus().unsubscribe('layouts:rightpanel:beforechange', this.showFormDetailSubscription);
            this.getEventBus().unsubscribe('flowInstances:executionState', this.executionStateSubscription);

            this.userTaskSummary.destroy();
            this.userTaskTab.stop();
            this.reportTab.stop();
            this.processDiagramTab.stop();
            this.eventTab.stop();
            this.tabs.destroy();
        },
// IDUN-2980 UI – Removing Action Library
//        publishActions: function (actions) {
//            this.updateActions(actions);
//        },

        updateActions: function (actions) {
            this.getEventBus().publish('topsection:leavecontext');

            if (actions) {
                console.debug('%c action selected', 'background: yellow; color: black');
                this.getEventBus().publish('topsection:contextactions', actions);
            } else {
                var contextActionList = [
                    actionStop.getAction({'eventBus': this.getEventBus()}),
                    actionRestart.getAction({'classRef': this}),
                    actionCancel.getAction({
                        'classRef': this,
                        'locationController': this.locationController
                    }),
                    actionDownloadData.getAction({
                        'classRef': this,
                        'locationController': this.locationController,
                        'isConfirmAndReview': this.reviewAndConfirm
                    })
                ];
                if (helper.isEmpty(contextActionList)) {
                    this.getEventBus().publish('topsection:leavecontext');
                } else {
                    this.getEventBus().publish('topsection:contextactions', contextActionList.filter(function (value) {
                        return Object.keys(value).length !== 0;
                    }));
                }

            }
        },

        _onSendNotification: function (message) {
            this.summaryUpdate();
            var notification = Notifications.success(message);
            notification.attachTo(this.getElement());
        },

        onNewActiveUserTasks: function (numberOfActiveUserTasks) {
            if (numberOfActiveUserTasks > 0) {
                this.tabs.setTabTitle(1, dictionary.tabs.userTasks + " (" + numberOfActiveUserTasks + ")");
            } else {
                this.tabs.setTabTitle(1, dictionary.tabs.userTasks);
            }
        },

        handleNoUserTasks: function () {
            this.tabs.setTabTitle(1, dictionary.tabs.userTasks);
        },

        handleReviewAndConfirmTask: function (isConfirmAndReview) {
            this.reviewAndConfirm = isConfirmAndReview;
            this.updateActions();
        },

        onClickShowFormDetail: function (showing, value) {
            //TODO need change code for more the one tab
            this.tabs.setSelectedTab(1);
        },

        reportAvailable: function () {
            this.reportAvailable = true;
        },

        setTab: function () {
            this.tabs = new Tabs({
                tabs: [{
                    title: dictionary.get("tabs.report"),
                    content: this.reportTab
                }, {
                    title: dictionary.get("tabs.userTasks"),
                    content: this.userTaskTab
                }, {
                    title: dictionary.get("tabs.processDiagram"),
                    content: this.processDiagramTab
                }, {
                    title: dictionary.get("tabs.events"),
                    content: this.eventTab
                }]
            });
            this.tabs.attachTo(this.view.getTabs());
            this.tabs.addEventHandler('tabselect', this.tabSelect.bind(this));
            this.selectTab();
        },

        selectTab: function () {
            if (this.userTasks > 0) {
                this.tabs.setSelectedTab(1);
                if (execution.isInSetupPhase(UriInfo.getState())) {
                    this.view.hideTab(dictionary.get("tabs.report"));
                }
                this.tabSelect(dictionary.get("userTasks"));
            } else {
                if (execution.isInSetupPhase(UriInfo.getState()) || execution.isInSetupFailedState(UriInfo.getState())) {
                    this.tabs.setSelectedTab(1);
                    this.view.hideTab(dictionary.get("tabs.report"));
                    this.tabSelect(dictionary.get("userTasks"));
                } else if (this.reportAvailable) {
                    this.tabs.setSelectedTab(0);
                    this.tabSelect(dictionary.get("tabs.report"));
                }
            }
        },

        tabSelect: function (title) {
            if (dictionary.get("tabs.events") === title) {
                this.eventTab.refresh();
            }

            this.getEventBus().publish('FlowInstanceDetails:tabSelectionChanged', title);

            var executionInFinalState = execution.isInFinalState(UriInfo.getState());
            var reportTabSelected = dictionary.get("tabs.report") === title;

            var processDiagramTabSelected = dictionary.get("tabs.processDiagram") === title;
            this.getEventBus().publish('FlowInstanceDetails:adjustPolling', {
                'fetchReport': executionInFinalState && reportTabSelected,
                'fetchDiagram': executionInFinalState && processDiagramTabSelected,
                'pollReport': reportTabSelected,
                'pollDiagram': processDiagramTabSelected
            });
        },

        handleExecutionState: function (state) {
            if (UriInfo.getState() !== state) {
                //update url state
                UriInfo.setParamState(state);

                this.showReportTabBasedOnExecutionState();
                this.updateActions();

                if (execution.isInFinalState(UriInfo.getState())) {
                    PollingSynchronizer.stop();
                    this.getEventBus().publish('FlowInstanceDetails:adjustPolling', {
                        'fetchReport': true,
                        'fetchDiagram': true,
                        'pollReport': false,
                        'pollDiagram': false
                    });
                }
            }
        },


        showReportTabBasedOnExecutionState: function () {
            if (execution.isInIntermediateState(UriInfo.getState())) {
                this.view.showTab(dictionary.get("tabs.report"));
            }
            if (execution.isInFinalState(UriInfo.getState())) {
                if (execution.isInSetupFailedState(UriInfo.getState())) {
                    this.reportTab.stop();
                } else {
                    this.view.showTab((dictionary.get("tabs.report")));
                }
            }
        },


        // --------------------- REST ------------------------------

        commonPublish: function (flowInstance) {
            this.getEventBus().publish('userTasksSummary:update', flowInstance);
            this.handleExecutionState(flowInstance.state);
        },

        summaryUpdate: function () {
            var flowId = UriInfo.getFlowId();
            var executionName = UriInfo.getExecutionName();

            if (flowId && executionName) {
                _fetchExecution(flowId, executionName).then(function (data) {
                    var flowInstance = data[0];
                    if (flowInstance) {
                        this.commonPublish(flowInstance);
                        this.userTasks = flowInstance.numberActiveUserTasks;
                    }
                }.bind(this));
            } else {
                _errorIfFlowIdAndExecutionNameEmpty();
            }
        },

        startUpdate: function (flowId, executionName) {
            if (flowId && executionName) {
                _fetchExecution(flowId, executionName).then(function (data) {
                    if (data) {
                        var flowInstance = data[0];
                        this.commonPublish(flowInstance);
                        this.userTasks = flowInstance.numberActiveUserTasks;
                        this.userTaskTab.start();

                        if (!execution.isInFinalState(UriInfo.getState())) {
                            console.debug("FlowInstanceDetails.js adding methods to the polling");
                            PollingSynchronizer.agg(FLOW_INSTANCE_DETAILS_SUMMARY, this.summaryUpdate, this);
                            this.userTaskTab.handlePollingInUserTab();
                        }

                        this.reportTab.start();
                        this.processDiagramTab.start();
                        this.getEventBus().subscribe('ReportTab:reportAvailable', this.reportAvailable, this);
                        this.setTab();

                        this.showFormDetailSubscription = this.getEventBus().subscribe('layouts:rightpanel:beforechange', this.onClickShowFormDetail, this);
                        this.executionStateSubscription = this.getEventBus().subscribe('flowInstances:executionState', this.getCurrentExecutionState, this);
                    }
                }.bind(this));
            } else {
                _errorIfFlowIdAndExecutionNameEmpty();
            }
        },

        getCurrentExecutionState: function () {
            if (UriInfo.getFlowId() && UriInfo.getExecutionName()) {
                _fetchExecution(UriInfo.getFlowId(), UriInfo.getExecutionName()).then(function (data) {
                    var flowInstance = data[0];
                    if (flowInstance) {
                        this.commonPublish(flowInstance);
                        this.showReportTabBasedOnExecutionState();
                    }
                }.bind(this));
            } else {
                _errorIfFlowIdAndExecutionNameEmpty();
            }
        }
    });
});
