/*global define*/
define([
    'jscore/core',
    'template!./_eventSeveritiesSelector.hbs',
    'styles!./_eventSeveritiesSelector.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFlowInstanceDetails-wEventSeveritiesSelector';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getItem: function (elem) {
            return this.getElement().find(__prefix + "-item-" + elem);
        },

        setBackground: function (elem, ebIconClass){
            this.getItem(elem).setAttribute('class', ebIconClass + ' eaFlowInstanceDetails-wEventSeveritiesSelector-item eaFlowInstanceDetails-wEventSeveritiesSelector-item-' + elem);
        },

        shiftIconVisibility: function (elem) {
            var showed = this.getItem(elem).find(__prefix+"-item-icon");
            var hidden = this.getItem(elem).find(__prefix+"-item-icon_hidden");

            showed.getNative().classList.remove("eaFlowInstanceDetails-wEventSeveritiesSelector-item-icon");
            showed.getNative().classList.add("eaFlowInstanceDetails-wEventSeveritiesSelector-item-icon_hidden");

            hidden.getNative().classList.remove("eaFlowInstanceDetails-wEventSeveritiesSelector-item-icon_hidden");
            hidden.getNative().classList.add("eaFlowInstanceDetails-wEventSeveritiesSelector-item-icon");

        }

    });
});