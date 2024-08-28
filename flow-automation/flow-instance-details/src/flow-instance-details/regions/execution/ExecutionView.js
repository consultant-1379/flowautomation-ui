define([
    'jscore/core',
    'template!./_execution.hbs',
    'styles!./_execution.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rUserTask';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getReportContent: function () {
            return this.getElement().find(parentEl + '-execution');
        }
    });
});