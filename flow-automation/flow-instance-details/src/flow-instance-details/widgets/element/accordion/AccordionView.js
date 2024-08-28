define([
    'jscore/core',
    'text!./_accordion.hbs'
], function (core, template) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        setAccordionStyle: function () {
            var accordionTitle = this.getElement().find('.ebAccordion-title');
            if (accordionTitle) {
                accordionTitle.setStyle("font-weight", "normal");
                accordionTitle.setStyle("font-size", "1.6rem");
            }
            var accordionHeader = this.getElement().find('.ebAccordion-header');
            if (accordionHeader) {
                accordionHeader.setStyle("box-shadow", "none");
            }
        },

        indent: function (valueToIndent, isConfirmAndReview) {
        },

        indentValue: function (valueToIndent) {
        }
    });
});