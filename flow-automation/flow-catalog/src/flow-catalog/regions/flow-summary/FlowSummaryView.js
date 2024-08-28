define([
    'jscore/core',
    'template!./_flowSummary.hbs',
    'styles!./_flowSummary.less',
], function (core, template, styles) {
    'use strict';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getEmptySummary: function () {
            return this.getElement().find('.eaFlowCatalog-FlowSummary-empty');
        },

        showSummary: function () {
            this.showSummaryContent();
            this.hideSummaryEmpty();
        },

        hideSummary: function () {
            this.hideSummaryContent();
            this.showSummaryEmpty();
        },

        getSummaryContent: function () {
            return this.getElement().find('.eaFlowCatalog-rFlowSummary-content');
        },

        hideSummaryContent: function () {
            this.getSummaryContent().setModifier('hidden');
        },

        showSummaryContent: function () {
            this.getSummaryContent().removeModifier('hidden');
        },

        getSummaryEmpty: function () {
            return this.getElement().find('.eaFlowCatalog-rFlowSummary-empty');
        },

        hideSummaryEmpty: function () {
            this.getSummaryEmpty().setModifier('hidden');
        },

        showSummaryEmpty: function () {
            this.getSummaryEmpty().removeModifier('hidden');
        },

        setFlowVersion: function (text) {
            this.getFlowVersion().setText(text);
        },

        getFlowVersion: function () {
            return this.getElement().find('.eaFlowCatalog-rFlowSummary-content-flowVersion-content');
        },

        setFlowName: function (text) {
            this.getFlowName().setText(text);
        },

        getFlowName: function () {
            return this.getElement().find('.eaFlowCatalog-rFlowSummary-content-flowName-label');
        },

        setFlowDescription: function (text) {
            this.getFlowDescription().setText(text);
        },

        getFlowDescription: function () {
            return this.getElement().find('.eaFlowCatalog-rFlowSummary-content-flowDescription-content');
        }
    });
});