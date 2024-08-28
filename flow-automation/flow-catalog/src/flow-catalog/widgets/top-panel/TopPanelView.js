define([
    'jscore/core',
    'template!./_topPanel.hbs',
    'styles!./_topPanel.less',
    'i18n!flow-catalog/dictionary.json',
], function (core, template, styles, dictionary) {

    return core.View.extend({

        getTemplate: function () {
            return template({
                dictionary: dictionary
            });
        },

        getStyle: function () {
            return styles;
        },

        getFilterByNameEl: function () {
            return this.getElement().find('.eaFlowCatalog-wTopPanel-Sections-filterByName');
        },

        getFilterByNameValue: function () {
            return this.getFilterByNameEl().getProperty('value').trim();
        },

        setEmptyFilterByNameValue: function () {
            this.getFilterByNameEl().setValue('');
        }
    });
});