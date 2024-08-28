/*global define*/
define([
    'jscore/core',
    'jscore/ext/net',
    'tablelib/Table',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/Selection',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/FixedHeader',
    './FlowListView',
    'i18n!flow-catalog/dictionary.json',
    'flow-automation-lib/services/Notifications',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/messageUtils',
    '../../ext/ActionManager',
    'widgets/InlineMessage',
    'container/api',
    'flow-automation-lib/helper/promisify'
], function (core, net, Table, RowEvents, Selection, SortableHeader, ResizableHeader, FixedHeader, View, dictionary, Notifications, ErrorHandler, messageUtils, ActionManager, InlineMessage, container, promisify) {
    'use strict';

    var defaultColumns = [{
        title: dictionary.get('flow.name'),
        attribute: 'name',
        sortable: true,
        resizable: true,
        disableVisible: true
    },

        {
            title: dictionary.get('flow.description'),
            attribute: 'description',
            resizable: true,
            sortable: true
        },
        {

            title: dictionary.get('flow.version'),
            attribute: 'version',
            resizable: true
        },
        {

            title: dictionary.get('flow.importedBy'),
            attribute: 'importedBy',
            sortable: true,
            resizable: true
        }
    ];

    var defaultSortColumn = "name",
        defaultSortOrder = "asc";

    return core.Widget.extend({

        init: function () {
            this.flowListData = [];
        },

        view: function () {
            return new View({
                header: dictionary.get('table.header')
            });
        },

        onViewReady: function () {
            this.setTable(defaultColumns);
        },

        clearSelection: function () {
            this.table.unselectAllRows();
        },

        onTableSelect: function (flowRow, selected) {
            var flowData = {
                flow: flowRow.getData(),
                selected: selected
            };
            this.selectedFlowData = flowData.flow;
            ActionManager.setSelectedFlowData(this.selectedFlowData);
            ActionManager.setExecuteHeader(this.selectedFlowData.name);
            ActionManager.setFlowId(flowData.flow.id);

            this.getUserPermissions(flowData.flow.id).then(function (userPermission) {
                    flowData.flow.userPermission = userPermission;
                    this.trigger('flow:selected', flowData);
                }.bind(this),
                function () {
                    this.trigger('flow:selected', flowData);
                }.bind(this));
        },

        onDestroy: function () {
            this.table.destroy();
        },

        fetchFlows: function () {
            net.ajax({
                url: '/flowautomation/v1/flows',
                type: 'GET',
                dataType: 'json',
                success: this.flowFetchSuccess.bind(this),
                error: this.flowFetchError.bind(this)
            });
        },

        flowFetchSuccess: function (flows) {
            container.getEventBus().publish('container:loader-hide');
            if (!flows || flows.length === 0) {
                this.table.destroy();
                if (!this.noFlowFoundMessage) {
                    this.noFlowFoundMessage = this.createNoFlowsFoundInlineMessage(dictionary.get('flow.noFlowsFoundDescription'));
                    this.noFlowFoundMessage.attachTo(this.view.getInfoMsgHolder());
                }
                this.trigger('flows:none', 0);
                return;
            }

            this.flowListData = flows.map(function (flow) {
                var flowVersion = flow.flowVersions.find(function (version) {
                    return version.active === true;
                });

                if (!flowVersion) {
                    flowVersion = flow.flowVersions[0];
                }

                return Object.assign({}, flow, {
                    "description": flowVersion.description,
                    "version": flowVersion.version,
                    "importedBy": flowVersion.createdBy
                });
            });

            if (this.selectedFlowData) {
                var selectedFlowId = this.selectedFlowData.id;
                this.selectedFlowData = flows.find(function (flw) {
                    return flw.id === selectedFlowId;
                });
            }

            this.table.setData(this.getSortedData(defaultSortOrder, defaultSortColumn, this.flowListData));
            this.table.setSortIcon(defaultSortOrder, defaultSortColumn);
            this.trigger('flows:loaded', this.table.getData().length);
        },

        flowFetchError: function (error, response) {
            var flowMsg = "Flow Fetch Error";
            this.setFlowError(error, response, flowMsg);
        },

        handleDefaultError: function (errorCode, errorBody) {
            var inlineMsg;
            this.table.destroy();
            this.view.hideFooter();
            this.trigger('flows:hideNoFlowSummary');
            container.getEventBus().publish('container:loader-hide');

            inlineMsg = ErrorHandler.inlineErrorMessage(errorBody);
            inlineMsg.attachTo(this.view.getInfoMsgHolder());
            this.trigger('flows:fetchError', errorCode);
        },

        refreshTable: function (newFlows, isFilterReset) {
            if (isFilterReset) {
                this.filteredFlowList = undefined;
                this.setSortedFlows(newFlows);
            } else {
                this.filteredFlowList = newFlows;
                this.setSortedFlows(this.filteredFlowList);
            }
        },

        setSortedFlows: function (flows) {
            if (this.sortParams) {
                this.table.setData(this.getSortedData(this.sortParams.mode, this.sortParams.column, flows));
            } else {
                this.table.setData(flows);
            }
        },

        getUserPermissions: function (flowId) {
            return promisify.ajax({
                url: '/flowautomation/v1/flows/' + flowId + '/user-permissions',
                type: 'GET',
                dataType: 'json',
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                throw response;
            });
        },

        getFlows: function () {
            return this.flowListData;
        },

        setFlowStatus: function () {

            net.ajax({
                url: '/flowautomation/v1/flows/' + this.selectedFlowData.id + '/enable',
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                success: this.setFlowStatusSuccess.bind(this),
                error: this.setFlowStatusError.bind(this),
                data: JSON.stringify({
                    value: this.selectedFlowData.status !== 'enabled'
                })
            });
        },

        setFlowStatusSuccess: function () {
            this.trigger('flow:statusChangeSuccess');

            var selectedFlowId = this.selectedFlowData.id;
            var enabled = this.selectedFlowData.enabled;

            if (this.filteredFlowList) {
                this.filteredFlowList.forEach(function (flow) {
                    if (flow.id === selectedFlowId) {
                        flow.enabled = !enabled;
                        return;
                    }
                });
                this.table.setData(this.filteredFlowList);
            } else {
                this.flowListData.forEach(function (flow) {
                    if (flow.id === selectedFlowId) {
                        flow.enabled = !enabled;
                        return;
                    }
                });
                this.table.setData(this.flowListData);
            }

            this.table.selectRows(function (row) {
                return row.getData().id === selectedFlowId;
            });

            var notification = (this.selectedFlowData.status === 'enabled') ? Notifications.success(dictionary.flow.enableSuccessMessage) : Notifications.success(dictionary.flow.disableSuccessMessage);
            notification.attachTo(this.getElement());
            this.table.trigger('rowselect', this.table.getSelectedRows()[0], true);
        },

        setFlowStatusError: function (error, response) {
            var flowMsg = "Flow Status Error";
            var errorMessage = (this.selectedFlowData.status === 'enabled') ? dictionary.flow.disableFailureMessage : dictionary.flow.enableFailureMessage;
            this.setFlowError(error, response, flowMsg, errorMessage);
        },

        setFlowError: function (error, response, flowMsg, errorMessage) {
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
                    if (flowMsg === "Flow Status Error") {
                        ErrorHandler.flowStatus(errorBody, errorMessage);
                    } else if (flowMsg === "Flow Fetch Error") {
                        this.handleDefaultError(errorCode, errorBody);
                    }
            }
        },

        setTable: function (columns) {
            if (this.table) {
                this.table.destroy();
            }
            if (!columns) {
                columns = defaultColumns;
            }
            var tableOptions = {
                header: dictionary.get('table.header'),
                columns: columns,
                plugins: [
                    new Selection({
                        selectableRows: true
                    }),
                    new RowEvents({
                        events: ['contextmenu']
                    }),
                    new SortableHeader(),
                    new ResizableHeader(),
                    new FixedHeader()
                ],
                modifiers: [{
                    name: 'striped'
                }]
            };

            var table = new Table(tableOptions);
            table.addEventHandler('rowselect', this.onTableSelect.bind(this));
            table.addEventHandler('sort', this.onTableSort.bind(this));
            this.table = table;
            this.fetchFlows();

            if (this.noFlowFoundMessage) {
                this.noFlowFoundMessage.destroy();
            }

            table.attachTo(this.view.getTable());
            this.contextMenuEvtHandler();

        },

        createNoFlowsFoundInlineMessage: function (header) {
            return new InlineMessage({
                header: header,
                icon: 'infoMsgIndicator'
            });
        },

        selectRowWhenRightClicked: function (row) {
            ActionManager.setFlowId(row.getData().id);
            this.selectedFlowData = row.options.model;
            this.selectedFlowData.selected = true;
        },

        contextMenuEvtHandler: function () {
            this.table.addEventHandler("rowevents:contextmenu", function (row, e) {
                this.table.unselectAllRows();
                this.selectRowWhenRightClicked(row);
                this.table.selectRows(function (r) {
                    return (r === row);
                });

                this.table.trigger('rowselect', row, true);
                container.getEventBus().publish('contextmenu:show', e, function () {
                    return new Promise(function (resolve, reject) {
                        this.getUserPermissions(row.options.model.id).then(
                            this.publishActions.bind(this, row.getData(), resolve, reject),
                            this.publishActions.bind(this, row.getData(), resolve, reject, {
                                "execute": {
                                    "strategy": "reject",
                                    "permission": false
                                }
                            })
                        );
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        publishActions: function (flowData, resolve, reject, userPermission) {
            flowData.userPermission = userPermission;
            ActionManager.setSelectedFlowData(flowData);
            var actions = ActionManager.getFlowActionsBySource();
            if (actions && actions.length > 0) {
                resolve(actions);
            } else {
                reject();
            }
        },


        onTableSort: function (mode, attribute) {
            this.sortParams = {
                mode: mode,
                column: attribute
            };

            if (this.filteredFlowList) {
                this.table.setData(this.getSortedData(mode, attribute, this.filteredFlowList));
            } else {
                this.table.setData(this.getSortedData(mode, attribute, this.flowListData));
            }
            var selectedIds = this.table.getSelectedIds();
            this.table.addSelectedIds(selectedIds);
        },

        getSortedData: function (mode, attribute, flow) {
            var sortOrder = mode === 'asc' ? 1 : -1;

            return flow.sort(function (flow1, flow2) {
                return flow1[attribute].localeCompare(flow2[attribute]) * sortOrder;
            });
        },

        getDefaultColumns: function () {
            return defaultColumns;
        },

        applyTableSettings: function (columns) {
            this.setTable(columns);

            if (this.filteredFlowList) {
                this.table.setData(this.filteredFlowList);
            } else {
                this.table.setData(this.flowListData);
            }

            if (this.selectedFlowData) {
                this.table.addSelectedIds(this.selectedFlowData.id);
            }

            var notification = Notifications.success(dictionary.tableSettings.successMessage);
            notification.attachTo(this.getElement());
        }
    });
});
