define([
    'jscore/core',
    './UserTaskMultiSubmitView',
    'i18n!flow-instance-details/dictionary.json',
    'widgets/Button',
    'tablelib/Table',
    'tablelib/plugins/NoHeader',
    'tablelib/plugins/Selection',
    './status-cell/StatusCell',
    'widgets/Notification',

], function (core, View, dictionary, Button, Table, NoHeader, Selection, StatusCell, Notification) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        init: function (options) {
            this.context = options.context;
            this.eventBus = options.eventBus;
            this.usertasks = options.usertasks;
            this.selectedUsertaskId = options.selectedUsertaskId;

            //Set an extra property in the usertasks for the display
            this.usertasks.forEach(function (usertask) {
                usertask.nameExtra = usertask.nameExtra ? usertask.nameExtra : usertask.name;
            });
        },

        onViewReady: function () {
            this.createSelectionButtons();
            this.createAndPopulateUsertasksTable();
            this.view.setUsertaskName(this.usertasks[0].name);
            this.view.setTotalUserTasks(this.usertasks.length);
        },

        createAndPopulateUsertasksTable: function () {
            this.usertasksTable = new Table(getTableOptions());

            this.usertasksTable.addEventHandler('check', this.updateUsertasksCount.bind(this));
            this.usertasksTable.addEventHandler('rowselect', this.updateUsertasksCount.bind(this));

            this.usertasksTable.attachTo(this.view.getUserTasksContainer());

            this.usertasksTable.setData(this.usertasks);

            //Check the already selected usertask.
            this.usertasksTable.checkRows(function (row) {
                return row.getData().id === this.selectedUsertaskId;
            }.bind(this));
            //The even is not triggered by above checkRows call and hence forcing here.
            this.updateUsertasksCount();
        },

        updateUsertasksCount: function () {
            var selectedUsertasksCount = this.getSelectedUsertasks().length;
            this.view.setSelectedUserTasks(selectedUsertasksCount);
            this.eventBus.publish('UserTaskMultiSubmit:selectedUsertasksCount', selectedUsertasksCount);
        },

        createSelectionButtons: function () {
            this.selectAllButton = new Button({
                caption: dictionary.get('userTask.multiSubmit.buttons.selectAll')
            });
            this.selectAllButton.addEventHandler("click", this.selectAllUsertasks.bind(this));
            this.selectAllButton.attachTo(this.view.getSelectAllButtonContainer());

            this.selectNoneButton = new Button({
                caption: dictionary.get('userTask.multiSubmit.buttons.selectNone')
            });
            this.selectNoneButton.addEventHandler("click", this.unselectAllUsertasks.bind(this));
            this.selectNoneButton.attachTo(this.view.getSelectNoneButtonContainer());
        },

        selectAllUsertasks: function () {
            this.usertasksTable.checkRows(function (row) {
                return true;
            });
            this.updateUsertasksCount();
        },
        unselectAllUsertasks: function () {
            this.usertasksTable.uncheckAllRows();
            this.updateUsertasksCount();
        },

        getSelectedUsertasks: function () {
            return this.usertasksTable.getCheckedRows()
                .map(function (row) {
                    return row.getData();
                });
        },

        disableUsertasksSelection: function () {
            this.usertasksTable.disableCheckboxes(function (row) {
                return true;
            });
        },

        submitSelectedUsertasks: function (submissionCallback, usertasksPayload) {
            this.disableUsertasksSelection();
            this.disableSelectionButtons();
            this.view.hideUsertasksFooterNote();

            this.usertasksTable.getCheckedRows().forEach(function (row) {
                row.getCells()[2].setValue('progress');
                //setTimeout(function () {
                submissionCallback(row.getData().id, usertasksPayload)
                    .then(function (response) {
                        row.getCells()[2].setValue('success');
                    }).catch(function (error) {
                    row.getCells()[2].setValue('error');
                    if (this.footerErrorNotification === undefined) {
                        this.setFooterErrorMessage();
                    }
                }.bind(this));
                //}.bind(this), 2500);

            }.bind(this));
        },

        disableSelectionButtons: function () {
            this.selectAllButton.disable();
            this.selectNoneButton.disable();
        },

        setFooterErrorMessage: function () {
            this.footerErrorNotification = new Notification({
                label: dictionary.get('userTask.multiSubmit.footer.errorNotification'),
                color: 'red',
                showCloseButton: false,
                autoDismiss: false
            });
            this.footerErrorNotification.attachTo(this.view.getFooterInformationContainer());
        }
    });

    function getColumns() {
        return [{
            attribute: 'nameExtra',
            sortable: false,
            resizable: false,
            disableVisible: true
        }, {
            attribute: 'submissionStatus',
            sortable: false,
            resizable: false,
            disableVisible: true,
            cellType: StatusCell
        }];
    }

    function getTableOptions() {
        return {
            columns: getColumns(),
            plugins: [new NoHeader(),
                new Selection({
                    checkboxes: true,
                    selectableRows: true,
                    multiselect: Selection.MultiSelectMode.NO_CTRL_SHIFT,
                    bind: true
                })
            ],
            modifiers: [
                {name: 'striped'}
            ]
        };
    }

});
