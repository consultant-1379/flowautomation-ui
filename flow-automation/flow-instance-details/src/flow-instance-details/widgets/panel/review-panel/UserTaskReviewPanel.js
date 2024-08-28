define([
    'jscore/core',
    './UserTaskReviewPanelView',
    '../../element/accordion/Accordion',
    '../../../regions/review-subpanel/ReviewSubpanel',
    '../../common/enums/linkTypes'
], function (core, View, Accordion, ReviewSubpanel, linkType) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.schemaForTask = options.schemaForTask;
            this.onlyLastExpanded = options.onlyLastExpanded === undefined ? false : options.onlyLastExpanded;
            this.indentLevel = 0;
        },

        onViewReady: function () {
            this.widgetElements = [];
            this.generateElements();
        },

        generateElements: function () {
            var propertyKeys = Object.keys(this.schemaForTask.properties);
            propertyKeys.forEach(function (key, i) {
                var property = this.schemaForTask.properties[key];
                if (property.type === 'object') {
                    this.createAccordion(property, !(this.onlyLastExpanded && i !== propertyKeys.length - 1));
                }
            }.bind(this));
            this.indentContents();
        },

        createAccordion: function (taskProperties, expanded) {
            var accordion = new Accordion({
                name: taskProperties.name,
                expanded: expanded,
                content: new ReviewSubpanel({
                    schemaForSubpanel: taskProperties,
                    isConfirmAndReview: true
                })
            });
            this.widgetElements.push(accordion);
        },

        indentContents: function () {
            var maxIndent = 0;
            this.widgetElements.forEach(function (element) {
                if (element.getContent().getMaxIndent() > maxIndent) {
                    maxIndent = element.getContent().getMaxIndent();
                }
            });
            this.widgetElements.forEach(function (element) {
                element.getContent().indentContents(maxIndent);
            });
        }
    });
});
