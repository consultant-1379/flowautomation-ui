define([
    'jscore/core',
    './ChoiceView',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, Info, utils, InfoIcon) {

    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({isCheckBox: this.isCheckBox});
        },

        init: function (options) {
            this.property = options.property;
            this.booleanValue = false;
            this.hasNestedObject = options.hasNestedObject;
            this.widgetHolder = [];
            this.hidden = options.hidden;
            this.isCheckBox = options.isCheckBox;
            this.indentLevel = options.indentLevel;
            this.isChild = false;
        },

        onViewReady: function () {
            this.view.setLabel(utils.concatIfExist(this.property.name, this.property.nameExtra));
            // Setting 'value' here to be used by the change event in order to know which radio button is checked
            this.view.setValue(this.property.name);
            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }
            if (this.property.default === "true" || this.property.default === true || this.property.checked === true) {
                this.view.getChoiceElement().setAttribute('checked');
                this.setBooleanValue();
            }
            if (this.hasNestedObject === true) {
                this.view.getChoiceElement().addEventHandler('change', this.handleChildWidgets.bind(this));
            } else {
                this.view.getChoiceElement().addEventHandler('change', this.setBooleanValue.bind(this));
            }
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }

            this._setInfo();
        },

        handleChildWidgets: function (hasParent) {
            this.setBooleanValue();
            var widgetNumber = 0;
            for (var widgetIndex in this.widgetHolder) {
                widgetNumber++;
                if (this.view.getChoiceElement().getProperty('checked') && (hasParent !== true || this.hidden !== true)) {
                    if (hasParent !== true) {
                        // Remove extra padding which was added to parent checkbox
                        this.view.removePaddingOnParent();
                    }
                    this.widgetHolder[widgetIndex].reveal();
                    if (widgetNumber === this.widgetHolder.length) {
                        // If last child element add extra padding
                        this.widgetHolder[widgetIndex].padBottom();
                    }
                    if (this.widgetHolder[widgetIndex].hasNestedObject === true) {
                        this.widgetHolder[widgetIndex].handleChildWidgets();
                    }
                } else {
                    this.widgetHolder[widgetIndex].hide();
                    if (this.widgetHolder[widgetIndex].hasNestedObject === true) {
                        this.widgetHolder[widgetIndex].hideInnerWidgets();
                    }
                    // When un-checking a parent checkbox, if this was itself a child, put back in the padding after children are hidden.
                    if (widgetNumber === this.widgetHolder.length) {
                        if (this.isChild) {
                            this.padBottom();
                        }
                    }
                }
            }
        },

        hideInnerWidgets: function () {
            for (var innerWidgetIndex in this.widgetHolder) {
                this.widgetHolder[innerWidgetIndex].hide();
                if (this.widgetHolder[innerWidgetIndex].hasNestedObject === true) {
                    this.widgetHolder[innerWidgetIndex].hideInnerWidgets();
                }
            }
        },


        _setInfo: function () {
            this.info = new Info({text: this.property.info, indentLevel: this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        setChecked: function (value) {
            this.view.setChecked(value);
            this.setBooleanValue();
        },

        setBooleanValue: function () {
            this.booleanValue = this.view.getChoiceElement().getProperty('checked');
        },

        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
            this.isChild = true;
        },

        getValue: function () {
            this.property.returnValue = this.booleanValue;
        }
    });
});