define([
    'jscore/core',
    './AccordionView',
    'widgets/Accordion'
], function (core, View, Accordion) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.name = options.name;
            this.content = options.content;
            this.expanded = options.expanded === undefined ? true : options.expanded;
        },

        onViewReady: function () {
            this.accordionWidget = new Accordion({
                title: this.name,
                expanded: this.expanded,
                content: this.content
            });
            this.accordionWidget.attachTo(this.getElement());
            this.view.setAccordionStyle();
        },

        getContent: function () {
            return this.content;
        }
    });
});
