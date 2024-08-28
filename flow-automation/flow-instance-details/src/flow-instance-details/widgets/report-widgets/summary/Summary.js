define([
    'jscore/core',
    './SummaryView',
    'container/api',
    'i18n!flow-instance-details/dictionary.json',
    '../textLine/TextLine',
    '../../common/info-icon/InfoIcon'
], function (core, View, container, dictionary, TextLine, InfoIcon) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.schema = options.schema;
            this.data = options.data;
            this.level = options.level;
            this.headerless = options.headerless;
            this.shortInfo = options.schema.description;
        },

        onViewReady: function () {
            var summary = this.schema.properties;
            for (var valueOfMember in summary) {
                var lineData = {
                    name: summary[valueOfMember].name,
                    value: dictionary.get("genericValues.noValueSupplied"),
                    isValueEmpty: true,
                    format: summary[valueOfMember].format ? summary[valueOfMember].format : null,
                    tooltip: summary[valueOfMember].description
                };
                if (this.data[valueOfMember] === 0 || !!this.data[valueOfMember]) {
                    lineData.value = this.data[valueOfMember];
                    lineData.isValueEmpty = false;
                }
                var lineWidget = new TextLine();
                lineWidget.attachTo(this.view.getValueDiv());
                lineWidget.setLineText(lineData);
                lineWidget.setStyleForSummary();
            }

            this.view.setSummaryHeader(this.schema.name);
            this.view.setSummaryHeaderFont(this.level, this.headerless);

            if (!!this.shortInfo) {
                this.infoIcon = new InfoIcon({description : this.shortInfo});
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }
        }
    });
});