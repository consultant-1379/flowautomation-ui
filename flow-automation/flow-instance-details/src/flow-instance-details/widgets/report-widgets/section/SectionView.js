define([
    'jscore/core',
    'template!./_section.hbs',
    'styles!./_section.less'
], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rSection';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setSectionHeader: function (text) {
            return this.getSectionHeader().setText(text);
        },

        getSectionHeader: function () {
            return this.getElement().find(parentEl + '-header');
        },

        getInfoIcon: function(){
            return this.getElement().find(parentEl + '-inner-description');
        },

        setSectionLevelCSS: function (level, singleLine, sectionHeader) {
            switch (level) {
                case 1:
                    this.getSectionHeader().setStyle('font-size', '2.0rem');
                    break;
                case 2:
                    this.getSectionHeader().setStyle('font-size', '1.5rem');
                    break;
                case 3:
                    this.getSectionHeader().setStyle('font-size', '1.17rem');
                    break;
                case 4:
                    this.getSectionHeader().setStyle('font-size', '1rem');
                    this.getSectionContent().setStyle('padding-left', '30px');
                    break;
                default:
                    this.getSectionHeader().setStyle('font-size', '0.83rem');
                    this.getSectionContent().setStyle('padding-left', '30px');
                    break;
            }

            if (singleLine || sectionHeader === '') {
                this.getInnerDiv().setStyle('display', 'none');
            }
        },

        getSection: function () {
            return this.getElement().find(parentEl + '-all');
        },

        getSectionContent: function () {
            return this.getElement().find(parentEl + '-contents');
        },

        getInnerDiv: function () {
            return this.getElement().find(parentEl + '-inner');
        }
    });
});