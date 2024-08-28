define([
    'jscore/core',
    'template!./_main.hbs',
    'styles!./_main.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getFlowList: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-flowList');
        },

        getEmptySummary: function () {
            return this.getElement().find('.eaFlowCatalog-FlowSummary-empty');
        },

        getTitleAndFiltersEl: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters');
        },

        getFilterSelection: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-filters');
        },

        getTableSettings: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-tableSettings');
        },

        showTitleAndFilters: function () {
            this.getTitleAndFiltersEl().removeModifier('hidden');
        },

        hideTitleAndFilters: function () {
            this.getTitleAndFiltersEl().setModifier('hidden');
        },

        hideFilterAndSettings: function () {
            this.getFilterSelection().setStyle('display', 'none');
            this.getTableSettings().setStyle('display', 'none');
        },

        showFilterAndSettings: function () {
            this.getFilterSelection().removeStyle('display');
            this.getTableSettings().removeStyle('display');
        },

        setPaddingOnFlowListWhenNoFlowsImported: function () {
            this.getFlowList().setStyle('padding-top', '9px');
        },

        setPaddingOnFlowListWhenFetchFlowsError: function () {
            this.getFlowList().setStyle('padding-top', '39px');
        },

        getTable: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-flowList');
        },

        hideTable: function () {
            this.getTable().setModifier('hidden');
        },

        showTable: function () {
            this.getTable().removeModifier('hidden');
        },

        getFlowCountEl: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-title-flows-count');
        },

        setNumberOfflows: function (text) {
            this.getFlowCountEl().setText(text);
        },

        getSelectedCountEl: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-title-selected-count');
        },

        setNumberOfSelected: function (text) {
            this.getSelectedCountEl().setText(text);
        },

        getSelectedEl: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-title-selected');
        },

        hideSelected: function () {
            this.getSelectedEl().setModifier('hidden');
        },

        showSelected: function () {
            this.getSelectedEl().removeModifier('hidden');
        },

        getClearSelection: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-title-selected-clearSelection');
        },

        showClearSelectionLink: function () {
            this.getClearSelection().removeModifier('hidden');
        },

        hideClearSelectionLink: function () {
            this.getClearSelection().setModifier('hidden');
        },

        getClearSelectionLink: function () {
            return this.getElement().find('.eaFlowCatalog-rMain-titleAndFilters-title-selected-clearSelection-link');
        }
    });

});