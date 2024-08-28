/*global define*/
define([
    'jscore/core',
    'template!./_eventFilter.hbs',
    'styles!./_eventFilter.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFlowInstanceDetails-wEventFilter';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getViewElement: function (classId) {
            return this.getElement().find(__prefix + classId);
        },

        getStyle: function () {
            return styles;
        },

        getStartDateTime: function () {
            return this.getElement().find(__prefix + '-group-div-startDateTime');
        },

        getEndDateTime: function () {
            return this.getElement().find(__prefix + '-group-div-endDateTime');
        },

        getResourceValue: function () {
            return this.getElement().find(__prefix + '-group-div-resource-input').getValue();
        },

        getSeverities: function () {
            return this.getElement().findAll(".ebCheckbox")
                .filter(function (checkBox) {
                    return checkBox.getNative().checked;
                })
                .map(function (checkBox) {
                    return checkBox.getValue();
                });
        },

        checkCheckBox: function (severities) {
            this.getElement().findAll(".ebCheckbox").forEach(function (element) {
                var find = severities.find(function (severity) {
                    return severity === element.getValue();
                });
                if(find){
                    element.getNative().checked = true;
                }
            });
        },

        setResource: function (text) {
            this.getElement().find(__prefix + '-group-div-resource-input').setValue(text);
        },

        setMessage: function (text) {
            this.getElement().find(__prefix + '-group-div-message-input').setValue(text);
        },

        getMessageValue: function () {
            return this.getElement().find(__prefix + '-group-div-message-input').getValue();
        },

        getCancelButton: function () {
            return this.getElement().find(__prefix + '-group-div-actions-cancel');
        },

        getApplyButton: function () {
            return this.getElement().find(__prefix + '-group-div-actions-apply');
        }

    });
});