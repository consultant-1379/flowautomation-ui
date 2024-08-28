define([
    'jscore/core',
    './ListBoxView',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/Selection',
    'tablelib/plugins/NoHeader',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/SortableHeader',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils'
], function (core, View, Table, ResizableHeader, Selection, NoHeader, RowEvents, SortableHeader, Info, utils) {
    'use strict';
    var defaultSortColumn = "name",
        defaultSortOrder = "asc";

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.booleanValue = false;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
            this.isReviewConfirmView = options.isReviewConfirmView;
        },

        onViewReady: function () {
            this.createListBox();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }
           this._setInfo();
        },

        createListBox: function () {
            var enumItems;
            if (this.property.enumNames) {
                enumItems = this.property.enumNames;
            } else {
                enumItems = this.property.enum;
            }
            this.getListItems(enumItems);

            var tableOptions = this.getTableOptions();

            this.listTable = new Table(tableOptions);
            this.listTable.setData(this.getSortedData(defaultSortOrder, defaultSortColumn, this.listItems));
            this.listTable.setSortIcon(defaultSortOrder, defaultSortColumn);
            if (this.property.default) {
                this.selectedValue = this.property.default;
            }

            if (!this.isReviewConfirmView){
                this.selectTableRow(this.property.default);
             }

            if (this.property.format === 'select-list') {
                this.listTable.addEventHandler('rowselect', this.onRowSelect.bind(this));
            }
            this.listTable.addEventHandler('sort', this.onTableSort.bind(this));
            this.listTable.attachTo(this.view.getListBox());

        },

        _setInfo: function () {
            if (!this.isReviewConfirmView) {
                this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
                this.info.attachTo(this.view.getInfo());
            }
        },

        onRowSelect: function (row) {
            if(row._isSelected){
                this.selectedValue = row.options.model.value;
            }else{
                this.selectedValue = "";
            }

        },
        getDefaultColumns: function () {
            var defaultColumns = [
                {title: utils.concatIfExist(this.property.name, this.property.nameExtra),
                    attribute: "name", sortable: true, resizable: true, width: "700px"}
            ];
            return defaultColumns;
        },

        onTableSort: function (mode, attribute) {
            this.sortParams = {
                mode: mode,
                column: attribute
            };

            this.listTable.setData(this.getSortedData(mode, attribute, this.listTable.getData()));
            if (!this.isReviewConfirmView) {
                this.selectTableRow(this.selectedValue);
            }
        },

        getTableOptions: function () {
            var tableOptions = {
                columns: this.getDefaultColumns(),
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

            if (this.property.format === 'select-list') {
                tableOptions.plugins.push(new Selection({
                    checkboxes: false,
                    selectableRows: true,
                    multiselect: false
                }));
            }

            return tableOptions;
        },

        selectTableRow: function (rowValue) {
            if (rowValue) {
                this.listTable.selectRows(function (row) {
                    return row.getData().value === rowValue;
                });
            }
        },

        getSortedData: function (mode, attribute, items) {
            var sortOrder = mode === 'asc' ? 1 : -1;

            return items.sort(function (item1, item2) {
                return item1[attribute].localeCompare(item2[attribute]) * sortOrder;
            });
        },

        getListItems: function (enumItems) {
            this.listItems = [];

            if (this.property.format === 'select-list') {
                for (var itemIndex = 0; itemIndex < enumItems.length; itemIndex++) {
                    this.listItems.push(
                        {
                            name: enumItems[itemIndex],
                            title: enumItems[itemIndex],
                            value: this.property.enum[itemIndex],
                            index: itemIndex
                        });
                }
            } else {
                var listItemValues = [];

                if (this.isReviewConfirmView){
                    listItemValues = this.property.default;
                } else{
                    listItemValues = this.property.items.default;
                }
                for (var index = 0; index < listItemValues.length; index++) {
                    this.listItems.push(
                        {
                            name: listItemValues[index],
                            title: listItemValues[index],
                            value: listItemValues[index],
                            index: index
                        });
                }
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

        getValue: function () {
            this.property.returnValue = this.selectedValue;
        }
    });
});