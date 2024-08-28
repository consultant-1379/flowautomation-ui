define([
    'jscore/core',
    './TextLineView',
    'widgets/Tooltip',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, Tooltip, Dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                view: Dictionary.links.view
            });
        },

        init: function (options) {
            this.data = options;
        },

        setLineText: function (data) {
            this.view.setTextName(data.name);
            if (!data.isValueEmpty && this.isPropertyFormatLink(data.format)) {
                this.view.setLinkValue(this.getLinkText(data.format), data.value);
                if (data.tooltip) {
                    var toolTip = new Tooltip({
                        parent: this.view.getTextValue(),
                        content: data.tooltip,
                        width: 200
                    });
                    toolTip.enable();
                }
            } else {
                this.view.setTextValue(data.value);
            }
        },

        setWidth: function (maxWidth) {
            this.view.setNameWidth(maxWidth);
        },

        setGenericWidth: function () {
            this.view.setGenericWidth();
        },

        getElement: function () {
            return this.view.getElement();
        },

        setStyleForSummary: function () {
            this.view.styleForSummary();
        },

        isPropertyFormatLink: function (format) {
            return format && (format === 'link' || format === 'download-link');
        },

        getLinkText: function (format) {
            return format === 'link' ? Dictionary.links.view : Dictionary.links.download;
        },
    });
});