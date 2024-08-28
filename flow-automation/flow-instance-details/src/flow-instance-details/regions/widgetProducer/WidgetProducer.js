define([
    'jscore/core',
    '../../widgets/element/text/Text',
    '../../widgets/element/label/Label',
    '../../widgets/element/message/Message',
    '../../widgets/element/choice/Choice',
    '../../widgets/element/fileInput/FileInput',
    '../../widgets/element/selectBox/SelectBox',
    './RadioButtonHelper',
    '../../widgets/element/integer/Integer',
    '../../widgets/element/listBox/ListBox',
    '../../widgets/element/DateTime/DateTime',
    '../../widgets/element/popup-table/PopupTableButton',
    '../../widgets/element/popup-table/table/PopupTable',
    '../../widgets/element/email/Email',
    '../../widgets/element/link/Link',
    '../../widgets/element/readonly/ReadOnly'
], function (core, Text, Label, Message, Choice, FileInput, SelectBox, RadioButtonHelper, Integer, ListBox, DateTime, PopupTableButton, PopupTable, Email, Link, ReadOnly) {
    'use strict';



    return core.Region.extend({

        init: function (options) {
            this.schemaForTask = options.schemaForTask;
            this.indentLevel = 0;
        },

        onViewReady: function () {
            this.widgetElements = [];
            this.shouldHeaderBePrinted = Object.keys(this.schemaForTask.properties).length > 1;
            this.generateElements(this.schemaForTask, false);
        },

        /*
        schema: the user task json schema given to us by the service. It is taken from the user input schema in the flow. It describes the widgets which are to be rendered
        hidden: used to let the individual widgets know whether or not they should be hidden when rendered. This facilitates the optional/choice cases i.e. checkbox or radio buttons with nested objects
        isCheckBoxFlow: used to differentiate between radio buttons and checkboxes when adding the nested child elements
        parentRadio: in the case where a radio button is an object, and not just a boolean, the instance is passed into the recursive calls so that the child widgets can be added to its 'widgetHolder' array
        parentCheckBox: in the case where a check box is an object, and not just a boolean, the instance is passed into the recursive calls so that the child widgets can be added to its 'widgetHolder' array
        skipLabel: in the case of radio buttons that have an object, the name of the object is used for the name on the radio button, therefore skip creating a label
        required: Text Boxes need the required property for inline validation.
         */
        generateElements: function (schema, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel) {
            var properties = schema.properties;
            var required;
            for (var prop in properties) {
                if (schema.required) {
                    required = schema.required.indexOf(prop) > -1;
                }
                var taskProperties = properties[prop];

                this.generateElementBasedonTypeAndFormat(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel, required);
            }
        },

        addElements: function (element, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            if (parentCheckBox) {
                parentCheckBox.widgetHolder.push(element);
            }
            if (hidden && parentRadio && isCheckBoxFlow === false) {
                parentRadio.widgetHolder.push(element);
            }
            this.widgetElements.push(element);
        },

        handleFileObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            var fileInput = new FileInput({
                property: taskProperties,
                hidden: hidden,
                indentLevel: this.indentLevel
            });
            this.addElements(fileInput, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
        },

        handleDateTimeObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            var dateTimeElement;
            if(taskProperties.readOnly && taskProperties.readOnly === true){
                dateTimeElement = this.getReadOnlyElement(taskProperties, hidden);
            }else {
                dateTimeElement = new DateTime({
                    property: taskProperties,
                    hidden: hidden,
                    indentLevel: this.indentLevel
                });
            }
            this.addElements(dateTimeElement, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
        },

        handleCheckBoxWithObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            var localCheckBox = new Choice({
                property: taskProperties,
                hidden: hidden,
                hasNestedObject: true,
                isCheckBox: true,
                indentLevel: this.indentLevel
            });
            this.addElements(localCheckBox, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);

            //Setting these values as we are about to recurse
            this.indentLevel++;
            this.shouldHeaderBePrinted = true;

            //Recursive call, passing the schema, hidden equal to false with contains the default parameter and will be check it
            hidden = String(taskProperties.default).toLowerCase() === "true"; // validation if contains default this means the checkbox need be selected
            localCheckBox.setChecked(hidden);
            this.generateElements(taskProperties, !hidden, true, parentRadio, localCheckBox);

            this.indentLevel--;
        },

        handlerInformationalObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {

            var element;
            switch (taskProperties.type) {
                case "array":
                    this.handleInformationalArrayObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                    break;
                case "object":
                    this.handleInformationalObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                    break;
                default:
                     element = new Label({
                        property: taskProperties,
                        hidden: hidden,
                        indentLevel: this.indentLevel,
                        header: true
                    });
            }

            this.addElements(element, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
            this.indentLevel++;

            //Recursive call
            this.generateElements(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
            this.indentLevel--;
        },

        handlerObjectWithoutFormat: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel) {
            if (taskProperties.format) return; // return with contains some value

            var element;
            switch (taskProperties.type) {
                case "array":
                    this.handleInformationalArrayObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                    break;
                default:
                    if (this.shouldHeaderBePrinted && !skipLabel) {
                        var headerLabel = new Label(
                            {
                                property: taskProperties,
                                hidden: hidden,
                                indentLevel: this.indentLevel,
                                header: true
                            });
                        this.addElements(headerLabel, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        this.indentLevel++;

                        //Recursive call
                        this.generateElements(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        this.indentLevel--;
                    } else {

                        // Setting this to true to allow for nested headers to be rendered
                        this.shouldHeaderBePrinted = true;

                        //Recursive call
                        this.generateElements(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                    }
            }


        },

        handleRadioButtons: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            if (this.shouldHeaderBePrinted) {
                var radioHeaderLabel = new Label({
                    property: taskProperties,
                    hidden: hidden,
                    indentLevel: this.indentLevel,
                    header: true
                });
                this.addElements(radioHeaderLabel, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
            } else {

                // Setting this to true to allow for nested headers to be rendered
                this.shouldHeaderBePrinted = true;
            }

            var radioButtonHelper = new RadioButtonHelper(
                {
                    property: taskProperties
                });
            radioButtonHelper.setDefaultButton();
            taskProperties.oneOf.forEach(function (radioElement) {
                var schemaData = radioButtonHelper.getSchemaData(radioElement);
                var radio = this.getLocalRadioButton(schemaData, hidden, isCheckBoxFlow, radioButtonHelper, parentRadio, parentCheckBox);
                radioButtonHelper.initializeRadioButtons();
                if (schemaData.hasNestedObject) {
                    this.handleRadioButtonWithObject(radio, schemaData, undefined);
                }
            }.bind(this));
            if (parentCheckBox) {
                radioButtonHelper.handleChildren(true);
            } else {
                radioButtonHelper.handleChildren();
            }
        },

        getLocalRadioButton: function (schemaData, hidden, isCheckBoxFlow, radioButtonHelper, parentRadio, parentCheckBox) {
            var radioButton = radioButtonHelper.getRadioButton(hidden, schemaData, this.indentLevel);
            this.addElements(radioButton, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
            return radioButton;
        },

        handleRadioButtonWithObject: function (radioButton, schemaData, parentCheckBox) {

            /*Creating a 'schema' object here because radio buttons with objects are a special case.
               The recursion starts with the outer part of the object, in other cases the inner object is handed down to the recursive call*/
            var schema = {};
            schema.properties = schemaData.properties;

            //Setting these values as we are about to recurse
            this.indentLevel++;
            this.shouldHeaderBePrinted = true;

            /*Recursive call passing:
               the schema,
               hidden equal to true,
               this is not a checkBox flow but radio button flow,
               the parent radio button
               the parent check box
               the boolean for skipping the label as true*/
            this.generateElements(schema, true, false, radioButton, parentCheckBox, true);
            this.indentLevel--;
        },

        handleArrayObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            this.renderObjectTypeItemsOfInformationalArray(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
        },
        handleInformationalArrayObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            if (taskProperties.items.type === "object") {
                this.renderObjectTypeItemsOfInformationalArray(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
            }
        },

        renderObjectTypeItemsOfInformationalArray: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            var objectProps = taskProperties.items.properties;
            var arrayData = taskProperties.default;
            for (var i = 0; i < arrayData.length; i++) {
                var arrayElementData = arrayData[i];
                for (var prop in objectProps) {
                    var itemProperty = objectProps[prop];
                    itemProperty.default = arrayElementData[prop];
                    this.generateArrayElements(itemProperty, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, true);
                }
            }
        },

        generateArrayElements: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel) {
            var required = false;
            this.generateElementBasedonTypeAndFormat(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel, required);
        },

        handleInformationalObject: function (taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox) {
            var informationalObjectProperties = taskProperties.properties;
            for (var prop in informationalObjectProperties) {
                var itemProperty = informationalObjectProperties[prop];
                if (itemProperty.type === "array") {
                    this.generateArrayElements(itemProperty, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, true);
                }
            }
        },

        generateElementBasedonTypeAndFormat: function(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel, required){
            if (taskProperties.type === 'object') {
                switch (taskProperties.format) {
                    case "radio":
                        this.handleRadioButtons(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        break;
                    case "file":
                        this.handleFileObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        break;
                    case "checkbox":
                        this.handleCheckBoxWithObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        break;
                    case "informational":
                        this.handlerInformationalObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        break;

                    case "date-time":
                        this.handleDateTimeObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                        break;
                    default:
                        this.handlerObjectWithoutFormat(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox, skipLabel);
                }
            } else {
                var element = null;

                if (taskProperties.type === 'string') {
                    if (taskProperties.format === 'informational') {
                        element = new Label({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel
                        });
                    } else if (taskProperties.format === 'message-error' || taskProperties.format === 'message-warning' || taskProperties.format === 'message-info') {
                        element = new Message({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel
                        });
                    } else if (taskProperties.format === 'select') {
                        element = new SelectBox({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel
                        });
                    } else if (taskProperties.format === 'select-list') {
                        element = new ListBox({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel
                        });
                    } else if (taskProperties.format === 'date-time') {
                        if(taskProperties.readOnly && taskProperties.readOnly === true){
                            element = this.getReadOnlyElement(taskProperties, hidden);
                        }else {
                            element = new DateTime({
                                property: taskProperties,
                                hidden: hidden,
                                indentLevel: this.indentLevel
                            });
                        }
                    } else if (taskProperties.format === 'informational-link') {
                        element = new Link({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel
                        });
                    } else {
                        if(taskProperties.readOnly && taskProperties.readOnly === true){
                            element = this.getReadOnlyElement(taskProperties, hidden);
                        } else {
                            element = new Text({
                                property: taskProperties,
                                hidden: hidden,
                                indentLevel: this.indentLevel,
                                required: required
                            });
                        }
                    }
                } else if (taskProperties.type === 'boolean' && taskProperties.format === 'checkbox') {
                    element = new Choice({
                        property: taskProperties,
                        hidden: hidden,
                        isCheckBox: true,
                        indentLevel: this.indentLevel
                    });
                } else if (taskProperties.type === 'array' && (taskProperties.format === 'informational-list'|| taskProperties.format === 'list')) {
                    element = new ListBox({
                        property: taskProperties,
                        hidden: hidden,
                        indentLevel: this.indentLevel
                    });
                } else if (taskProperties.type === 'array' && taskProperties.format === 'email') {
                    if(taskProperties.readOnly && taskProperties.readOnly === true){
                        element = this.getReadOnlyElement(taskProperties, hidden);
                    } else {
                        element = new Email({
                            property: taskProperties,
                            hidden: hidden,
                            indentLevel: this.indentLevel,
                            required: required
                        });
                    }
                } else if (taskProperties.type === 'integer') {
                    element = new Integer({
                        property: taskProperties,
                        hidden: hidden,
                        indentLevel: this.indentLevel
                    });
                } else if (taskProperties.type === 'array' && taskProperties.format === 'select-table') {
                    element = new PopupTableButton({
                        property: taskProperties,
                        hidden: hidden,
                        indentLevel: this.indentLevel
                    });
                } else if (taskProperties.type === 'array' && (taskProperties.format === 'informational-table' || taskProperties.format === 'table')) {
                    element = new PopupTable({
                        property: taskProperties,
                        hidden: hidden,
                        indentLevel: this.indentLevel
                    });
                } else if (taskProperties.type === 'array') {
                    if (taskProperties.items.type === "object") {
                        this.handleArrayObject(taskProperties, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                    }
                }

                if (element) {
                    this.addElements(element, hidden, isCheckBoxFlow, parentRadio, parentCheckBox);
                }
            }
        },

        getReadOnlyElement: function (taskProperties, hidden) {
            var element = new ReadOnly({
                property: taskProperties,
                hidden: hidden,
                indentLevel: this.indentLevel
            });
            return element;
        }

    });
});