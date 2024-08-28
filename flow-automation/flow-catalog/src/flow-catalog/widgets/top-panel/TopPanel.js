define([
    'jscore/core',
    './TopPanelView',
    'widgets/MultiSelectBox',
    'i18n!flow-catalog/dictionary.json'
], function (core, View, MultiSelectBox, dictionary) {

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            //event handlers
            this.view.getFilterByNameEl().addEventHandler("keyup", this.applyFilter.bind(this));
        },

        applyFilter: function () {
            this.trigger('flowFilter:changed', this.getTopPanelCurrentState());
        },

        getTopPanelCurrentState: function () {
            var filterText = this.view.getFilterByNameValue();
            return {
                nameFilter: filterText
            };
        },

        clearTextBoxFilter: function () {
            this.view.setEmptyFilterByNameValue();
        }
    });
});