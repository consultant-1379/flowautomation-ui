define([
    'jscore/core',
    'template!./_confirmNavigation.hbs',
    'styles!./_confirmNavigation.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wUserTaskConfirmNavigation';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (classId) {
            return this.getElement().find(parentEl + classId);
        },

        getInputElement: function () {
            return this.getViewElement('-input');
        },

        isChecked: function () {
            return this.getInputElement().getProperty('checked');
        }
    });
});