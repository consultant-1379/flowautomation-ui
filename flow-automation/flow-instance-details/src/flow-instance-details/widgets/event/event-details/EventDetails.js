/*global define*/
define([
    'jscore/core',
    './EventDetailsView',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        init: function (options) {
            this.event = options.event;
            this.eventBus = options.eventBus;
        },

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this.view.setTime(this.event.eventTime);
            this.view.setDetails(this.event.eventData);
            this.view.setSeverity(this.event.severity);
            this.view.setTarget(this.event.target);
            this.view.setSynopsis(this.event.message);
        },

        //------------------------------------------ Overridden functions from FlyOut ---------------------------------
        onShow: function () {
            this.view.setMarginLeftMain(true); // remove margin left
            document.getElementsByClassName("eaFlyout-panelHeader").item(0).style = "display: none";
        },

        onHide: function () {
            //Timeout is required here as the flyout will detach its content after this function is called.
            setTimeout(function () {
                document.getElementsByClassName("eaFlyout-panelHeader").item(0).style = "display: block";
                this.view.setMarginLeftMain(false); // add margin left
                this.eventBus.publish('EventTab:closeFlyOut', true);
            }.bind(this), 200);
        }
    });
});
