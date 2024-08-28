define([
    'jscore/core',
    './PopupTableButtonView',
    'widgets/Button',
    'container/api',
    '../../element/popup-table/table/PopupTable',
    'widgets/Dialog',
    'i18n!flow-instance-details/dictionary.json',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils'
], function (core, View, Button, container, PopupTable, Dialog, dictionary, Info, utils) {
    return core.Widget.extend({

        View: View,
        /************************************************************************ internal methods *****************************************************************************/
        init: function (options) {
            this.property = options.property;
            this.booleanValue = false;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.view.setTitle(utils.concatIfExist(this.property.name, this.property.nameExtra));
            this.view.setSelectedItemsTitle(dictionary.table.selectedValue);
            this._createTablePopButton();
            var defaultSelectedRows = this._getDefaultSelectRows();

            this._setAndShowSelectedItems(defaultSelectedRows);

            if (this.hidden) {
                this.hide();
            }

            this._setInfo();
        },

        onDestroy: function () {
            this.selectedRows = [];
        },
        /************************************************************************ public methods *****************************************************************************/
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
            if (!this.property.returnValue) {
                this.property.returnValue = [];
            }
            this.property.returnValue = this.selectedRows;
        },
        /************************************************************************ private methods *****************************************************************************/
        _createTablePopButton: function () {
            var popupButton = new Button({
                caption: dictionary.table.buttonCaption,
                modifiers: [{
                    name: 'small'
                }],
                icon: {
                    name: 'menu',
                    position: 'right'
                }
            });

            popupButton.addEventHandler("click", function () {
                this._openTable();
            }.bind(this));

            popupButton.attachTo(this.view.getButton());
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info});
            this.info.attachTo(this.view.getInfo());
        },

        _openTable: function () {
            var popupTable = new PopupTable({
                property: this.property,
                hidden: false,
                indentLevel: 0
            });

            var tablePopupDialog = new Dialog({
                fullContent: true,
                content: popupTable,
                buttons: [
                    {
                        caption: dictionary.get("actions.ok"),
                        color: 'darkBlue',
                        action: function () {
                            if (popupTable.validateSelection()) {
                                this._setAndShowSelectedItems(popupTable.selectedRows);
                                tablePopupDialog.destroy();
                                tablePopupDialog.hide();
                            }
                        }.bind(this)
                    },     {
                        caption: dictionary.get("actions.cancel"),
                        color: "grey",
                        action: function () {
                            popupTable.destroy();
                            tablePopupDialog.destroy();
                            tablePopupDialog.hide();
                        }.bind(this)
                    }
                ]
            });
            tablePopupDialog.show();
        },

        _getDefaultSelectRows: function () {
            try {
                if (this.property.default && this.property.default.length > 0) {
                    if (this.property.selectableItems && this.property.selectableItems.length > 0) {
                        return this.property.selectableItems.filter(function (row) {
                            return this.property.default.some(function (defaultRow) {
                                var columns = Object.keys(defaultRow);
                                if (columns && columns.length > 0) {
                                    for (var i = 0; i < columns.length; i++) {
                                        if (defaultRow[columns[i]] !== row[columns[i]]) {
                                            break;
                                        } else if (i === columns.length - 1) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                            }.bind(this));
                        }.bind(this));
                    }
                }
            } catch (exception) {
                console.debug(exception);
            }
        },

        _setAndShowSelectedItems: function (selectedRows) {

            if (selectedRows && selectedRows.length > 0) {
                this.selectedRows = selectedRows;
                //use schema property default for showing selected value in the table on reOpening
                this.displayTableProperty = Object.assign({}, this.property);
                this.displayTableProperty.format = "informational-table";
                this.displayTableProperty.default = selectedRows;

                if (this.displayItemsTable) {
                    this.displayItemsTable.destroy();
                }

                this.displayItemsTable = new PopupTable({
                    property: this.displayTableProperty,
                    hidden: false,
                    indentLevel: 0,
                    isReviewConfirmView: true,
                    showHeader: false
                });

                this.displayItemsTable.attachTo(this.view.getSelectedItemsTable());
            } else {
                this.selectedRows = [];
            }
            this._setTableSelectedItemsInSchema();
        },

        _setTableSelectedItemsInSchema: function () {
            if (this.selectedRows && this.selectedRows.length > 0) {
                this.view.showSelectedItems();
                this.property.default = this.selectedRows;
            } else {
                this.view.hideSelectedItems();
                this.property.default = [];
            }
        }
    });
});