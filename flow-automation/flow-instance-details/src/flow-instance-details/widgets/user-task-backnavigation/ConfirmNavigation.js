define([
    'jscore/core',
    'jscore/ext/net',
    './ConfirmNavigationView',
    'i18n!flow-instance-details/dictionary.json'
], function (core, net, View, dictionary) {
    return core.Widget.extend({

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        init: function (options) {
            this.options = options;
        },

        isRememberUserActionChecked: function () {
            return this.view.isChecked();
        }
    });
});