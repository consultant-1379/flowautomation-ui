define([
    'jscore/core',
    'i18n/AdvancedDateTime',
    './InstancesView',
    'tablelib/Table',
    'tablelib/plugins/Selection',
    'tablelib/plugins/RowEvents',
    'i18n!flow-automation/dictionary.json',
    'widgets/InlineMessage',
    'flow-automation-lib/table-settings-button/TableSettingsButton',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/messageUtils',
    '../../widgets/statistics-holder/StatisticsHolder',
    '../../widgets/icon-cell/IconCell',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/ResizableHeader',
    '../../services/FlowService',
    'jscore/ext/locationController',
    '../../ext/InstanceActionManager',
    'flow-automation-lib/helper/utils',
    'container/api',
    'flow-automation-lib/services/Notifications',
    '../../services/InstanceService'
], function (core, DateTime, View, Table, Selection, RowEvents, Dictionary, InlineMessage, TableSettingsButton, ErrorHandler, messageUtils,
             StatisticsHolder, IconCell, SortableHeader, ResizableHeader, FlowService, LocationController, ActionManager, utils, container, Notifications, InstanceService) {

    'use strict';

    return core.Region.extend({

        view: function () {
            return new View({dictionary: Dictionary});
        },

        onStart: function () {
            this.locationController = new LocationController({
                namespace: this.options.namespace
            });
            this.locationController.start();
        },

        onViewReady: function () {
            this.myInstancesSelected = true;
            FlowService.flowList.addEventHandler('rowselect', this.flowSelect.bind(this));
            this.setUpTable();
            this.initialFlowId = utils.getURLSearchParams().get("flowId");
            this.fetchInstances();
            this.setUpPolling();
            this.view.getMyInstances().addEventHandler('click', this.onMyInstancesClick.bind(this));
            this.eventBus = this.getEventBus();
            this.eventBus.subscribe('FlowInstances:leaving', this.leavingInstances.bind(this));
            this.eventBus.subscribe('FlowInstances:Start', this.resumingInstances.bind(this));
            this.eventBus.subscribe('FlowInstances:newInstance', this.fetchInstance.bind(this));
            this.eventBus.subscribe('Flows:idInUrlDoesNotExist', this.fetchInstances.bind(this));
            this.eventBus.subscribe('Flows:rightClick', this.flowSelect.bind(this));
            this.stats = new StatisticsHolder();
            this.stats.attachTo(this.view.getStatsHolder());
            this.sortParams = {mode: "desc", column: "startTime"};
        },

        setUpTable: function () {
            var tableOptions = this.getTableOptions(this.getDefaultColumns());
            this.table = new Table(tableOptions);
            this.table.addEventHandler('rowselect', this.onTableSelect.bind(this));
            this.table.addEventHandler('rowevents:dblclick', this.onTableDblClick.bind(this));
            this.initializeTableSettings();
            this.view.showDefaultHeader();
        },

        flowSelect: function (row, isSelected) {
            this.selectedFlowInstanceData = undefined;
            this.fetchInstances(row, isSelected);
        },

        fetchInstance: function (data, row, isSelected) {
            this.myInstancesSelected = this.view.getMyInstancesValue().getProperty('checked');
            var selectedFlow = FlowService.getSelectedRow();
            if (row && isSelected) {
                selectedFlow = [row];
            }
            if (selectedFlow.length > 0) {
                this.flowId = selectedFlow[0].options.model.flowId;
                InstanceService.fetchInstances(this.instanceFetchSuccess.bind(this), this.instanceFetchError.bind(this),
                    {
                        "flow-id": this.flowId,
                        "flow-execution-name": data.name,
                        "filter-by-user": this.myInstancesSelected
                    });
            } else if (this.initialFlowId) {
                InstanceService.fetchInstances(this.instanceFetchSuccess.bind(this), this.instanceFetchError.bind(this),
                    {
                        "flow-id": this.initialFlowId,
                        "flow-execution-name": data.name,
                        "filter-by-user": this.myInstancesSelected
                    });
                this.initialFlowId = null;
            }
        },


        instanceFetchSuccess: function (instance) {
            ActionManager.redirectToFlowInstanceDetails(instance);
        },


        instanceFetchError: function () {
            var errorMessage = Dictionary.get("execute.failedToRetrieveInstance");
            var notification = Notifications.warning(errorMessage);
            notification.attachTo(this.getElement());
        },

        fetchInstances: function (row, isSelected) {
            this.myInstancesSelected = this.view.getMyInstancesValue().getProperty('checked');
            var selectedFlow = FlowService.getSelectedRow();
            if (row && isSelected) {
                selectedFlow = [row];
            }
            if (selectedFlow.length > 0) {
                this.flowId = selectedFlow[0].options.model.flowId;
                InstanceService.fetchInstances(this.instancesFetchSuccess.bind(this), this.setFetchInstanceError.bind(this),
                    {"flow-id": this.flowId, "filter-by-user": this.myInstancesSelected});
            } else if (this.initialFlowId) {
                InstanceService.fetchInstances(this.instancesFetchSuccess.bind(this), this.setFetchInstanceError.bind(this),
                    {"flow-id": this.initialFlowId, "filter-by-user": this.myInstancesSelected});
                this.initialFlowId = null;
            } else {
                this.fetchAllInstances();
            }
        },

        removeRow: function (removedElement) {
            this.table.setData(this.table.getData().filter(function (r) {
                return !(r.flowId === removedElement.flowId && r.name === removedElement.name);
            }));
        },

        fetchAllInstances: function () {
            InstanceService.fetchInstances(this.instancesFetchSuccess.bind(this), this.setFetchInstanceError.bind(this),
                {"filter-by-user": this.myInstancesSelected});
        },

        instancesFetchSuccess: function (instances) {
            if (instances.length > 0) {
                this.loadTable(instances);
                this.setSelectedInstance();
            } else {
                this.hideTable();
                this.showNoInstancesFound();
            }
        },

        handleTheInstanceStateChange: function (data) {
            if (this.selectedFlowInstanceData.state !== data.state) {
                this.selectedFlowInstanceData.state = data.state;
                this.getEventBus().publish('Instances:selected', data, true);
            }
        },

        setSelectedInstance: function () {
            if (this.selectedFlowInstanceData) {
                var selectedFlowId = this.selectedFlowInstanceData.flowId;
                var selectedFlowInstanceName = this.selectedFlowInstanceData.executionName;
                var noneSelected = true;
                this.table.selectRows(function (row) {
                    var data = row.getData();
                    if (data.flowId === selectedFlowId && data.name === selectedFlowInstanceName) {
                        noneSelected = false;
                        this.handleTheInstanceStateChange(data);
                    }
                    return data.flowId === selectedFlowId && data.name === selectedFlowInstanceName;
                }.bind(this));
                if (noneSelected) {
                    this.getEventBus().publish('Instances:selected', null, false);
                }
            }
        },

        onMyInstancesClick: function () {
            var promise = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve('Adjust checked value of Button');
                }, 100);
            }.bind(this));
            promise.then(function () {
                this.fetchInstances();
                InstanceActionManager.getFlowInstanceActions(this.selectedFlowInstanceData);
            }.bind(this)).catch(function (err) {
                console.log(err);
            });
        },

        setTable: function (columns) {
            if (this.table) {
                this.table.destroy();
            }
            var tableOptions = this.getTableOptions(columns);
            this.table = new Table(tableOptions);
            this.table.addEventHandler('rowselect', this.onTableSelect.bind(this));
            this.table.addEventHandler('sort', this.onTableSort.bind(this));
        },

        onTableSelect: function (instanceRow) {
            setTimeout(function () {
                var data = instanceRow.getData();
                var isSelected = instanceRow._isSelected;

                if (isSelected) {
                    this.selectedFlowInstanceData = {
                        flowId: data.flowId,
                        executionName: data.name,
                        state: data.state,
                        source: data.flowSource
                    };
                } else {
                    this.selectedFlowInstanceData = undefined;
                }

                this.getEventBus().publish('Instances:selected', data, isSelected);
            }.bind(this), 200);
        },

        onTableDblClick: function (instanceRow) {
            ActionManager.redirectToFlowInstanceDetails([instanceRow.getData()]);
        },

        getTableOptions: function (columns) {
            return {
                columns: columns,
                plugins: [
                    new Selection({
                        checkboxes: false,
                        selectableRows: true,
                        multiselect: false
                    }),
                    new RowEvents({
                        events: ["dblclick"]
                    }),
                    new SortableHeader(),
                    new ResizableHeader()
                ],
                modifiers: [{
                    name: 'striped'
                }]
            };
        },

        getDefaultColumns: function () {
            return [
                {
                    title: Dictionary.get('instanceTable.name'),
                    attribute: 'name',
                    sortable: true,
                    resizable: true,
                    disableVisible: true
                },
                {title: Dictionary.get('instanceTable.flow'), attribute: 'flowName', sortable: true, resizable: true},
                {
                    title: Dictionary.get('instanceTable.userTasks'),
                    attribute: 'userTasks',
                    sortable: true,
                    resizable: true,
                    cellType: IconCell
                },
                {title: Dictionary.get('instanceTable.state'), attribute: 'state', sortable: true, resizable: true},
                {
                    title: Dictionary.get('instanceTable.summaryReport'),
                    attribute: 'summaryReport',
                    sortable: true,
                    resizable: true
                },
                {
                    title: Dictionary.get('instanceTable.startTime'),
                    attribute: 'startTime',
                    sortable: true,
                    resizable: true
                },
                {title: Dictionary.get('instanceTable.endTime'), attribute: 'endTime', sortable: true, resizable: true},
                {
                    title: Dictionary.get('instanceTable.duration'),
                    attribute: 'duration',
                    sortable: true,
                    resizable: true,
                    visible: false
                },
                {
                    title: Dictionary.get('instanceTable.startedBy'),
                    attribute: 'startedBy',
                    sortable: true,
                    resizable: true
                },
                {
                    title: Dictionary.get('instanceTable.flowVersion'),
                    attribute: 'flowVersion',
                    sortable: true,
                    resizable: true
                }
            ];
        },

        initializeTableSettings: function () {
            this.tableSettingsButton = new TableSettingsButton({
                header: Dictionary.get('tableSettings.header'),
                context: this.getContext(),
                columns: this.getDefaultColumns(),
                selectDeselectAll: {
                    labels: {
                        select: Dictionary.get('tableSettings.selectLabel'),
                        all: Dictionary.get('tableSettings.allLabel'),
                        none: Dictionary.get('tableSettings.noneLabel')
                    }
                }
            });
            this.tableSettingsButton.addEventHandler('tablesettings:changed', this.onTableSettingsChange.bind(this));
            this.tableSettingsButton.attachTo(this.view.getTableSettings());
            this.table.addEventHandler('sort', this.onTableSort.bind(this));
        },

        generateRowDataForInstance: function (instances) {
            return {
                flowId: instances.flowId ? instances.flowId : '',
                name: instances.name ? instances.name : '',
                flowName: instances.flowName ? instances.flowName : '',
                userTasks: instances.numberActiveUserTasks ? {
                    ebIconClass: 'ebIcon_user_white',
                    text: instances.numberActiveUserTasks
                } : '',
                state: instances.state ? Dictionary.get(instances.state) : '',
                summaryReport: instances.summaryReport ? instances.summaryReport : '',
                startTime: instances.startTime,
                endTime: instances.endTime,
                duration: instances.duration,
                startedBy: instances.executedBy ? instances.executedBy : '',
                flowVersion: instances.flowVersion ? instances.flowVersion : '',
                flowSource: instances.flowSource
            };
        },

        transformDataForTable: function (instances) {
            this.tableData = [];
            this.stats.clearStats();
            instances.forEach(function (instance) {
                var row = this.generateRowDataForInstance(instance);
                this.tableData.push(row);
                this.stats.incrementStats(row);
            }.bind(this));
            return this.tableData;
        },

        loadTable: function (instances) {
            if (this.serverError) {
                this.serverError.destroy();
                this.serverError = null;
                this.table.addEventHandler('rowselect', this.onTableSelect.bind(this));
                this.table.addEventHandler('sort', this.onTableSort.bind(this));
            }
            this.destroyNoInstancesNotification();
            this.view.hideNoInstancesFound();
            this.view.showTable();
            if (this.sortParams) {
                instances = this.getSortedData(this.sortParams.mode, this.sortParams.column, instances);
            }
            this.instances = instances;
            this.tableData = this.transformDataForTable(instances);
            this.stats.updateStats();
            this.table.setData(this.tableData);
            if (this.tableSettingsButton) {
                this.tableSettingsButton.enableButton();
                this.view.showMyInstances();
                this.view.showStatsHolder();
            }
            this.table.attachTo(this.view.getTableHolder());
        },

        hideTable: function () {
            this.view.hideTable();
        },

        onTableSettingsChange: function (columns) {
            this.setTable(columns);
            this.fetchInstances();
        },

        /**
         * SORTING METHODS
         */
        onTableSort: function (mode, attribute) {
            this.mode = mode;
            this.attribute = attribute;
            // When sorting the table, column names and variable names from the rest response do not always match.
            if (attribute === 'userTasks') {
                this.attribute = 'numberActiveUserTasks';
            } else if (attribute === 'startedBy') {
                this.attribute = 'executedBy';
            }
            this.sortParams = {
                mode: this.mode,
                column: this.attribute
            };
            this.fetchInstances();
        },

        getSortedData: function (mode, attribute, flow) {
            var sortOrder = mode === 'asc' ? 1 : -1;

            return flow.sort(function (flow1, flow2) {
                if (flow1[attribute] === null) {
                    flow1[attribute] = '';
                }
                if (flow2[attribute] === null) {
                    flow2[attribute] = '';
                }
                if (typeof flow1[attribute] !== 'object' && typeof flow2[attribute] !== 'object') {
                    return (flow1[attribute] ? flow1[attribute].toString() : '')
                        .localeCompare((flow2[attribute] ? flow2[attribute].toString() : '')) * sortOrder;
                } else {
                    return (flow1[attribute].text ? flow1[attribute].text.toString() : '')
                        .localeCompare((flow2[attribute].text ? flow2[attribute].text.toString() : '')) * sortOrder;
                }
            });
        },

        /**
         * NOTIFICATION METHODS
         */
        showNoInstancesFound: function () {
            this.destroyNoInstancesNotification();
            this.getNewInlineMsg(Dictionary.get('instanceWarnings.noInstancesForFlow'));
            this.tableSettingsButton.disableButton();
            this.stats.clearStats();
            this.noInstancesFound.attachTo(this.view.getNoInstancesFound());
            this.view.showNoInstancesFound();
        },

        setFetchInstanceError: function (error, response) {
            if (this.table) {
                this.table.destroy();
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
                    container.getEventBus().publish('container:loader-hide');
                    this.serverError = ErrorHandler.inlineErrorMessage(errorBody);
                    this.serverError.attachTo(this.view.getTableHolder());
                    this.stats.setStatsToUnknown();
            }
        },

        destroyNoInstancesNotification: function () {
            if (this.noInstancesFound) {
                this.noInstancesFound.destroy();
            }
        },

        getNewInlineMsg: function (header) {
            this.noInstancesFound = new InlineMessage({
                header: header,
                icon: 'infoMsgIndicator'
            });
        },

        /**
         * UTILITY METHODS FOR POLLING
         */
        setUpPolling: function () {
            this.refreshAll = setInterval(function () {
                this.fetchInstances();
            }.bind(this), 10000);
        },

        leavingInstances: function () {
            this.view.setMyInstancesToChecked();
            clearInterval(this.refreshAll);
            this.refreshAll = null;
        },

        resumingInstances: function (name) {
            this.selectedFlowInstanceData = undefined;
            this.fetchInstances();
            if (!this.refreshAll) {
                this.setUpPolling();
            }
        }
    });
});
