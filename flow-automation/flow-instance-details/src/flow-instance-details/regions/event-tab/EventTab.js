/*global define*/
define([
    'jscore/core',
    'jscore/ext/net',
    './EventTabView',
    'container/api',
    'i18n!flow-instance-details/dictionary.json',
    '../../widgets/event/event-details/EventDetails',
    '../../widgets/event/event-table/EventTable',
    'widgets/InlineMessage',
    '../../ext/utils/UriInfo'
], function (core, net, View, container, dictionary, EventDetails, EventTable, InlineMessage, UriInfo) {
    'use strict';

    var isFlyoutShown = false;
    var resizeTimeout;

    return core.Region.extend({

        view: new View(),

        refresh: function () {
            if (this.noEventMessage) {
                this.noEventMessage.destroy();
            }
            this._initializeTable();
        },

        onViewReady: function () {
            this.view.hiddenEventDetails();
            window.addEventListener("resize", this._resizeThrottler.bind(this));
        },

        onStart: function () {
            this.closeFlyOutSubscriber = this.getEventBus().subscribe('EventTab:closeFlyOut', this._closeEventDetails, this);
            this.eventDetailsSubscriber = this.getEventBus().subscribe('EventTab:eventDetails', this._updateEventDetails, this);
            this.dataSubscriber = this.getEventBus().subscribe('EventTab:eventFetch', this._updateEvent, this);
            this.closeEventDetailsSubscriber = this.getEventBus().subscribe('EventTab:closeEventDetails', this._closeEventDetails, this);

            this._initializeTable();
        },

        onStop: function () {
            this.getEventBus().unsubscribe('EventTab:closeFlyOut', this.closeFlyOutSubscriber);
            this.getEventBus().unsubscribe('EventTab:eventDetails', this.eventDetailsSubscriber);
            this.getEventBus().unsubscribe('EventTab:eventFetch', this.dataSubscriber);
            this.getEventBus().unsubscribe('EventTab:closeEventDetails', this.closeEventDetailsSubscriber);

            this._closeEventDetails();
            if (this.table) {
                this.table.destroy();
                this.table = undefined;
            }
            if (this.noEventMessage) {
                this.noEventMessage.destroy();
                this.noEventMessage = undefined;
            }
        },

        // ---------------------------- private functions  ----------------------------------

        _initializeTable: function () {
            if (!this.table) {
                this.table = new EventTable({
                    flowInstance: {
                        executionName: UriInfo.getExecutionName(),
                        flowId: UriInfo.getFlowId()
                    }, eventBus: this.getEventBus()
                });
                this.table.attachTo(this.view.getLeftDiv());
            } else {
                this.table.reloadEventTable();
            }
        },

        _updateEvent: function (isError) {
            if (isError) {
                if (this.table) {
                    this.table.destroy();
                    this.table = undefined;
                }
                if (this.noEventMessage === undefined || !this.noEventMessage.isAttached()) {
                    this.noEventMessage = new InlineMessage({
                        header: dictionary.get('events.noEventsMessage'),
                        icon: 'infoMsgIndicator'
                    });
                    this.noEventMessage.attachTo(this.view.getLeftDiv());
                }
            }
        },

        // ---------------------------- Select Event functions  ----------------------------------

        _updateEventDetails: function (event, selected) {
            this.eventDetailsSelected = selected;
            if (selected) {
                this.eventSelected = event;
                this._handleResize();
            } else {
                this._closeEventDetails();
            }
        },

        _closeEventDetails: function (flyOut) {
            isFlyoutShown = false;
            this.eventDetailsSelected = false;
            this.eventSelected = undefined;
            if (this.eventDetails) {
                this.eventDetails.destroy();
                this.eventDetails = undefined;
            }
            this.view.hiddenEventDetails();

            if (flyOut) { //remove selected table
                this.table.unselectAllRows();
            }
        },

        // ---------------------------- Resize functions ------------------------------------
        _resizeThrottler: function () {
            // ignore resize events as long as an actualResizeHandler execution is in the queue
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(function () {
                    resizeTimeout = null;
                    this._handleResize();
                    // The actualResizeHandler will execute at a rate of 15fps
                }.bind(this), 66);
            }
        },

        _handleResize: function () {
            if (isFlyoutShown === false && this.eventDetailsSelected) {
                if (this.eventDetails) {
                    this.eventDetails.destroy();
                }
                var eventData = this.eventSelected.getData();
                this.eventDetails = new EventDetails({event: eventData, eventBus: this.getEventBus()});

                if (this.view.isMobileSize()) {
                    isFlyoutShown = true;
                    container.getEventBus().publish('flyout:show', {
                        header: "",
                        content: this.eventDetails,
                        width: '85%'
                    });
                } else {
                    this.eventDetails.attachTo(this.view.getDetails());
                    this.view.showEventDetails();
                }
            }
        }

    });
});
