define([
    "jscore/core",
    "./TableSettingsButtonView",
    'container/api',
    '../table-settings/TableSettings'
], function (core, View, container, TableSettings) {

    return core.Widget.extend({
        view: function () {
            return new View(this.options);
        },

        onViewReady: function () {
            this.tableSettings = new TableSettings({
                context: this.options.context,
                columns: this.options.columns,
                button: this,
                selectDeselectAll: this.options.selectDeselectAll
            });
            this.addClickEvent();
        },

        addClickEvent: function(){
            this.clickId = this.getElement().addEventHandler("click", function () {
                container.getEventBus().publish('flyout:show', {
                    header: this.options.header,
                    content: this.tableSettings
                });

            }.bind(this));
        },

        onTableSettingsApply: function (columns) {
            container.getEventBus().publish("flyout:hide");
            this.trigger("tablesettings:changed", columns);
        },

        onTableSettingsCancel: function () {
            container.getEventBus().publish("flyout:hide");
        },

        enableButton: function () {
            if (!this.clickId) {
                this.addClickEvent();
                this.view.enableSettingsButton();
            }
        },

        disableButton: function () {
            if (this.clickId) {
                this.getElement().removeEventHandler(this.clickId);
                this.clickId = null;
            }
            this.view.disableSettingsButton();
        }
    });
});