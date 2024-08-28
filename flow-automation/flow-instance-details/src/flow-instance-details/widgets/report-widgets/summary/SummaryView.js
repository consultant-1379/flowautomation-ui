define([
    'jscore/core',
    'template!./_summary.hbs',
    'styles!./_summary.less'
], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rSummary';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setSummaryHeaderFont: function (level, headerless) {
            if (headerless) {
                level -= 1;
                this.getInnerDiv().setStyle('display', 'none');
            }

            switch (level) {
                case 1:
                    this.getSummaryHeader().setStyle('font-size', '2.0rem');
                    break;
                case 2:
                    this.getSummaryHeader().setStyle('font-size', '1.5rem');
                    break;
                case 3:
                    this.getSummaryHeader().setStyle('font-size', '1.17rem');
                    break;
                case 4:
                    this.getSummaryHeader().setStyle('font-size', '1rem');
                    break;
                default:
                    this.getSummaryHeader().setStyle('font-size', '0.83rem');
                    break;
            }
        },

        getSummaryHeader: function () {
            return this.getElement().find(parentEl + '-header');
        },

        setSummaryHeader: function (text) {
            return this.getSummaryHeader().setText(text);
        },

        getValueDiv: function () {
            return this.getElement().find(parentEl + '-summary');
        },

        getInnerDiv: function () {
            return this.getElement().find(parentEl + '-inner');
        },

        getInfoIcon: function(){
            return this.getElement().find(parentEl + '-inner-description');
        }
    });
});