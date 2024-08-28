/*global define*/
define([
    'jscore/core',
    'template!./_flowList.html',
    'styles!./_flowList.less'
], function (core, template, styles) {
    'use strict';
    var __prefix = '.eaFlowCatalog-wFlowList';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getFooter: function () {
            return this.getElement().find(__prefix + '-header');
        },

        hideFooter: function () {
            this.getFooter().setStyle('display', 'none');
        },

        getTable: function () {
            return this.getElement().find(__prefix + '-table');
        },

        getMessageHolder: function () {
            return this.getElement().find(__prefix + '-message');
        },

        getInfoMsgHolder: function () {
            return this.getElement().find(__prefix + '-infoMsgHolder');
        }
    });
});