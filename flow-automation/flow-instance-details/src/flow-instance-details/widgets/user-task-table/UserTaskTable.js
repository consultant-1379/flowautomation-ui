/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/NoHeader',
    'tablelib/plugins/Selection',
    './user-task-table-cell/UserTaskTableCell',
    './UserTaskTableView'
], function (core, Table, NoHeader, Selection, UserTaskTableCell, View) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var table = new Table({
                columns: [ {title: 'no title', attribute: 'title', width: '200px', resizable: true, cellType: UserTaskTableCell} ],
                plugins: [ new NoHeader() ]
            });

            table.addEventHandler('user-task-table-cell:expand', this.onRowExpand.bind(this));
            table.addEventHandler('user-task-table-cell:collapse', this.onRowCollapse.bind(this));
            table.addEventHandler('user-task-table-cell:clicked', this.onRowClick.bind(this));

            table.attachTo(this.getElement());
            this.table = table;
        },

        clear: function() {
            this.table.clear();
        },

        clearSelection: function() {
            this.selectedData = undefined;
        },

        findRowForUserTask: function(userTask) {
            var row;
            this.table.getRows().some(function (xrow) {
                var rowData = xrow.getData();
                if (rowData.id === userTask.id) {
                    row = xrow;
                }
            });
            return row;
        },
        
        selectFirstActiveUserTask: function() {
            this.currentTableData.some(function(data) {
                var selectionMade = false;
                if (data.group) {
                    data.userTasks.some(function (userTask) {
                        if (userTask.status === "active") {
                            var row = this.findRowForUserTask(userTask);
                            userTask.selected = true;
                            if (row) {
                                this.selectRow(row);
                            }
                            selectionMade = true;
                            this.triggerUserTaskSelected(userTask);
                            return true;
                        }   
                    }.bind(this));
                }
                else {
                    var userTask = data;
                    if (userTask.status === "active") {
                        var row = this.findRowForUserTask(userTask);
                        userTask.selected = true;
                        if (row) {
                            this.selectRow(row);
                        }
                        selectionMade = true;
                        this.triggerUserTaskSelected(userTask);
                        return true;
                    }
                }
                if (selectionMade) {
                    return true;
                }
            }.bind(this));
        },

        selectRow: function(row) {
             var data = row.getData();
             data.selected = true;

             this.selectedData = data;

             var element = row.view.getElement().getNative();
             var classList = element.classList;                    // TODO - can handle class in cell/view ?
             classList.add('ebTableRow_highlighted');
        },

        triggerUserTaskSelected: function(rowData) {
            this.trigger('UserTasks:userTaskSelected', rowData);
        },

        onRowExpand: function (row) {
            var data = row.getData();
            if (data.group) {
                var index = row.getIndex();
                data.userTasks.forEach(function (userTask) {
                    this.table.addRow(userTask, ++index);
                    if (userTask.selected) {
                        this.selectRow(this.table.getRows()[index]);
                    }
                }.bind(this));
            }
        },

        onRowCollapse: function (row) {
            var data = row.getData();
            if (data.group) {
                var index = row.getIndex();
                data.userTasks.forEach(function (userTask) {
                    this.table.removeRow(index + 1);
                }.bind(this));
            }
        },

        onRowClick: function (row) {
            var data = row.getData();
             if (!data.selected && data.status === "active") {
                 this.deselectAllRows();
                 this.selectRow(row);
                 this.triggerUserTaskSelected(row.getData());
             }
        },

        expandAllRows: function() {
            var groupRows = [];
            this.table.getRows().forEach(function (row) {
                if (row.getData().group) {
                    groupRows.push(row);
                }
            });
            
            groupRows.forEach(function (row) {
                var data = row.getData();
                if (!data.expanded) {
                    var index = row.getIndex();
                    data.userTasks.forEach(function (userTask) {
                        this.table.addRow(userTask, ++index);
                    }.bind(this));
                    data.expanded = true;
                    row.getCells()[0].updateArrow();
                }
            }.bind(this));
        },

        deselectAllRows: function() {
            this.table.getRows().forEach(function (row) {
                var data = row.getData();
                if (!data.group) {
                     var element = row.view.getElement().getNative();
                     var classList = element.classList;
                     if (classList.contains('ebTableRow_highlighted')) {
                         classList.remove('ebTableRow_highlighted');
                         data.selected = false;
                     }
                }
            }.bind(this));
        },

        getUserTasksGroupByDefinitionKey: function(definitionKey) {
            var userTasks;
            this.currentTableData.some(function(data) {
                if (data.group && data.definitionKey === definitionKey) {
                    userTasks = data.userTasks;
                }
            });
            return userTasks;
        },

        handleData: function (tableData) {
            if (!this.currentTableData) {
                this.handleInitialData(tableData);
            }
            else {
                this.handleNewData(tableData);
            }
        },        

        handleInitialData: function(initialTableData) {
            this.currentTableData = initialTableData;

            if (initialTableData.length === 0) {
                // no data
            }
            else {
                this.table.setData(initialTableData);
                this.expandAllRows();
                
                if (!this.selectedData) {
                    this.selectFirstActiveUserTask();
                }
                return;
            }
        },
        
        handleNewData: function(newTableData) {
            function idsEqual(data1, data2) {
                return data1.id === data2.id;
            }

            var oldTableData = this.currentTableData;  

            // build and set new table data
            this.table.setData(newTableData);
            this.currentTableData = newTableData;

            if (newTableData.length === 0) {
                return;
            }

            // expand all rows and then find previously collapsed rows and collapse them
            this.expandAllRows();
            oldTableData.forEach(function(oldData) {
                var collapseDefnKey;
                if (oldData.group) {
                    newTableData.some(function(newData) {
                        if (oldData.definitionKey === newData.definitionKey) {
                            if (!oldData.expanded) {
                                collapseDefnKey = oldData.definitionKey;
                                return true;
                            }
                        }
                    });
                }
                if (collapseDefnKey) {
                    this.table.getRows().forEach(function (row) {
                        var data = row.getData();
                        if (data.group && data.definitionKey === collapseDefnKey) {
                            var index = row.getIndex();
                            data.userTasks.forEach(function (userTask) {
                                this.table.removeRow(index + 1);
                            }.bind(this));
                            row.getData().expanded = false;
                            row.getCells()[0].updateArrow();
                        }
                    }.bind(this));
                }
            }.bind(this));

            // select first active task if none selected
            if (!this.selectedData) {
                this.selectFirstActiveUserTask();
                return;
            }

            // determine if selected data is present and active
            var selectedData = this.selectedData;
            var selectedDataPresent = false;
            var selectedDataActive = false;
            newTableData.some(function(newData) {
                if (newData.group) {
                    newData.userTasks.some(function(userTask) {
                        if (idsEqual(userTask, selectedData)) {
                            selectedDataPresent = true;
                            if (userTask.status === "active") {
                                selectedDataActive = true;
                            }
                            return;
                        }
                    });
                }
                else {
                    if (idsEqual(newData, selectedData)) {
                        selectedDataPresent = true;
                        if (newData.status === "active") {
                            selectedDataActive = true;
                        }
                        return;
                    }
                }
            }.bind(this));
            
            if (!selectedDataPresent || !selectedDataActive) {
                // This corresponds to situation where it is likely the task was completed in another session.
                // The task form should remain visible until user decides to complete the task at which point
                // an error will be displayed. 
                // This behaviour should be improved in future to provide better UX.
                return;
            }

            // select previously selected row and highlight if visible
            var selectedRow;
            this.table.getRows().some(function (row) {
                var data = row.getData();
                if (data.group) {
                    data.userTasks.some(function(userTask) {
                        if (idsEqual(userTask, selectedData)) {
                            userTask.selected = true;
                            
                            // find row for userTask
                            this.table.getRows().some(function (row) {
                                var rowData = row.getData();
                                if (idsEqual(userTask, rowData)) {
                                    selectedRow = row;
                                    return;
                                }
                            });
                            return;
                        }
                    }.bind(this));
                }
                else {
                    if (idsEqual(data, selectedData)) {
                        selectedRow = row;
                        return;
                    }
                }
            }.bind(this));

            if (selectedRow) {      // visible
                this.selectRow(selectedRow);
            }

            this.trigger('UserTasks:userTaskSelectionUpdated', selectedRow.getData());
        }
        
    });
});
