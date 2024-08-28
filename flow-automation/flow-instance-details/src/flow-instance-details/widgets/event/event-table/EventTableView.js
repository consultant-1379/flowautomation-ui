/*global define*/
define([
    'jscore/core',
    'template!./_eventTable.hbs',
    'styles!./_eventTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFlowInstanceDetails-wEventTable';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getHeader: function () {
            return this.getElement().find(__prefix + '-header-section-title');
        },

        getTable: function () {
            return this.getElement().find(__prefix + '-table');
        },

        getLoader: function() {
            return this.getElement().find(__prefix + '-loader');
        },

        hiddenEventTable: function() {
            this.getElement().find(__prefix + '-header').setStyle("visibility", "hidden");
            this.getTable().setStyle("visibility", "hidden");
        },

        showEventTable: function() {
            this.getElement().find(__prefix + '-header').setStyle("visibility", "visible");
            this.getTable().setStyle("visibility", "visible");
            this.getLoader().setStyle("display", "none");
        },

        isMobileSize: function () {
            return window.matchMedia("(max-width: 852px)").matches;
        },

        setNumberOfEvents: function (number) {
            this.getElement().find(__prefix + '-header-section-title-count').setText(number);
        },

        getStartDateTimeSelector: function () {
            return this.getElement().find(__prefix + '-startDateTime-selector');
        },

        getEndDateTimeSelector: function () {
            return this.getElement().find(__prefix + '-endDateTime-selector');
        },

        getFlyOutButton: function () {
            return this.getElement().find(__prefix + '-flyOut-button');
        },

        getRefreshButton: function () {
            return this.getElement().find(__prefix + '-refresh-button');
        },

        getSeverityIcon: function () {
            return this.getElement().find(__prefix + '-severities-selector');
        },

        showClearSelectionLink: function () {
            this.getElement().find(__prefix + "-header-section-title-separator").removeModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-selected-label").removeModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-clearSelection-separator").removeModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-clearSelection-link").removeModifier('hidden');
        },

        hideClearSelectionLink: function () {
            this.getElement().find(__prefix + "-header-section-title-separator").setModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-selected-label").setModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-clearSelection-separator").setModifier('hidden');
            this.getElement().find(__prefix + "-header-section-title-clearSelection-link").setModifier('hidden');
        },

        getClearSelectionLink: function () {
            return this.getElement().find(__prefix + '-header-section-title-clearSelection-link');
        },

        setLastRefreshed: function (text) {
            this.getElement().find(__prefix + '-refresh-refreshedTime').setText(text);
        }

    });
});
