define([
    'jscore/core',
    'jscore/ext/net',
    './FlowSummaryView',
    'widgets/SelectBox',
    'i18n!flow-catalog/dictionary.json',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/messageUtils',
    'widgets/InlineMessage'
], function (core, net, View, SelectBox, dictionary, Dialog, messageUtils, InlineMessage) {
    'use strict';

    return core.Region.extend({
        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this.view.hideSummary();
            this.setInlineMsg(dictionary.get('summary.noFlowAvailable'), dictionary.get('summary.noFlowToView'));
        },

        onStart: function () {
            this.getEventBus().subscribe('mainflow:selected', this.onFlowSelect, this);
            this.getEventBus().subscribe('mainflow:selectionCleared', this.onClearSelection, this);
            this.getEventBus().subscribe('mainflow:flowloaded', this.onFlowLoad, this);
            this.getEventBus().subscribe('mainflow:flowloadedError', this.onFlowLoadError, this);
            this.getEventBus().subscribe('mainflow:hideNoFlowSummary', this.destroyInlineMsg, this);
        },

        onFlowSelect: function (flowSummary) {
            if (!flowSummary.selected) {
                this.view.hideSummary();
                this.setInlineMsg(dictionary.get('summary.noFlowSelected'), dictionary.get('summary.selectFlow'));
            } else {
                this.setSummary(flowSummary);
                this.view.showSummary();
            }
        },

        setSummary: function (flowSummary) {
            this.view.setFlowName(flowSummary.flow.name);
            var flowVersion = flowSummary.flow.flowVersions.find(function (version) {
                return version.active === true;
            });

            this.view.setFlowDescription(flowVersion.description);
            this.view.setFlowVersion(flowVersion.version);
        },

        onClearSelection: function () {
            this.view.hideSummary();
        },

        onFlowLoad: function (flowCount) {
            this.view.hideSummary();
            if (flowCount > 0) {
                this.setInlineMsg(dictionary.get('summary.noFlowSelected'), dictionary.get('summary.selectFlow'));
            } else {
                this.setInlineMsg(dictionary.get('summary.noFlowAvailable'), dictionary.get('summary.noFlowToView'));
            }
        },

        onFlowLoadError: function (errorCode) {
            this.view.hideSummary();
            this.noFlowSelected.destroy();
            if (!(errorCode === 401 || errorCode === 404)) {
                this.setErrorInlineMsg(dictionary.get('summary.flowSummaryErrorHeader'), dictionary.get('summary.flowSummaryErrorContent'));
            }
        },

        getErrorInlineMsg: function (header, description) {
            this.destroyErrorInlineMsg();
            this.errorInlineMsg = new InlineMessage({
                header: header,
                description: description,
                icon: 'error'
            });
        },

        setErrorInlineMsg: function (header, description) {
            this.getErrorInlineMsg(header, description);
            this.errorInlineMsg.attachTo(this.view.getSummaryEmpty());
        },

        destroyErrorInlineMsg: function () {
            if (this.errorInlineMsg) {
                this.errorInlineMsg.destroy();
            }
        },

        getNewInlineMsg: function (header, description) {
            this.destroyInlineMsg();
            this.noFlowSelected = new InlineMessage({
                header: header,
                description: description,
                icon: 'infoMsgIndicator'
            });
        },

        setInlineMsg: function (header, description) {
            this.getNewInlineMsg(header, description);
            this.noFlowSelected.attachTo(this.view.getSummaryEmpty());
        },

        destroyInlineMsg: function () {
            if (this.noFlowSelected) {
                this.noFlowSelected.destroy();
            }
        }
    });
});