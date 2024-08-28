define([
    'jscore/core',
    './ReportTextView',
    '../textLine/TextLine',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, TextLine, dictionary) {
    'use strict';

    function _createTextLine(view, schema, line, width, isAllWidth) {
        var lineData = {
            name: schema.name + ':',
            value: dictionary.get("genericValues.noValueSupplied"),
            isValueEmpty: true,
            format: schema.format ? schema.format : null,
            tooltip: schema.description ? schema.description : null
        };
        if (line === 0 || !!line) {
            lineData.value = line;
            lineData.isValueEmpty = false;
        }

        var lineWidget = new TextLine();
        lineWidget.attachTo(view.getFullText());
        lineWidget.setLineText(lineData);
        if(isAllWidth){
            lineWidget.setGenericWidth(width);
        }else{
            lineWidget.setWidth(width);
        }
    }

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.schema = options.schema;
            this.data = options.data;
        },

        onViewReady: function () {
            var lines = this.data;
            if (this.schema.properties && (typeof this.schema.properties === 'object')) {
                this.schema = this.schema.properties;
            }
            if (typeof lines === 'object') {
                var maxCharacters = this._numberLargestField(0);
                for (var l in this.schema) {
                    _createTextLine(this.view, this.schema[l], lines[l], maxCharacters);
                }
            } else {
                _createTextLine(this.view, this.schema, lines, this.schema.name.length, true);
            }
        },

        _numberLargestField: function (maxChar) {
            for (var l in this.schema) {
                if (this.schema[l].name.length > maxChar) {
                    maxChar = this.schema[l].name.length;
                }
            }
            return maxChar;
        }
    });
});