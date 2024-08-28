define([
    'jscore/core',
    './DateTimeView',
    'i18n!flow-instance-details/dictionary.json',
    'widgets/Dialog',
    'widgets/PopupDatePicker',
    '../../common/info/Info',
    '../../common/info-icon/InfoIcon'
], function (core, View, dictionary, Dialog, PopupDatePicker, Info, InfoIcon) {

    'use strict';
    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.key = options.key;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
            this.required = options.required;
        },

        onViewReady: function () {
            this._createPopupDatePicker();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.view.hide();
            }

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

            this._setInfo();
        },

        _createPopupDatePicker: function () {
            this.dateTime = new PopupDatePicker({
                compact: false,
                showTime: true,
                utc: true,
                placeholder: "Please select date and time"
            });

            this.dateTime.attachTo(this.view.getStartDateTimeSelector());

            if (this.property.default) {
                this.dateTime.setValue(new Date(this.property.default));
            }

            this.dateTime.addEventHandler("dateselect", function () {
                this.view.setDefaultValue(this.dateTime.getValue());
            }.bind(this));

        },

        _setInfo: function () {
            this.info = new Info({text: this.property.info, indentLevel: this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },


        hide: function () {
            this.view.hide();
            this.error = false;
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        getValue: function () {
            var dateTimeValue = this.dateTime.getValue();
            if (dateTimeValue) {
                this.property.returnValue = new Date(this.dateTime.getValue());
            }
        }
    });
});