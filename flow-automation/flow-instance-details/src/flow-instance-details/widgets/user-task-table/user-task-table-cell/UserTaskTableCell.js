define([
    'tablelib/Cell',
    './UserTaskTableCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        View: View,

        ROW_EXPAND: 'user-task-table-cell:expand',
        ROW_COLLAPSE: 'user-task-table-cell:collapse',

        onCellReady: function () {
            var rowData = this.getRow().getData(),
                arrowIcon = this.view.getArrowIcon(),
                element = this.getElement();

            if (rowData.grouped) {
                this.view.getText().setModifier('indent');
            }

            if (rowData.group) {
                element.setStyle('font-style', 'italic');

                this.updateArrow();

                element.addEventHandler('click', function (e) {
                    e.stopPropagation();
                    rowData.expanded = !rowData.expanded;
                    this.updateArrow();
                    this.getTable().trigger(rowData.expanded ? 'user-task-table-cell:expand' : 'user-task-table-cell:collapse', this.getRow());
                }.bind(this));
            }
            else {
                arrowIcon.setModifier('noChild');

                element.addEventHandler('click', function (e) {
                    e.stopPropagation();
                    this.getTable().trigger('user-task-table-cell:clicked', this.getRow());
                }.bind(this));
            }
        },

        setValue: function (value) {
            this.view.getText().setText(value);

            var rowData = this.getRow().getData();
            if (rowData.status && rowData.status.toLowerCase() === "completed") {
                this.view.setTickIcon();
                this.view.disableHoverEffect();
            }
        },

        updateArrow: function () {
            var rowData = this.getRow().getData(), 
                arrowIcon = this.view.getArrowIcon(),
                oldArrowIcon = rowData.expanded ? 'rightArrow' : 'downArrow',
                newArrowIcon = rowData.expanded ? 'downArrow' : 'rightArrow';

            arrowIcon.removeModifier(oldArrowIcon, 'ebIcon');
            arrowIcon.setModifier(newArrowIcon, '', 'ebIcon');
        }
    });
});
