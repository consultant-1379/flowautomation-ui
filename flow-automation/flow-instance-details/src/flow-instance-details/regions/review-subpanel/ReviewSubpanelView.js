define([
    'jscore/core',
    'text!./_reviewSubpanel.hbs'
], function (core, template) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        }
    });
});