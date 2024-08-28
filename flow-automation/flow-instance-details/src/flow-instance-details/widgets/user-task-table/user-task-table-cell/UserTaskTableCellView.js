define([
    'jscore/core',
    'text!./_userTaskTableCell.hbs',
    'styles!./_userTaskTableCell.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFlowInstanceDetails-wUserTaskTableCell';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getArrowIcon: function () {
            return this.getElement().find(__prefix + '-arrowIcon');
        },

        getText: function () {
            return this.getElement().find(__prefix + '-text');
        },

        getTickIcon: function () {
            return this.getElement().find(__prefix + '-tickIcon');
        },

        setTickIcon: function () {
            this.getElement().find(__prefix + '-tickIcon').setAttribute('style', "display : block");
        },

        disableHoverEffect: function () {
            this.getElement().setModifier('noHoverEffect');
        }

    });
});
