define([
    'jscore/core',
    './ReportTableView',
    '../link-cell/LinkCell',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/SmartTooltips',
    'tablelib/plugins/FixedHeader',
    'tablelib/plugins/SortableHeader',
    '../../common/filter/Filter',
    'i18n!flow-instance-details/dictionary.json',
    'tablelib/plugins/Selection'
], function (core, View, LinkCell, Table, ResizableHeader, SmartTooltips, FixedHeader, SortableHeader, Filter, dictionary, Selection) {
    'use strict';
// IDUN-2980 UI – Removing Action Library
//    var FA_ACTION = "faAction";

    var defaultFilterColumn = dictionary.get('filter.defaultColumn'),
        linkedCellColumnText_View = dictionary.get('links.view'),
        linkedCellColumnText_NotAvailable = "N/A";

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.defaultSortColumn = "";
            this.defaultSortOrder = "asc";
            this.id = options.idTable;
            this.level = options.level;
            this.schema = options.schema;
            this.counter = options.counter;
            this.data = options.data;
            this.columnInfo = this.schema.items.properties;
            this.level = options.level;
            this.headerless = options.headerless;
            this.linkInfo = {};
            this.context = options.context;
        },

        onViewReady: function () {
            this.initializeReportTable();
        },


        initializeReportTable: function () {
            this.reportData = [];
            this.enumData = {};
            this.setDefaultSortColumn();
            this.table = this.createTable();
// IDUN-2980 UI – Removing Action Library
//            this.table.addEventHandler('check', this.onTableSelectionChange.bind(this));
//            this.table.addEventHandler('rowselect', this.onTableSelectionChange.bind(this));
//            this.table.addEventHandler('checkheader', this.onTableSelectionChange.bind(this));

            for (var row in this.data) {
                this.reportData.push(this.generateRow(this.data[row]));
            }
            this.view.setTableHeader(this.schema.items.name);
            this.view.setTableHeaderFont(this.level, this.headerless);
            this.setTableFilter();
            this.setTable();
        },
// IDUN-2980 UI – Removing Action Library
//        onTableSelectionChange: function () {
//            var data = {
//                "rowsSelected": this.table.getSelectedRows().map(function (it) {
//                    return it.options.model[FA_ACTION];
//                }),
//                "id" : this.id
//            };
//            this.context.eventBus.publish("FlowInstanceDetails:selectAction", data);
//        },

        setTableFilter: function () {
// IDUN-2980 UI – Removing Action Library
            var columnsToShow = this.reportTableColumns;
//            .filter(function (column) {
//                return column.title !== FA_ACTION;
//            });
            this.filter = new Filter({filterColumns: columnsToShow});
            this.filter.addEventHandler('filter:stateChanged', this.onFilterStateChange, this);
            this.filter.attachTo(this.view.getFilter());
        },

        setTable: function () {
            //Polling?
            var displayedRows = this.filteredReportTableData ? this.filteredReportTableData : this.reportData;
            if (this.isSortingApplied()) {
                this.updateTableData(this.getSortedData(this.sortOrder, this.sortColumn, displayedRows));
                this.table.setSortIcon(this.sortOrder, this.sortColumn);
            } else {
                this.updateTableData(this.getSortedData(this.defaultSortOrder, this.defaultSortColumn, displayedRows));

                this.table.setSortIcon(this.defaultSortOrder, this.defaultSortColumn);
            }
            this.table.addEventHandler('sort', this.onSortChange, this);
            this.table.attachTo(this.view.getTable());
        },

        _handlerSelectedRowsWithCall: function (method, params, context) {
// IDUN-2980 UI – Removing Action Library
//            // if contains action framework
//            if (!!context.isAction) {
//                var idSelectedItems = context.table.getSelectedRows().map(function (it) {
//                    return it.options.model[FA_ACTION].id;
//                });
//
//                method.call(context, params);
//
//                idSelectedItems.forEach(function (id) {
//                    context.table.selectRows(function (it) {
//                        return id === it.options.model[FA_ACTION].id;
//                    });
//                });
//            } else {
                method.call(context, params);
//            }
        },

        refreshReportTableOnPolling: function (updatedReportData) {
            this._handlerSelectedRowsWithCall(function (params) {
                this.reportData = [];

                this.table.clear();
                this.data = params.updatedReportData;
                for (var row in this.data) {
                    this.reportData.push(this.generateRow(this.data[row]));
                }
                //when refreshing on polling check if filter, sort applied in order
                if (this.reportTablefilterState) {
                    this.onFilterStateChange(this.reportTablefilterState);
                } else if (this.isSortingApplied()) {
                    this.onSortChange(this.sortOrder, this.sortColumn);
                } else {
                    this.updateTableData(this.getSortedData(this.defaultSortOrder, this.defaultSortColumn, this.reportData));
                    this.table.setSortIcon(this.defaultSortOrder, this.defaultSortColumn);
                }
            }, {"updatedReportData": updatedReportData}, this);
        },

        onSortChange: function (mode, attribute) {
            this._handlerSelectedRowsWithCall(function (params) {
                var height = this.context.topSection.getElement().getNative().scrollTop;
                this.sortOrder = params.mode;
                this.sortColumn = params.attribute;
                var displayedRows = this.filteredReportTableData ? this.filteredReportTableData : this.reportData;
                this.updateTableData(this.getSortedData(params.mode, params.attribute, displayedRows));
                this.context.topSection.getElement().getNative().scrollTop = height; // Workaround For TORF-369349 - Firfox scroll issue

            }, {"mode": mode, "attribute": attribute}, this);
        },

        setDefaultSortColumn: function () {
            var columnInfo = this.columnInfo;
            var nonLinkBasedColumns = [];
            if (Object.keys(this.schema.items.properties)[0]) {
                nonLinkBasedColumns = Object.keys(this.schema.items.properties).filter(function (column) {
// IDUN-2980 UI – Removing Action Library
//                    if (FA_ACTION === column) {
//                        return false;
//                    } else
                    if (!columnInfo[column].format) {
                        return true;
                    } else return !(columnInfo[column].format && columnInfo[column].format === 'link');
                });
            }

            if (nonLinkBasedColumns && nonLinkBasedColumns.length > 0) {
                this.defaultSortColumn = nonLinkBasedColumns[0];
            }
        },

        getSortedData: function (mode, attribute, rows) {
            var sortOrder = mode === 'asc' ? 1 : -1;
            var columnType = this.columnInfo[attribute].type ? this.columnInfo[attribute].type : "string";
            return rows.sort(function (reportData1, reportData2) {
                if (columnType === 'integer' || columnType === 'number') {
                    return (reportData1[attribute] - reportData2[attribute]) * sortOrder;
                } else{
                    return reportData1[attribute].localeCompare(reportData2[attribute]) * sortOrder;
                }
            });
        },

        generateRow: function (rowData) {
            var row = {};
            for (var column in this.schema.items.properties) {
                var columnName = column;
                var cellValue = rowData[columnName];
                if (this.enumData[columnName]) {
                    var translatedValueIndex = this.enumData[columnName].enums.indexOf(cellValue);
                    cellValue = this.enumData[columnName].enumNames[translatedValueIndex];
                }
                if (this.linkInfo[columnName]) {
                    if (cellValue) {
                        cellValue = {
                            linkFormat: this.linkInfo[columnName],
                            text: cellValue,
                            tooltip: this.columnInfo[columnName].description
                        };
                    } else {
                        cellValue = {linkNotSupplied: true};
                    }
                }
                row[columnName] = cellValue ? cellValue : '';
            }
            return row;
        },

        createTable: function () {

            this.reportTableColumns = this.getColumns();

            var plugins = [
                new ResizableHeader(),
                new SmartTooltips(),
                new FixedHeader({
                    maxHeight: "450px"
                }),
                new SortableHeader()
            ];
// IDUN-2980 UI – Removing Action Library
//            if (!!this.isAction) {
//                plugins.push(new Selection({
//                    checkboxes: true,
//                    selectableRows: true,
//                    multiselect: Selection.MultiSelectMode.NO_CTRL_SHIFT,
//                    bind: true
//                }));
//            }

            return new Table({
                plugins: plugins,
                modifiers: [{name: 'striped'}],
                columns: this.reportTableColumns
            });
        },

        addLinkCell: function (columns, title, attribute, column, propertyFormat) {
            columns.push({
                title: title,
                attribute: attribute,
                cellType: LinkCell
            });
            this.linkInfo[column] = propertyFormat;
        },

        getColumns: function () {
            var columns = [];
// IDUN-2980 UI – Removing Action Library
//            var actionFrw;
            for (var column in this.columnInfo) {
//                if (FA_ACTION === column) {
//                    columns.push({
//                        title: column,
//                        attribute: column,
//                        visible: false,
//                        resizable: false,
//                        sortable: false
//                    });
//                    actionFrw = true;
//                    continue;
//                }
                var title = this.columnInfo[column].name ? this.columnInfo[column].name : '';
                var attribute = column;
                if (this.columnInfo[column].enum && this.columnInfo[column].enumNames && this.columnInfo[column].enumNames.length === this.columnInfo[column].enum.length) {
                    this.storeEnumTranslationInfo(this.columnInfo[column], column);
                }
                var propertyFormat = this.columnInfo[column].format;
                if (this.isPropertyFormatLink(propertyFormat)) {
                    this.addLinkCell(columns, title, attribute, column, propertyFormat);
                    continue;
                }
                columns.push({
                    title: title,
                    attribute: attribute,
                    visible: this.columnInfo[column].visible === undefined || this.columnInfo[column].visible,
                    resizable: true,
                    sortable: true
                });
            }
//            this.isAction = actionFrw;
            return columns;
        },

        storeEnumTranslationInfo: function (enumData, columnName) {
            this.enumData[columnName] = {
                enums: enumData.enum,
                enumNames: enumData.enumNames
            };
        },

        onFilterStateChange: function (filterState) {
            this.reportTablefilterState = filterState;
            var isFilterReset = false;
            var filteredRows;
            var currentRows = this.reportData;

            if (filterState.text.trim() === '') {
                isFilterReset = true;
            }
// IDUN-2980 UI – Removing Action Library
//            // verify if is contains action fwk then must handler the selection table
//            if (this.isAction){
//                this.table.unselectAllRows();
//                this.onTableSelectionChange();
//            }

            filteredRows = this.handleFilterStateChange(filterState, currentRows);

            this.refreshTable(filteredRows, isFilterReset);
        },

        handleFilterStateChange: function (filterState, rows) {
            var filteredRows = [];
            var columnList = [];
            if (filterState.column.attribute === defaultFilterColumn) {
                columnList = this.reportTableColumns.map(function (col) {
                    return {columnName: col.attribute, cellType: col.cellType};
                });
            } else {
                columnList = [{columnName: filterState.column.attribute, cellType: filterState.column.cellType}];
            }

            this.getFilteredRows(rows, columnList, filterState.text, filteredRows);
            return filteredRows;
        },
// IDUN-2980 UI – Removing Action Library
        getFilteredRows: function (rows, columns, text, filteredRows) {
            for (var rowIndex in rows) {
                for (var index in columns) {
                    if (typeof columns[index].cellType !== "undefined") {
                        this.getLinkedCellColumnFilteredRows(rows[rowIndex], columns[index].columnName, text, filteredRows);
                    } else {
                        if (rows[rowIndex][columns[index].columnName].toUpperCase().indexOf(text.toUpperCase()) > -1) {
                            filteredRows.push(rows[rowIndex]);
                            break;
                        }
                    }
                }
            }
        },

        getLinkedCellColumnFilteredRows: function (row, column, text, filteredRows) {
            if (linkedCellColumnText_View.toUpperCase().indexOf(text.toUpperCase()) > -1) {
                if (row[column].text) {
                    filteredRows.push(row);
                }
            } else if (linkedCellColumnText_NotAvailable.toUpperCase().indexOf(text.toUpperCase()) > -1) {
                if (row[column].linkNotSupplied) {
                    filteredRows.push(row);
                }
            }
        },

        refreshTable: function (newRows, isFilterReset) {
            if (isFilterReset) {
                this.filteredReportTableData = undefined;
                this.setSortedRows(newRows);
            } else {
                this.filteredReportTableData = newRows;
                this.setSortedRows(this.filteredReportTableData);
            }
        },

        setSortedRows: function (rows) {
            // if filter text is emptied display original rows
            var height = this.context.topSection.getElement().getNative().scrollTop;
            var displayedRows = this.filteredReportTableData ? this.filteredReportTableData : this.reportData;
            if (this.isSortingApplied()) {

                this.updateTableData(this.getSortedData(this.sortOrder, this.sortColumn, displayedRows));
            } else {
                this.updateTableData(displayedRows);
            }

            this.context.topSection.getElement().getNative().scrollTop = height; // Workaround For TORF-369349 - Firfox scroll issue

        },

        isSortingApplied: function () {
            return (this.sortOrder && this.sortOrder !== this.defaultSortOrder) || (this.sortColumn && this.sortColumn !== this.defaultSortColumn.name);
        },

        onStart: function () {
        },

        onStop: function () {
        },

        createRegion: function (title) {

        },

        isPropertyFormatLink: function (propertyFormat) {
            return propertyFormat === 'link' || propertyFormat === 'download-link';
        },

        updateTableData: function(data) {
            this.table.setData(data);
// IDUN-2980 UI – Removing Action Library
//            if(this.isAction) {
//                this.table.disableCheckboxes(function (row) {
//                    var faAction = row.options.model[FA_ACTION];
//                    return faAction !== undefined && faAction.id === undefined;
//                });
//            }
        }
    });
});