define([
    'jscore/core',
    'text!./_userTaskTable.hbs',
    'styles!./_userTaskTable.less'
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
