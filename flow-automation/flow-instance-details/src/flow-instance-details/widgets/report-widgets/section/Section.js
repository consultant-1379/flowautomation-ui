define([
    'jscore/core',
    './SectionView',
    '../../common/info-icon/InfoIcon'
], function (core, View, InfoIcon) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.singleLine = false;
            if (!options.header.properties && !options.header.items) {
                this.singleLine = true;
            }
            this.header = options.header.name;
            this.level = options.level;
        },

        onViewReady: function () {
            if (!this.singleLine) {
                this.view.setSectionHeader(this.header);
            }
            this.view.setSectionLevelCSS(this.level, this.singleLine, this.header);

            if (!!this.options.header.description) {
                this.infoIcon = new InfoIcon({description: this.options.header.description});
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }
        },

        attachWidgets: function (widgets) {
            for (var widget in widgets) {
                widgets[widget].attachTo(this.view.getSectionContent());
            }
        },

        getContents: function () {
            return this.view.getSectionContent();
        },

        onStart: function () {
        },

        onStop: function () {
        },

        createRegion: function (title) {
        }
    });
});