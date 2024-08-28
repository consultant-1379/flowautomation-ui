define([
    'jscore/core',
    './IntegerView',
    'widgets/Spinner',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, Spinner, Info, utils, InfoIcon) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.createLabel();
            this.createSpinner();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

            this._setInfo();
        },

        createLabel: function () {
            this.view.setLabel(utils.concatIfExist(this.property.name, this.property.nameExtra));
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        createSpinner: function () {
            this.spinnerWidget = new Spinner({
                compact: true,
                min: this.property.minimum,
                max: this.property.maximum,
                value: this.property.default
            });
            this.spinnerWidget.attachTo(this.view.getSpinnerHolder());
        },

        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        getValue: function () {
            this.property.returnValue = this.spinnerWidget.getValue();
        }
    });
});
