define([
    'jscore/core',
    'uit!./_tableSettings.hbs',
    'i18n!flow-automation-lib/dictionary.json'
], function (core, View, dictionary) {

    return core.Widget.extend({
        view: function () {
            return new View({
                settings: {
                    columns: this.options.columns,
                    selectDeselectAll: this.options.selectDeselectAll
                },
                apply: dictionary.tableSettings.apply,
                cancel: dictionary.tableSettings.cancel
            });
        },

        onViewReady: function () {
            this.view.findById("apply").addEventHandler('click', function () {
                var settings = this.view.findById("settings");
                this.options.button.onTableSettingsApply(settings.getUpdatedColumns());
            }.bind(this));

            this.view.findById("cancel").addEventHandler('click', function () {
                this.options.button.onTableSettingsCancel();
            }.bind(this));
        }
    });
});