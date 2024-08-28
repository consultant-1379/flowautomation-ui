define([
    'jscore/core',
    'template!./_reportTable.hbs',
    'styles!./_reportTable.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rTable';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getTableHeader: function () {
            return this.getElement().find(parentEl + '-topPanel-header-text');
        },

        setTableHeader: function (text) {
            return this.getTableHeader().setText(text);
        },

        getFilter: function(){
            return this.getElement().find(parentEl + '-topPanel-filter');
        },

        setTableHeaderFont: function (level, headerless){
            if (headerless){
                level -= 1;
            }

            switch(level) {
                case 1:
                    this.getTableHeader().setStyle('font-size', '2.0rem');
                    break;
                case 2:
                    this.getTableHeader().setStyle('font-size', '1.5rem');
                    break;
                case 3:
                    this.getTableHeader().setStyle('font-size', '1.17rem');
                    break;
                case 4:
                    this.getTableHeader().setStyle('font-size', '1rem');
                    break;
                default:
                    this.getTableHeader().setStyle('font-size', '0.83rem');
                    break;
            }
        },

        getTable: function () {
            return this.getElement().find(parentEl + '-table');
        }
    });
});