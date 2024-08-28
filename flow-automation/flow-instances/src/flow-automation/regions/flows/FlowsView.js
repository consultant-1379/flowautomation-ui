define([
    'jscore/core',
    'template!./_flows.hbs',
    'styles!./_flows.less'

], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getListHolder: function () {
            return this.getElement().find('.eaFlowAutomation-rFlows-flowList');
        },

        removeBordersInList: function () {
            var allRows = this.getElement().findAll('.ebTableRow');
            for (var row in allRows) {
                allRows[row].setStyle('border-bottom', 'none');
            }
            var allCells = this.getElement().findAll('.ebTableCell');
            for (var cell in allCells) {
                allCells[cell].setStyle('border-right', 'none');
                allCells[cell].setStyle('overflow', 'unset');
            }
        }
    });

});