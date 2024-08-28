define([
    'jscore/core',
    './EventSeveritiesSelectorView',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, dictionary) {
    'use strict';

    var severities = {
        INFO: {title: "info", color: "ebBgColor_paleBlue", status: false},
        WARNING: {title: "warning", color: "ebBgColor_yellow", status: false},
        ERROR: {title: "error", color: "ebBgColor_red", status: false}
    };

    return core.Widget.extend({

        init: function (options) {
            this.eventBus = options.eventBus;
        },

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            Object.keys(severities).forEach(function (severity) {
                this._onClick(severities[severity]);
            }.bind(this));
        },

        onDestroy: function () {
        },

        // ------------------------------------ Public functions -------------------------------------------

        setSeverities: function (listSeverities) {

            Object.keys(severities).forEach(function (severity) {
                if (severities[severity].status) {
                    this._unselectSeverity(severities[severity]);
                }
            }.bind(this));

            listSeverities.forEach(function (severity) {
                this._selectSeverity(severities[severity]);
            }.bind(this));

        },

        // ------------------------------------ Private functions -------------------------------------------

        _selectSeverity: function (severity) {
            severity.status = true;
            this._shiftSelectionSeverity(severity);
        },

        _unselectSeverity: function (severity) {
            severity.status = false;
            this._shiftSelectionSeverity(severity);
        },

        _shiftSelectionSeverity: function (severity) {
            this.view.setBackground(severity.title, severity.status ? severity.color : "");
            this.view.shiftIconVisibility(severity.title);
        },

        _onClick: function (severity) {
            this.view.getItem(severity.title).addEventHandler("click", function () {
                severity.status = !severity.status;
                this._shiftSelectionSeverity(severity);
                this.eventBus.publish('EventTable:eventSeveritySelector', severity.title.toUpperCase(), severity.status);
            }.bind(this));
        }
    });
});