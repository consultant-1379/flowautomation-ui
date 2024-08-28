define([
    'jscore/core',
    'template!./_filter.hbs',
    'styles!./_filter.less'
], function (core, template, styles) {
    var parentEl = '.eaFlowInstanceDetails-wfilter';
    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getFilterEl: function () {
            return this.getElement().find(parentEl + '-filterTextBox-input');
        },

        getFilterDropDownValue: function () {
            return this.getElement().find(parentEl + '-dropdown');
        },


        getApplyButton: function () {
            return this.getElement().find(parentEl + '-apply');
        },

        getFilterValue: function () {
            return this.getFilterEl().getProperty('value').trim();
        },

        setFilterText: function (text) {
            this.getFilterEl().setValue(text);
        }
    });
});