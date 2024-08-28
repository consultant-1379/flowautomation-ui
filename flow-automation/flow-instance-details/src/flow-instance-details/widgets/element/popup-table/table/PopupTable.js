define([
    'jscore/core',
    './PopupTableView',
    'widgets/Button',
    'container/api',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/Selection',
    'tablelib/plugins/NoHeader',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/SortableHeader',
    'widgets/Dialog',
    '../../../common/filter/Filter',
    'i18n!flow-instance-details/dictionary.json',
    'flow-automation-lib/services/ErrorHandler',
    '../../../common/info/Info',
    'flow-automation-lib/helper/utils'
], function (core, View, Button, container, Table, ResizableHeader, Selection, NoHeader, RowEvents, SortableHeader, Dialog, Filter, dictionary, ErrorHandler, Info, utils) {
    var defaultSortColumn,
        defaultSortOrder = "asc",
        defaultFilterColumn = dictionary.get('filter.defaultColumn'),
        linkedCellColumnText_View = dictionary.get('links.view'),
        linkedCellColumnText_NotAvailable = "N/A";

    return core.Widget.extend({

        View: View,
        /************************************** internal Methods *******************************/
        init: function (options) {
            this.property = options.property;
            this.localProperty = Object.assign({}, options.property);
            this.booleanValue = false;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
            this.isReviewConfirmView = options.isReviewConfirmView;
            this.showHeader = options.showHeader;
        },

        onViewReady: function () {
            this.view.setTitle(utils.concatIfExist(this.localProperty.name, this.localProperty.nameExtra));
            if (!this._isSelectTable()) {
                this.view.resetContainerWidth(this.indentLevel);
            }
            this._createTable();
            var defaultSelectedRows = this._getDefaultSelectRows();
            if (defaultSelectedRows && this._isSelectTable()  && !this.isReviewConfirmView) {

                this._selectTableRows(defaultSelectedRows);
                this.selectedRows = defaultSelectedRows;
            }

            if(this.showHeader === false){
                this.view.hideTopPanel();
            }

            if(this.isReviewConfirmView){
                this.view.hideFilter();
            }

            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }
            this._setInfo();
        },
        /************************************** Public Methods *******************************/
        getValue: function () {
            this.property.returnValue = this.selectedRows;
        },

        validateSelection: function () {
            var errorHeader = dictionary.get('errors.validationHeader');
            var errorBody = "";
            if (this.localProperty.minItems && this.localProperty.maxItems) {
                if (this.localProperty.minItems <= this.selectedRows.length && this.selectedRows.length <= this.localProperty.maxItems) {
                    return true;
                } else {
                    errorBody = dictionary.get('errors.selectTableValidation.select') + dictionary.get('errors.selectTableValidation.minimum') + this.localProperty.minItems + ", " + dictionary.get('errors.selectTableValidation.maximum') + this.localProperty.maxItems;
                }
            } else if (this.localProperty.minItems) {
                if (this.localProperty.minItems <= this.selectedRows.length) {
                    return true;
                } else {
                    errorBody = dictionary.get('errors.selectTableValidation.few') + dictionary.get('errors.selectTableValidation.minimum') + this.localProperty.minItems;
                }
            } else if (this.localProperty.maxItems) {
                if (this.selectedRows.length <= this.localProperty.maxItems) {
                    return true;
                } else {
                    errorBody = dictionary.get('errors.selectTableValidation.many') + dictionary.get('errors.selectTableValidation.maximum') + this.localProperty.maxItems;
                }
            } else {
                return true;
            }

            if (this._isSelectTable()) {
                this.view.setError(errorBody);
                return false;
            } else {
                ErrorHandler.validationError(errorHeader, errorBody);
            }
        },

        /************************************** Private Methods *******************************/
        _createTable: function () {
            var tableOptions = this._getTableOptions();
            this.table = new Table(tableOptions);
            this.tableData = this._getTableData();
            this.table.setData(this.tableData);

            if (this._isSelectTable()  && !this.isReviewConfirmView) {
                if(this._isSingleSelectTable()) {
                    this.table.addEventHandler('rowselect', this.onRowSelect.bind(this));
                }else{
                    this.table.addEventHandler('check', this.onTableSelect.bind(this));
                    this.table.addEventHandler('rowselect', this.onTableSelect.bind(this));
                    this.table.addEventHandler('checkheader', this.onTableSelect.bind(this));
                }
            }

            this.table.addEventHandler('sort', this.onTableSort.bind(this));
            this.table.attachTo(this.view.getTable());

            this._setTableFilter();
        },


        onTableSelect: function(){

            this.selectedRows = this.table.getSelectedRows().map(function(it){
                return it.options.model;
            });
        },

        _getDefaultSelectRows: function(){
            if(this.localProperty.default && this.localProperty.default.length > 0){
                return this.property.default;
            }
        },

        _getTableOptions: function () {
            var tableOptions = {
                columns: this._getDefaultColumns(),
                modifiers: [{
                    name: 'striped'
                }],
                plugins: [
                    new SortableHeader(),
                    new ResizableHeader(),
                    new RowEvents({
                        events: ['contextmenu']
                    }),
                ]
            };

            if (this._isSelectTable() && !this.isReviewConfirmView) {
                this._setSelectionPlugin(tableOptions);

            }

            return tableOptions;
        },

        _setSelectionPlugin: function(tableOptions){
            if(this._isSingleSelectTable()){
                tableOptions.plugins.push(new Selection({
                    checkboxes: false,
                    selectableRows: true,
                    multiselect: false
                }));
            }else{
                tableOptions.plugins.push(new Selection({
                    checkboxes: true,
                    selectableRows: true,
                    multiselect: Selection.MultiSelectMode.NO_CTRL_SHIFT,
                    bind: true
                }));
            }
        },

        _isSingleSelectTable: function(){
           return  this.localProperty.maxItems && this.localProperty.maxItems === 1;
        },

        _isSelectTable: function() {
            return this.localProperty.format === 'select-table';
        },

        _getDefaultColumns: function () {
            var columnList = [];
            if (this.localProperty.items && this.localProperty.items.properties) {
                var columns = this.localProperty.items.properties;
                if(this.isReviewConfirmView) {
                    for (var colName in columns) {
                        columnList.push({
                            title: columns[colName].name,
                            attribute: colName,
                            sortable: true,
                            resizable: true
                        });
                    }
                }else{
                    var columnWidth;
                    if (!this._isSelectTable() && this.hidden === true) {
                        columnWidth = Math.floor(this.view.getPopupTableWidth(this.indentLevel)/(Object.keys(columns).length));
                    }
                    for (var colKey in columns) {
                        var column = {
                          title: columns[colKey].name,
                          attribute: colKey,
                          sortable: true,
                          resizable: true
                        };
                        if (columnWidth !== undefined) {
                            column.width = columnWidth + "px";
                        }
                        columnList.push(column);
                    }
                }

                return columnList;
            }
        },

        _getTableData: function () {
            // table data is in default field for format=table(readonly), information table and when in review and confirm
            if(this.isReviewConfirmView || this.localProperty.format === "informational-table" || this.localProperty.format === "table") {
                if (this.localProperty.default && this.localProperty.default.length > 0) {
                    return this.localProperty.default;
                }
            }else{
                if (this.localProperty.selectableItems && this.localProperty.selectableItems.length > 0) {
                    return this.localProperty.selectableItems;
                }
            }
        },

        _getSortedData: function (mode, attribute, items) {
            var sortOrder = mode === 'asc' ? 1 : -1;

            return items.sort(function (item1, item2) {
                return item1[attribute].toString().localeCompare(item2[attribute].toString()) * sortOrder;
            });
        },

        _setInfo: function(){
            if(!this.isReviewConfirmView && !this._isSelectTable()){
                this.info = new Info({text:this.property.info});
                this.info.attachTo(this.view.getInfo());
            }
        },


        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        _selectTableRows: function (selectedRows) {
            if (selectedRows && !this.isReviewConfirmView) {
                this.table.selectRows(function (row) {
                    return this._setRowSelection(row);
                }.bind(this));

                if (!this._isSingleSelectTable()) {
                    this.table.checkRows(function (row) {
                        return this._setRowSelection(row);
                    }.bind(this));
                }
            }
        },

        _setRowSelection: function(row){
            return this.property.default.some(function (defaultRow) {
                var columns = Object.keys(defaultRow);
                if (columns && columns.length > 0) {
                    for (var i = 0; i < columns.length; i++) {
                        if (defaultRow[columns[i]] !== row.getData()[columns[i]]) {
                            break;
                        } else if (i === columns.length - 1) {
                            return true;
                        }
                    }
                    return false;
                }
            }.bind(this));
        },

        _setTableFilter: function () {
            this.filter = new Filter({filterColumns: this._getDefaultColumns()});
            this.filter.addEventHandler('filter:stateChanged', this.onFilterStateChange, this);
            this.filter.attachTo(this.view.getFilter());
        },

        onFilterStateChange: function (filterState) {
            this.tableFilterState = filterState;
            var isFilterReset = false;
            var filteredRows = [];
            var currentRows = this._getTableData();

            if (filterState.text.trim() === '') {
                isFilterReset = true;
                filteredRows = currentRows;
            }
            filteredRows = this.handleFilterStateChange(filterState, currentRows);

            this.selectedRows = [];
            this.refreshTable(filteredRows, isFilterReset);
        },

        handleFilterStateChange: function (filterState, rows) {
            var filteredRows = [];
            var columnList = [];
            if (filterState.column.attribute === defaultFilterColumn) {
                columnList = this.table._columns.map(function (col) {
                    return {columnName: col.attribute, cellType: col.cellType};
                });
            } else {
                columnList = [{columnName: filterState.column.attribute, cellType: filterState.column.cellType}];
            }

            this.getFilteredRows(rows, columnList, filterState.text, filteredRows);
            return filteredRows;
        },

        getFilteredRows: function (rows, columns, text, filteredRows) {
            for (var rowIndex in rows) {
                for (var index in columns) {
                    if(typeof columns[index].columnName !== "undefined" ) {
                        if (typeof columns[index].cellType !== "undefined") {
                            this.getLinkedCellColumnFilteredRows(rows[rowIndex], columns[index].columnName, text, filteredRows);
                        } else {
                            if (rows[rowIndex][columns[index].columnName].toString().toUpperCase().indexOf(text.toUpperCase()) > -1) {
                                filteredRows.push(rows[rowIndex]);
                                break;
                            }
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
                this.filteredTableData = undefined;
                this.setSortedRows(newRows);
            } else {
                this.filteredTableData = newRows;
                this.setSortedRows(this.filteredTableData);
            }
        },

        setSortedRows: function (rows) {
            var displayedRows = this.filteredTableData ? this.filteredTableData : this._getTableData();
            if (this.isSortingApplied()) {
                this.table.setData(this.getSortedData(this.sortOrder, this.sortColumn, displayedRows));
            } else {
                this.table.setData(displayedRows);
            }
        },

        isSortingApplied: function () {
            return (this.sortOrder && this.sortOrder !== defaultSortOrder) || (this.sortColumn && this.sortColumn !== defaultSortColumn);
        },

        /****************************************** Event handlers **********************************/
        onRowSelect: function (row) {
            if (row._isSelected) {
                this.selectedRows = [row.options.model];
            } else {
                this.selectedRows = [];
            }
        },

        onTableSort: function (mode, attribute) {
            this.sortParams = {
                mode: mode,
                column: attribute
            };

            this.table.setData(this._getSortedData(mode, attribute, this.table.getData()));
            if (this.selectedRows && this.selectedRows.length > 0) {
                this._selectTableRows(this.selectedRows);
            }
        }
    });
});