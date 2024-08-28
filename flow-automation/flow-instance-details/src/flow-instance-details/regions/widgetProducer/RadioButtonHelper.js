define([
    'jscore/core',
    '../../widgets/element/choice/Choice'
], function (core, Choice) {
    'use strict';

    return core.Region.extend({

        init: function (options) {
            this.property = options.property;
            this.radioButtons = [];
        },

        onViewReady: function () {
        },

        onStop: function () {
        },

        setDefaultButton: function () {
            var firstRadioElement = this.property.oneOf[0];
            if (!this.property.default) {
                firstRadioElement.properties[Object.keys(firstRadioElement.properties)[0]].checked = true;
            }
        },

        getRadioButton: function (hidden, schemaData, indentLevel) {
            var radioButton = new Choice({
                hidden: hidden,
                hasNestedObject: schemaData.hasNestedObject,
                property: schemaData.innerProperty,
                isCheckBox: false,
                indentLevel: indentLevel
            });
            radioButton.view.getChoiceElement().addEventHandler('change', this.onRadioButtonCheckedEventHandler.bind(this));
            this.radioButtons.push(radioButton);
            return radioButton;
        },

        onRadioButtonCheckedEventHandler: function (event) {
            for (var i = 0; i < this.radioButtons.length; i++) {
                if (this.radioButtons[i].property.name === event.originalEvent.target.value) {
                    this.checkAndRevealRadioElement(this.radioButtons[i]);
                } else {
                    this.uncheckAndHideRadioElement(this.radioButtons[i]);
                }
            }
        },

        handleChildren: function(hasParent){
            for (var button in this.radioButtons){
                this.radioButtons[button].handleChildWidgets(hasParent);
            }
        },

        checkAndRevealRadioElement: function (checkedRadioElement) {
            checkedRadioElement.property.selectedElement = checkedRadioElement.property.name;
            checkedRadioElement.view.setChecked(true);
            checkedRadioElement.setBooleanValue();

            //Need an array of choice elements to handle 'check and reveal' of nested elements
            var choiceElements = [];
            checkedRadioElement.widgetHolder.forEach(function (element) {
                if (element.hasNestedObject === true) {
                    choiceElements.push(element);

                    // The following checks if the element is a 'choice' element and sets the boolean value
                } else if (element.widgetHolder) {
                    element.setBooleanValue();
                }
                element.view.reveal();
            });
            choiceElements.forEach(function (choiceElement) {
                choiceElement.handleChildWidgets();
            });
        },

        uncheckAndHideRadioElement: function (radioElement) {
            radioElement.property.selectedElement = undefined;
            radioElement.view.setChecked(false);
            radioElement.widgetHolder.forEach(function (element) {
                if (element.hasNestedObject === true) {
                    element.hideInnerWidgets();
                }
                element.hide();
            });
        },

        getSchemaData: function (radioElement) {
            var properties = radioElement.properties;
            var key = Object.keys(properties)[0];
            var innerProperty = properties[key];

            // set default
            if (this.property.default) {
                innerProperty.checked = key === this.property.default;
            }
            var hasNestedObject = false;
            if (innerProperty.type === "object") {
                hasNestedObject = true;
            }
            return {innerProperty: innerProperty, hasNestedObject: hasNestedObject, properties: properties, isRadio: innerProperty.format === 'radio'};
        },

        initializeRadioButtons: function () {
            for (var i = 0; i < this.radioButtons.length; i++) {
                if (this.radioButtons[i].view.getChoiceElement().getNative().checked) {
                    this.checkAndRevealRadioElement(this.radioButtons[i]);
                }
            }
        }
    });
});