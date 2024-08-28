/*global define*/
define([
    'jscore/core',
    './EventFilterView',
    'i18n!flow-instance-details/dictionary.json',
    "widgets/PopupDatePicker",
    'widgets/Button',
    'container/api'
], function (core, View, dictionary, PopupDatePicker, Button, container) {
    'use strict';

    return core.Widget.extend({

        init: function (options) {
            this.eventBus = options.eventBus;
            this.startDate = options.startDate;
            this.endDate = options.endDate;
            this.severities = options.severities;
            this.message = options.message;
            this.resource = options.resource;
        },

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this._createStartDatePopupDataPicker();
            this._createEndDatePopupDataPicker();
            this._createApplyButton();
            this._createCancelButton();
            this._setSelectedFilter();
        },

        onDestroy: function () {
            this.startDateTime.destroy();
            this.endDateTime.destroy();
            this.cancelButton.destroy();
            this.applyButton.destroy();
        },

        //------------------------------------------ Private functions ---------------------------------

        _setSelectedFilter: function () {
            this.view.checkCheckBox(this.severities);
            this.view.setMessage(this.message);
            this.view.setResource(this.resource);
        },

        _createApplyButton: function () {
            this.applyButton = new Button({
                caption: dictionary.get("events.filter.apply"),
                modifiers: [{
                    name: 'color',
                    value: 'darkBlue'
                }]
            });

            this.applyButton.attachTo(this.view.getApplyButton());

            this.applyButton.addEventHandler("click", function () {

                this.eventBus.publish('EventTable:updateFilter', {
                    severities: this.view.getSeverities(),
                    message: this.view.getMessageValue(),
                    resource: this.view.getResourceValue(),
                    startDate: this.startDateTime.getValue(),
                    endDate: this.endDateTime.getValue()
                });
                container.getEventBus().publish('flyout:hide', true);
            }.bind(this));
        },

        _createCancelButton: function () {
            this.cancelButton = new Button({
                caption: dictionary.get("events.filter.cancel"),
                modifiers: [{
                    name: 'color',
                    value: 'grey'
                }]
            });

            this.cancelButton.attachTo(this.view.getCancelButton());

            this.cancelButton.addEventHandler("click", function () {
                container.getEventBus().publish('flyout:hide', true);
            });
        },

        _createStartDatePopupDataPicker: function () {
            this.startDateTime = new PopupDatePicker({
                compact: false,
                showTime: true,
                utc: true,
                placeholder: dictionary.get("events.startTime")
            });

            this.startDateTime.attachTo(this.view.getStartDateTime());

            this.startDateTime.setValue(this.startDate);
        },

        _createEndDatePopupDataPicker: function () {
            this.endDateTime = new PopupDatePicker({
                compact: false,
                showTime: true,
                utc:true,
                placeholder: dictionary.get("events.endTime")
            });

            this.endDateTime.attachTo(this.view.getEndDateTime());

            this.endDateTime.setValue(this.endDate);
        },

        //------------------------------------------ Overridden functions from FlyOut ---------------------------------
        onShow: function () {
            // clear?
        },

        onHide: function () {
            this.destroy();
        }
    });
});
