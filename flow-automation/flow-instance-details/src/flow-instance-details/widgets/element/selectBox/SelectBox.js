define([
    'jscore/core',
    'widgets/SelectBox',
    './SelectBoxView',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, SelectBox, View, Info, utils, InfoIcon) {

    'use strict';
    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.booleanValue = false;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.createLabel();
            this.createSelectBox();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }
            this._setInfo();
        },

        createLabel: function () {
            this.view.getLabel().setText(utils.concatIfExist(this.property.name, this.property.nameExtra));
        },

        createSelectBox: function () {
            var enumItems;
            if (this.property.enumNames) {
                enumItems = this.property.enumNames;
            } else {
                enumItems = this.property.enum;
            }
            this.getDropDownItems(enumItems);
            var indexOfDefault = 0;
            if (this.property.default) {
                indexOfDefault = this.property.enum.indexOf(this.property.default);
            }
            this.selectBox = new SelectBox({
                value: this.dropDownItems[indexOfDefault],
                width:'auto',
                items: this.dropDownItems,
                modifiers: [{
                    width: 'full'
                }]
            });
            this.selectBox.attachTo(this.view.getSelectBox());

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }
        },

        getDropDownItems: function (enumItems) {
            this.dropDownItems = [];
            for (var itemIndex = 0; itemIndex < enumItems.length; itemIndex++) {
                this.dropDownItems.push(
                    {
                        name: enumItems[itemIndex],
                        title: enumItems[itemIndex],
                        value: this.property.enum[itemIndex]
                    });
            }
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
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
            this.property.returnValue = this.selectBox.getValue().value;
        }

    });
});