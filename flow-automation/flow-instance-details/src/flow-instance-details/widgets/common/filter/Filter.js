define([
    'jscore/core',
    './FilterView',
    'widgets/SelectBox',
    'widgets/Button',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, SelectBox, Button, dictionary) {
    var defaultReportColumn = {
            name: dictionary.get('filter.defaultColumn'),
            value: {attribute: dictionary.get('filter.defaultColumn'), title: dictionary.get('filter.defaultColumn')} ,
            title: dictionary.get('filter.defaultColumn')
        },
        defaultFilterText = dictionary.get('filter.refineResults');
    return core.Widget.extend({

        view: function () {
            return new View({
                defaultFilterText: defaultFilterText
            });
        },

        onViewReady: function () {
            this.initializeReportColumnsDropdown();
            this.initializeFilterText();
            var applyFilterButton = new Button({caption: dictionary.get('filter.apply')});
            applyFilterButton.addEventHandler("click",this.applyFilter.bind(this));
            applyFilterButton.attachTo(this.view.getApplyButton());
        },

        init: function (options) {
            this.filterColumns = options.filterColumns;

        },

        applyFilter: function () {
            this.filterText = this.view.getFilterValue();
            this.trigger('filter:stateChanged', {
                text: this.view.getFilterValue(),
                column: this.ReportColumnsDropdown.getValue().value
            });
        },

        initializeFilterText: function () {
            if (this.filterText) {
                this.view.setFilterText(this.filterText);
            }
        },

        initializeReportColumnsDropdown: function () {
            this.ReportColumnsDropdown = new SelectBox();

            if (this.filterColumns && this.filterColumns.length > 0) {
                var reportCoulmns = [defaultReportColumn];
                this.filterColumns.forEach(function (rc) {
                    reportCoulmns.push({
                        name: rc.title,
                        value: rc,
                        title: rc.title
                    });
                });

                this.ReportColumnsDropdown.setModifier('width_small');
                this.ReportColumnsDropdown.addEventHandler('change', this.onReportColumnChange, this);
                this.ReportColumnsDropdown.attachTo(this.view.getFilterDropDownValue());
                this.ReportColumnsDropdown.setItems(reportCoulmns);

                if (this.selectedColumn) {
                    this.ReportColumnsDropdown.setValue(this.selectedColumn);
                } else {
                    this.ReportColumnsDropdown.setValue(defaultReportColumn);
                }
            }
        },

        onReportColumnChange: function () {
            this.selectedColumn = this.ReportColumnsDropdown.getValue();
            this.filterText = this.view.getFilterValue();
            if (this.filterText) {
                this.trigger('filter:stateChanged', {
                    text: this.filterText,
                    column: this.selectedColumn.value
                });
            }
        }
    });
});