/*global define, Promise */

define([
    'jscore/ext/net'
], function (net) {
    'use strict';

    var EVENTS_OFFSET = 100;

    function canCacheFulfilTheEventsRequest(start, end) {
        /*jshint validthis:true */
        for (var index = start; index <= end; index++) {
            if (this.buffer[index] === undefined) {
                return false;
            }
        }
        return true;
    }

    function getEventsFromCache(start, end) {
        /*jshint validthis:true */
        var data = [];

        for (var bufferIndex = start, dataIndex = 0; bufferIndex <= end; bufferIndex++, dataIndex++) {
            if (this.buffer[bufferIndex]) {
                data[dataIndex] = this.buffer[bufferIndex];
            }
        }

        return data;
    }

    function clearCachedEvents() {
        /*jshint validthis:true */
        this.buffer = {};
    }

    function cacheFetchedEvents(data, index, length) {
        /*jshint validthis:true */
        for (var bufferIndex = index, dataIndex = 0; dataIndex <= length; bufferIndex++, dataIndex++) {
            if (data[dataIndex]) {
                this.buffer[bufferIndex] = data[dataIndex];
            }
        }
    }

    function isFilterOrSorterChanged(tableConfig, dataConfig) {
        var wipeAndLoadBuffer = false;

        // If the sort options are different then clear buffer
        if ((tableConfig.sortAttr && tableConfig.sortMode && (tableConfig.sortAttr !== dataConfig.sortAttr || tableConfig.sortMode !== dataConfig.sortMode)) || // verify change in sorter
            (JSON.stringify(tableConfig.severities) !== JSON.stringify(dataConfig.severities)) || // verify change in severities
            (tableConfig.startDate !== dataConfig.startDate) || // verify change in start date
            (tableConfig.endDate !== dataConfig.endDate) || // verify change in end date
            (tableConfig.message && tableConfig.message.trim() !== '' && tableConfig.message !== dataConfig.message) || // verify change in message
            (tableConfig.resource && tableConfig.resource.trim() !== '' && tableConfig.resource !== dataConfig.resource) || // verify change in resource
            tableConfig.refresh) {
            wipeAndLoadBuffer = true;
        }

        //update variables
        dataConfig.sortAttr = tableConfig.sortAttr;
        dataConfig.sortMode = tableConfig.sortMode;
        dataConfig.severities = tableConfig.severities.slice() || [];
        dataConfig.resource = tableConfig.resource;
        dataConfig.startDate = tableConfig.startDate;
        dataConfig.endDate = tableConfig.endDate;
        dataConfig.message = tableConfig.message;

        return wipeAndLoadBuffer;
    }

    //----------------------------------------------------------------- Exposed Service API

    function loadData(start, end, tableConfig) {
        /*jshint validthis:true */
        return new Promise(function (resolve, reject) {
            var dataConfig = this.dataConfig;

            if (!isFilterOrSorterChanged(tableConfig, dataConfig) && canCacheFulfilTheEventsRequest.call(this, start, end)) {
                // data is present in the buffer/ cache, respond directly
                resolve({
                    data: getEventsFromCache.call(this, start, end),
                    totalLength: dataConfig.totalLength
                });
            } else {
                // need to load data and update the buffer
                // set the buffer to start X items before requested index
                var cacheStartIndex = Math.max(start - EVENTS_OFFSET, 0),
                    // set the buffer length to include X items more than the requested length
                    cacheEndIndex = start + EVENTS_OFFSET;

                var eventURL = 'flowautomation/v1/executions/' + tableConfig.flowInstance.executionName + '/events?flow-id=' +
                    tableConfig.flowInstance.flowId + '&from=' + cacheStartIndex + '&to=' + cacheEndIndex +
                    '&sort-by=' + dataConfig.sortAttr + '&sort-order=' + dataConfig.sortMode.toUpperCase();

                if (tableConfig.severities.length) {
                    tableConfig.severities.forEach(function (value) {
                        eventURL += '&severity=' + value;
                    });
                }

                if (tableConfig.resource && tableConfig.resource.trim() !== '') {
                    eventURL += '&resource=' + tableConfig.resource;
                }

                if (tableConfig.message && tableConfig.message.trim() !== '') {
                    eventURL += '&message=' + tableConfig.message;
                }

                if (tableConfig.startDate) {
                    eventURL += '&startDate=' + tableConfig.startDate;
                }

                if (tableConfig.endDate) {
                    eventURL += '&endDate=' + tableConfig.endDate;
                }

                net.ajax({
                    url: eventURL,
                    type: 'GET',
                    dataType: 'json',
                    success: function (res) {
                        dataConfig.totalLength = res.numberOfRecords;
                        // wipe to avoid accumulating the data
                        clearCachedEvents.call(this);
                        cacheFetchedEvents.call(this, res.records, cacheStartIndex, cacheEndIndex);

                        resolve({
                            data: getEventsFromCache.call(this, start, end),
                            totalLength: dataConfig.totalLength
                        });
                    }.bind(this),
                    error: reject
                });

            }
        }.bind(this));
    }

    //-----------------------------------------------------------------

    var dataService = {
        init: function () {
            this.buffer = {};

            this.dataConfig = {
                totalLength: 0
            };
        },
        loadData: loadData,
        wipeBufferData: clearCachedEvents,
        isDataInCache: canCacheFulfilTheEventsRequest
    };

    dataService.init();

    return dataService;
});