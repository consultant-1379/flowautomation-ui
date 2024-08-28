define([
    'jscore/core',
    'template!./_flowInstanceDetails.hbs',
    'styles!./_flowInstanceDetails.less'

], function (core, template, styles) {
    'use strict';
    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getTabs: function () {
            return this.getElement().find('.eaFlowInstanceDetails-rFlowInstanceDetails-tabs');
        },

        hideTab: function (tabName) {
            this._tabVisibilityHandler(tabName, "none");
        },

        showTab: function (tabName) {
            this._tabVisibilityHandler(tabName, "inherit");
        },

        _tabVisibilityHandler: function(tabName, action) {
            var tab = this.getElement().findAll('.ebTabs-tabItem').find(function (tab) {
                return tab.getText() === tabName;
            });
            if (tab) {
                tab.setStyle("display", action);
            }
        },

        getSummary: function () {
            return this.getElement().find('.eaFlowInstanceDetails-rFlowInstanceDetails-summary');
        }
    });
});