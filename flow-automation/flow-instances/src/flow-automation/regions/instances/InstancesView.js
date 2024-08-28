define([
    'jscore/core',
    'template!./_instances.hbs',
    'styles!./_instances.less'

], function (core, template, styles) {
    'use strict';
    var parent = '.eaFlowAutomation-rInstances';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getStatsHolder: function () {
            return this.getElement().find(parent + '-statistics');
        },

        showStatsHolder: function () {
            return this.getStatsHolder().setStyle('display', 'block');
        },

        getTableHolder: function () {
            return this.getElement().find(parent + '-tableHolder');
        },

        getMyInstances: function () {
            return this.getElement().find(parent + '-myInstances-button');
        },

        getMyInstancesValue: function () {
            return this.getElement().find(parent + '-myInstances-value');
        },

        setMyInstancesToChecked: function () {
            return this.getElement().find(parent + '-myInstances-value').setProperty('checked', true);
        },

        showMyInstances: function () {
            this.getElement().find(parent + '-myInstances').setStyle('display', 'block');
        },

        hideTable: function () {
            this.getTableHolder().setStyle('display', 'none');
        },

        showTable: function () {
            this.getTableHolder().setStyle('display', 'block');
        },

        getNoInstancesFound: function () {
            return this.getElement().find(parent + '-noInstancesWarning');
        },

        getDefaultHeader: function () {
            return this.getElement().find(parent + '-defaultHeader');
        },

        showDefaultHeader: function () {
            this.getDefaultHeader().setStyle('display', 'block');
        },

        getTableSettings: function () {
            return this.getElement().find(parent + '-tableSettings');
        },

        hideNoInstancesFound: function () {
            this.getNoInstancesFound().setStyle('display', 'none');
        },

        showNoInstancesFound: function () {
            this.getNoInstancesFound().setStyle('display', 'block');
        }
    });
});