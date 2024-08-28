define([
    'jscore/core',
    'tablelib/Table',
    './EventTableView',
    'i18n!flow-instance-details/dictionary.json',
    'tablelib/plugins/Selection',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/ResizableHeader',
    'widgets/SelectBox',
    'widgets/InlineMessage',
    '../event-severity-cell/EventSeverityCell',
    'tablelib/plugins/VirtualScrolling',
    '../../../services/EventDataService',
    "widgets/PopupDatePicker",
    'widgets/Button',
    'container/api',
    '../event-filter/EventFilter',
    '../event-severity-selector/EventSeveritiesSelector',
    'widgets/Loader'
], function (core, Table, View, dictionary, Selection, SortableHeader, ResizableHeader,
             SelectBox, InlineMessage, EventSeverityCell, VirtualScrolling, EventDataService,
             PopupDatePicker, Button, container, EventFilter, EventSeveritySelector, Loader) {
    'use strict';

    var defaultEventColumns = [
        {
            title: dictionary.get('events.type'),
            width: "170px",
            sortable: true,
            resizable: true,
            attribute: 'severity',
            cellType: EventSeverityCell
        },
        {
            title: dictionary.get('events.time'),
            width: "150px",
            sortable: true,
            resizable: true,
            attribute: 'eventTime'
        },
        {
            title: dictionary.get('events.target'),
            width: "150px",
            sortable: true,
            resizable: true,
            attribute: 'target'
        },
        {
            title: dictionary.get('events.msgSynopsis'),
            width: 0,
            sortable: true,
            resizable: true,
            attribute: 'message'
        }];

    return core.Widget.extend({

        init: function (options) {
            this.tableConfig = {
                dataLength: 10,
                sortMode: 'desc',
                sortAttr: 'eventTime',
                severities: [],
                columns: defaultEventColumns,
                flowInstance: options.flowInstance
            };

            this.eventBus = options.eventBus;
        },

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this._createTable();
            this._createFilters();
            this._createRefreshButton();

            this.updateFilterSubscriber = this.eventBus.subscribe('EventTable:updateFilter', this._updateFilter, this);
            this.eventSeveritySubscriber = this.eventBus.subscribe('EventTable:eventSeveritySelector', this._updateSeverity, this);

            this.view.getClearSelectionLink().addEventHandler('click', this._onClearSelection, this);
            this.view.hideClearSelectionLink();

            this._setUpPollingForCalculateLastRefresh();
        },

        onDestroy: function () {
            this.table.destroy();
            this.startDateTime.destroy();
            this.endDateTime.destroy();
            this.flyOutFilters.destroy();
            this.severities.destroy();
            this.refreshButton.destroy();
            if (this.loader) {
                this.loader.destroy();
            }

            // stop polling for refreshed date
            clearInterval(this.pollingToCalculateLastRefresh);
            this.pollingToCalculateLastRefresh = null;

            EventDataService.wipeBufferData();

            this.eventBus.unsubscribe('EventTable:updateFilter', this.updateFilterSubscriber);
            this.eventBus.unsubscribe('EventTable:eventSeveritySelector', this.eventSeveritySubscriber);
        },

        // ---------------------------- Public functions ------------------------------------

        reloadEventTable: function (clear) {
            this.tableConfig.refresh = true;
            if (clear === true) {
                this.view.hideClearSelectionLink();
                this.tableConfig.startDate = undefined;
                this.tableConfig.endDate = undefined;
                this.tableConfig.severities = [];
                this.tableConfig.resource = undefined;
                this.tableConfig.message = undefined;
                this.startDateTime.clear();
                this.endDateTime.clear();
                this.severities.setSeverities([]);
            }

            this._applyFilters();
        },

        unselectAllRows: function () {
            this.table.unselectAllRows();
        },

        // ---------------------------- Private functions ------------------------------------

        _onClearSelection: function () {
            this.reloadEventTable(true);
        },

        _updateSeverity: function (severity, status) {
            if (status) { // add
                this.tableConfig.severities.push(severity);
            } else { //remove
                this.tableConfig.severities = this.tableConfig.severities.filter(function (s) {
                    return s !== severity;
                });
            }

            this._applyFilters();
        },

        _transformDate: function (date) {
            if (date) {
                return new Date(date).toISOString();
            }
            return undefined;
        },

        _updateFilter: function (filters) {
            this.tableConfig.severities = filters.severities || [];
            this.tableConfig.resource = filters.resource || undefined;
            this.tableConfig.message = filters.message || undefined;
            this.tableConfig.startDate = this._transformDate(filters.startDate);
            this.tableConfig.endDate = this._transformDate(filters.endDate);

            this.startDateTime.setValue(filters.startDate);
            this.endDateTime.setValue(filters.endDate);
            this.severities.setSeverities(this.tableConfig.severities);

            this._applyFilters();
        },

        _applyFilters: function () {
            this.eventBus.publish('EventTab:closeEventDetails', true);

            // Show or hide the clear filter option.
            if (this._isFilterApplied()) {
                this.view.showClearSelectionLink();
            } else {
                this.view.hideClearSelectionLink();
            }

            // set scroll in the fake div to the top
            if (this.table.getVirtualScrollBar()) {
                this.table.getVirtualScrollBar().setPosition(0);
            }

            //reload the content of the table
            this.table.reload();

            //Update the text on the screen that tells the time refresh happened
            this._updateRefreshedText();
        },

        // ---------------------------- table functions ------------------------------------
        _createTable: function () {
            var tableConfig = this.tableConfig;
            if (!this.table) {
                this.table = new Table({
                    header: dictionary.get("events.header"),
                    columns: tableConfig.columns,
                    modifiers: [{
                        name: 'striped'
                    }],
                    plugins: [
                        new Selection({
                            checkboxes: false,
                            selectableRows: true,
                            multiselect: false
                        }),
                        new VirtualScrolling({
                            totalRows: tableConfig.dataLength,
                            getData: this._getEventTableData.bind(this),
                            redrawMode: VirtualScrolling.RedrawMode.SOFT
                        }),
                        new SortableHeader(),
                        new ResizableHeader()
                    ]
                });

                this.table.addEventHandler('rowselect', function (event, selected) {
                    this.eventBus.publish('EventTab:eventDetails', event, selected);
                }.bind(this));

                this.table.setSortIcon(tableConfig.sortMode, tableConfig.sortAttr);

                // Listen for the sort event
                this.table.addEventHandler('sort', function (sortMode, sortAttr) {

                    // Set the new sort options
                    this.tableConfig.sortAttr = sortAttr;
                    this.tableConfig.sortMode = sortMode;

                    // set scroll in the fake div to the top
                    this.table.getVirtualScrollBar().setPosition(0);
                    this.table.reload();
                }.bind(this));

                this.table.attachTo(this.view.getTable());
                this._loadingDataServer();
            }
        },

        _getEventTableData: function (startIndex, length, callback) {
            // If a previous getData is in progress, cancel it
            clearTimeout(this.getDataTimeoutId);
            var endIndex = startIndex + length;
            var wait = EventDataService.isDataInCache(startIndex, endIndex) ? 0 : 750;
            this.getDataTimeoutId = setTimeout(function () {
                EventDataService.loadData(startIndex, endIndex, this.tableConfig)
                    .then(function (response) {
                        if (response.totalLength > 0 || this._isFilterApplied()) {
                            this._returnedDataServer();
                            this.view.setNumberOfEvents(response.totalLength);

                            // Check if the total length has changed, if so we need to update the height of the fake div
                            if (response.totalLength !== this.tableConfig.dataLength) {
                                this.table.setTotalRows(response.totalLength);
                                this.tableConfig.dataLength = response.totalLength;
                            }

                            // Change message in annotated scroll bar
                            this.table.getVirtualScrollBar().setAnnotationText((startIndex + 1) + ' - ' + endIndex);

                            callback(response.data);
                        } else {
                            this.eventBus.publish('EventTab:eventFetch', true);
                        }
                    }.bind(this))
                    .catch(function (ignore) {
                        console.error(ignore);
                    }.bind(this));
                this.tableConfig.refresh = false;
            }.bind(this), wait);
        },

        /**
         * when loading data, it will show the loading
         */
        _loadingDataServer : function(){
            this.view.hiddenEventTable();
            this.loader = new Loader({loadingText: dictionary.get("loaderMessage")});
            this.loader.attachTo(this.view.getLoader());

        },

        /**
         * It will remove the loading and change to visible the components
         */
        _returnedDataServer: function() {
            if (this.loader) {
                this.loader.destroy();
                this.loader = undefined;
            }
            this.view.showEventTable(); // change data to visible
        },

        _createStartDatePopupDataPicker: function () {
            this.startDateTime = new PopupDatePicker({
                compact: false,
                showTime: true,
                placeholder: dictionary.get("events.startTime")
            });

            this.startDateTime.attachTo(this.view.getStartDateTimeSelector());

            this.startDateTime.addEventHandler("dateselect", function () {
                this.tableConfig.startDate = this._transformDate(this.startDateTime.getValue());
                this._applyFilters();
            }.bind(this));

            this.startDateTime.addEventHandler("dateclear", function () {
                this.tableConfig.startDate = undefined;
                if (this.tableConfig.refresh === false) { // Reload from server only if its not a full refresh of data otherwise this will lead to multiple requests.
                    this._applyFilters();
                }
            }.bind(this));
        },

        _createEndDatePopupDataPicker: function () {
            this.endDateTime = new PopupDatePicker({
                compact: false,
                showTime: true,
                placeholder: dictionary.get("events.endTime")
            });

            this.endDateTime.attachTo(this.view.getEndDateTimeSelector());

            this.endDateTime.addEventHandler("dateselect", function () {
                this.tableConfig.endDate = this._transformDate(this.endDateTime.getValue());
                this._applyFilters();
            }.bind(this));

            this.endDateTime.addEventHandler("dateclear", function () {
                this.tableConfig.endDate = undefined;
                if (this.tableConfig.refresh === false) { // Reload from server only if its not a full refresh of data otherwise this will lead to multiple requests.
                    this._applyFilters();
                }
            }.bind(this));
        },

        _isFilterApplied: function () {
            return !!(this.tableConfig.severities.length ||
                this.tableConfig.resource ||
                this.tableConfig.message ||
                this.tableConfig.startDate ||
                this.tableConfig.endDate);
        },

        _createFlyOutFilter: function () {
            this.flyOutFilters = new Button({
                modifiers: [{name: 'subtle'}],
                icon: 'filter'
            });

            this.flyOutFilters.attachTo(this.view.getFlyOutButton());

            this.flyOutFilters.addEventHandler("click", function () {

                this.eventBus.publish('EventTab:closeEventDetails', true);

                var eventFilter = new EventFilter({
                    eventBus: this.eventBus,
                    startDate: this.startDateTime.getValue(),
                    endDate: this.endDateTime.getValue(),
                    message: this.tableConfig.message,
                    resource: this.tableConfig.resource,
                    severities: this.tableConfig.severities
                });

                container.getEventBus().publish('flyout:show', {
                    header: dictionary.get("events.filter.header"),
                    content: eventFilter
                });
            }.bind(this));
        },

        _createFilters: function () {
            this._createFlyOutFilter();

            this._setSeverityIcons();
            this._createStartDatePopupDataPicker();
            this._createEndDatePopupDataPicker();
        },

        _createRefreshButton: function () {
            this.refreshButton = new Button({
                modifiers: [{name: 'subtle'}],
                icon: 'refresh'
            });

            this.refreshButton.attachTo(this.view.getRefreshButton());

            this.refreshButton.addEventHandler("click", function () {
                this.reloadEventTable();
            }.bind(this));
        },

        _setSeverityIcons: function () {
            this.severities = new EventSeveritySelector({eventBus: this.eventBus});
            this.severities.attachTo(this.view.getSeverityIcon());
        },

        _updateRefreshedText: function () {
            this.lastUpdate = Date.now();
            this.view.setLastRefreshed(dictionary.get("events.now"));
        },

        _setUpPollingForCalculateLastRefresh: function () {
            if (!this.pollingToCalculateLastRefresh) {
                this.pollingToCalculateLastRefresh = setInterval(function () {
                    var dif = (Date.now() - this.lastUpdate);
                    var seconds = Math.round((dif / 1000));
                    if (seconds >= 120) {
                        var minutes = Math.round((seconds / 60));
                        if (minutes >= 120) {
                            var hours = Math.round((minutes / 60));
                            this.view.setLastRefreshed(hours + dictionary.get("events.hoursAgo"));
                        } else {
                            this.view.setLastRefreshed(minutes + dictionary.get("events.minutesAgo"));
                        }
                    } else {
                        this.view.setLastRefreshed(seconds + dictionary.get("events.secondsAgo"));
                    }

                }.bind(this), 30000);
            }
        }

    });
});
