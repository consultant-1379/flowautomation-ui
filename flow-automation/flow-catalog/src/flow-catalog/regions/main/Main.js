define([
    'jscore/core',
    './MainView',
    '../../widgets/flow-list/FlowList',
    '../../widgets/top-panel/TopPanel',
    '../../widgets/fileselector/FileSelector',
    'flow-automation-lib/table-settings-button/TableSettingsButton',
    './TopPanelActionManager',
    'flow-automation-lib/services/messageUtils',
    'i18n!flow-catalog/dictionary.json',
    'i18n/number',
    'flow-automation-lib/services/Notifications'
], function (core, View, FlowList, TopPanel, FileSelector, TableSettingsButton, TopPanelActionManager, messageUtils, dictionary, number, Notifications) {
    'use strict';

    return core.Region.extend({

        view: function () {
            return new View({dictionary: dictionary});
        },

        onStart: function () {
            this.eventBus = this.getEventBus();
            this.flowList.addEventHandler('flow:selected', this.onFlowSelect, this);
            this.flowList.addEventHandler('flow:statusChangeSuccess', this.onFlowStatusChangeSuccess, this);
            this.eventBus.subscribe('flow:importedSuccess', this.onFlowImportSuccess, this);
            this.eventBus.subscribe('flow:startedSuccess', this.onFlowStartSuccess, this);
            this.eventBus.subscribe('FlowAutomation:ResumingApp', this.onResumePage, this);
            this.eventBus.subscribe('FlowAutomation:appVisible', this.onResumeVisibility, this);
            //top panel events
            this.TopPanel.addEventHandler('flowFilter:changed', this.onTopPanelStateChange, this);
            this.tableSettingsButton.addEventHandler('tablesettings:changed', this.onTableSettingsChange, this);
            this.eventBus.subscribe('mainflow:selectionCleared', this.hideHeaderSelectionInfo, this);

            //Topsection context actions
            this.eventBus.subscribe('topsectionactions:flowstatuschanged', this.onFlowStatusChange, this);
            this.flowList.attachTo(this.view.getFlowList());
        },

        onViewReady: function () {
            this.flowList = new FlowList();
            this.flowList.addEventHandler('flows:loaded', this.onFlowLoad, this);
            this.flowList.addEventHandler('flows:fetchError', this.onFlowLoadError, this);
            this.flowList.addEventHandler('flows:none', this.onNoFlowImported, this);
            this.flowList.addEventHandler('flows:hideNoFlowSummary', this.hideNoFlowSummary, this);
            this.initializeTopSection();
            this.initializeTableSettings();
        },

        onTableSettingsChange: function (columns) {
            this.flowList.applyTableSettings(columns);
        },

        onResumeVisibility: function () {
            this.flowList.fetchFlows();
        },

        initializeTopSection: function () {
            this.TopPanel = new TopPanel();
            this.TopPanel.attachTo(this.view.getFilterSelection());
        },

        initializeTableSettings: function () {
            this.tableSettingsButton = new TableSettingsButton({
                header: dictionary.tableSettings.header,
                context: this.getContext(),
                columns: this.flowList.getDefaultColumns(),
                selectDeselectAll: {
                    labels: {
                        select: dictionary.tableSettings.selectLabel,
                        all: dictionary.tableSettings.allLabel,
                        none: dictionary.tableSettings.noneLabel
                    }
                }
            });

            this.tableSettingsButton.attachTo(this.view.getTableSettings());
        },

        onFlowSelect: function (flow) {
            this.eventBus.publish('mainflow:selected', flow);

            if (flow.selected) {
                this.view.setNumberOfSelected(1);
                this.view.showClearSelectionLink();
                this.view.showSelected();
            } else {
                this.hideHeaderSelectionInfo();
            }

            this.view.getClearSelectionLink().addEventHandler('click', this.onClearSelection, this);
        },

        onFlowImportSuccess: function () {
            var notification;
            notification = Notifications.success(dictionary.import.successMessage);
            notification.attachTo(this.getElement());
            this.flowList.setTable();
        },

        onFlowStartSuccess: function (data) {
           this.getEventBus().publish('FlowInstances:newInstance',data);
        },

        onFlowLoad: function (flowCount) {
            this.eventBus.publish('mainflow:flowloaded', flowCount);
            this.view.setNumberOfflows(number(flowCount).format('0,0'));
            this.view.showTitleAndFilters();
            this.view.showFilterAndSettings();
            this.TopPanel.clearTextBoxFilter();
        },

        onFlowLoadError: function (errorCode) {
            this.eventBus.publish('mainflow:flowloadedError', errorCode);
            this.view.setPaddingOnFlowListWhenFetchFlowsError();
        },

        hideNoFlowSummary: function () {
            this.eventBus.publish('mainflow:hideNoFlowSummary');
        },

        onNoFlowImported: function (flowCount) {
            this.view.setNumberOfflows(number(flowCount).format('0,0'));
            this.view.showTitleAndFilters();
            this.view.hideFilterAndSettings();
            this.view.setPaddingOnFlowListWhenNoFlowsImported();
        },

        onClearSelection: function () {
            this.flowList.clearSelection();
            this.hideHeaderSelectionInfo();
            this.eventBus.publish('mainflow:selectionCleared');

            this.TopPanel.clearTextBoxFilter();
            this.flowList.refreshTable(this.flowList.getFlows(), true);
        },

        // Top Panel event handlers
        onTopPanelStateChange: function (topPanelState) {
            var isFilterReset = false;
            var currentFlows = this.flowList.getFlows();

            if (topPanelState.nameFilter.trim() === '') {
                isFilterReset = true;
            }
            var filteredFlows = TopPanelActionManager.HandleStateChange(topPanelState, currentFlows);

            this.flowList.refreshTable(filteredFlows, isFilterReset);
            // reset the state of Topsection buttons as well as clear the summary view

            this.eventBus.publish('mainflow:selectionCleared');

        },

        hideHeaderSelectionInfo: function () {
            this.eventBus.publish('topsection:leavecontext');
            this.view.hideSelected();
            this.view.hideClearSelectionLink();
        },

        onFlowStatusChange: function () {
            this.flowList.setFlowStatus();
        },

        onFlowStatusChangeSuccess: function () {
            this.eventBus.publish('mainflow:flowStatusChangedSuccess');
        },

        onResumePage: function () {
            this.onClearSelection();
            this.flowList.fetchFlows();
        }
    });
});