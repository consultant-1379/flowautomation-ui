define([
    'jscore/core',
    'text!./_userTaskReviewPanel.hbs',
    'styles!./_userTaskReviewPanel.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        }
    });
});