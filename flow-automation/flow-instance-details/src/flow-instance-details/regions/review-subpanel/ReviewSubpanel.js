define([
    'jscore/core',
    './ReviewSubpanelView',
    '../../widgets/element/label/Label',
    '../../widgets/common/enums/linkTypes'
], function (core, View, Label, linkType) {
    'use strict';

    return core.Region.extend({

        View: View,

        init: function (options) {
            this.schemaForSubpanel= options.schemaForSubpanel;
            this.isConfirmAndReview = options.isConfirmAndReview;
            this.indentLevel = 0;
        },

        onViewReady: function () {
            this.regionElements = [];
            this.generateElements(this.schemaForSubpanel);
            this.attachElementsToRegion(this.regionElements);
        },

        generateElements: function (schema) {
            var properties = schema.properties;
            for (var prop in properties) {
                if (properties[prop].type === 'object') {
                    this.handleObjectProperties(properties[prop]);
                } else if (properties[prop].type === 'array') {
                    if (properties[prop].format && properties[prop].format === "email") {
                        this.handleSimpleProperties(properties[prop]);
                    } else {
                        this.handleArrayProperties(properties[prop]);
                    }
                } else {
                    this.handleSimpleProperties(properties[prop]);
                }
            }
        },

        isMessage: function(taskProperties) {
            return taskProperties.format === 'message-error' || taskProperties.format === 'message-warning' || taskProperties.format === 'message-info';
        },

        handleSimpleProperties: function (taskProperties) {
            if (!this.isMessage(taskProperties)) {
                this.createLabel(taskProperties);
            }
        },

        handleArrayProperties: function (taskProperties) {
            if (taskProperties.format && taskProperties.format === 'select-table') {
                this.createLabel(taskProperties, linkType.TABLE);
            } else if (taskProperties.format && taskProperties.format === 'table' && taskProperties.readOnly === true) {
                this.createLabel(taskProperties, linkType.TABLE);
            } else if(taskProperties.format && taskProperties.format === 'list' && taskProperties.readOnly === true){
                this.createLabel(taskProperties, linkType.LIST);
            }
        },

        handleObjectProperties: function (taskProperties, nestedObject) {
            if (!taskProperties.format || taskProperties.format === 'informational') {
                /**
                 * For wrapping headers around an object we need to know if the header is itself an object within an object
                 * To do this we use the nestedObject parameter
                 * In the initial loop of generateElements this will be undefined
                 * In the recursive loop of generateElements this will be true, if true all headers are defined as h4
                 */
                this.createLabel(taskProperties);
                this.indentLevel++;
                this.generateElements(taskProperties);
                this.indentLevel--;
            } else if (taskProperties.format === "checkbox" || taskProperties.format === 'radio') {
                this.createLabel(taskProperties);
                this.indentLevel++;
                this.generateElements(taskProperties);
                this.indentLevel--;
            } else {
                this.createLabel(taskProperties);
            }
        },

        createLabel: function (taskProperties, linkType) {
            this.regionElements.push(new Label({
                property: taskProperties,
                linkType: linkType,
                isConfirmAndReview: this.isConfirmAndReview,
                indentLevel: this.indentLevel,
                nestedObject: true
            }));
        },

        attachElementsToRegion: function (formElements) {
            this.maxIndent = 0;
            formElements.forEach(function (element) {
                element.attachTo(this.getElement());
                element.view.indent(element.indentLevel * 28, element.isConfirmAndReview);
                if (element.indentLevel > this.maxIndent) {
                    this.maxIndent = element.indentLevel;
                }
            }.bind(this));
        },

        getMaxIndent: function() {
            return this.maxIndent;
        },

        indentContents: function(maxIndent) {
            this.regionElements.forEach(function (element) {
                element.view.indentValue((maxIndent - element.indentLevel) * 28);
            });
        }
    });
});
