var setupData = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Flow Instance Input Data supplied in Setup Phase",
    "additionalProperties": false,
    "type": "object",
    "properties": {
        "usertaskSelection": {
            "name": "Usertask Selection",
            "type": "object",
            "properties": {
                "information": {
                    "name": "Information",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "textInputs": {
                    "name": "Text Inputs",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                },
                "textInputsWithInformation": {
                    "name": "Text Inputs With Information",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                },
                "checkBoxes": {
                    "name": "Checkboxes",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "radioButtons": {
                    "name": "Radio Buttons",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "selectBoxes": {
                    "name": "Selectboxes",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                },
                "listBoxes": {
                    "name": "Listboxes",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                },
                "groupingAndNesting": {
                    "name": "Grouping And Nesting",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "checkBoxesWithNesting": {
                    "name": "Checkboxes With Nesting",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "radioButtonsWithNesting": {
                    "name": "Radio Buttons With Nesting",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                }
            },
            "required": ["textInputs", "textInputsWithInformation", "checkBoxes", "radioButtons", "selectBoxes", "listBoxes", "groupingAndNesting", "checkBoxesWithNesting", "radioButtonsWithNesting"],
            "additionalProperties": false
        },
        "checkBoxes": {
            "name": "Check Boxes",
            "type": "object",
            "properties": {
                "checkboxShortLabel": {
                    "name": "Short label",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": true
                },
                "checkboxLongLabel": {
                    "name": "Long label long label long label long label",
                    "type": "boolean",
                    "format": "checkbox",
                    "readOnly": true,
                    "default": false
                }
            },
            "required": ["checkboxShortLabel", "checkboxLongLabel"],
            "additionalProperties": false
        },
        "radioButtons": {
            "name": "Radio Buttons",
            "type": "object",
            "properties": {
                "radioGroup1": {
                    "name": "Radio group label",
                    "type": "object",
                    "format": "radio",
                    "default": "radioShortLabel",
                    "properties": {
                        "radioLongLabel": {
                            "name": "Long label long label long label long label",
                            "type": "boolean",
                            "readOnly": true,
                            "default": true
                        }
                    }
                }
            },
            "required": ["radioGroup1"],
            "additionalProperties": false
        },
        "groupingAndNesting": {
            "name": "Grouping And Nesting",
            "type": "object",
            "properties": {
                "groupWithTextInputs": {
                    "name": "Group with text inputs",
                    "type": "object",
                    "properties": {
                        "textInput1": {
                            "name": "Text input 1",
                            "type": "string",
                            "minLength": 4,
                            "maxLength": 20,
                            "readOnly": true,
                            "default": "test1"
                        },
                        "textInput2": {
                            "name": "Text input 2",
                            "type": "string",
                            "minLength": 4,
                            "maxLength": 20,
                            "readOnly": true,
                            "default": "test2"
                        }
                    },
                    "required": ["textInput1", "textInput2"],
                    "additionalProperties": false
                },
                "groupWithCheckboxes": {
                    "name": "Group with checkboxes",
                    "type": "object",
                    "properties": {
                        "checkbox1": {
                            "name": "Checkbox 1",
                            "type": "boolean",
                            "format": "checkbox",
                            "readOnly": true,
                            "default": true
                        },
                        "checkbox2": {
                            "name": "Checkbox 2",
                            "type": "boolean",
                            "format": "checkbox",
                            "readOnly": true,
                            "default": false
                        },
                        "checkbox3": {
                            "name": "Checkbox 3",
                            "type": "boolean",
                            "format": "checkbox",
                            "readOnly": true,
                            "default": true
                        }
                    },
                    "required": ["checkbox1", "checkbox2", "checkbox3"],
                    "additionalProperties": false
                },
                "groupWithMultipleLevels": {
                    "name": "Group with multiple levels",
                    "type": "object",
                    "properties": {
                        "level2Group": {
                            "name": "Level 2 Group",
                            "type": "object",
                            "properties": {
                                "level3GroupWithCheckboxes": {
                                    "name": "Level 3 Group With Checkboxes",
                                    "type": "object",
                                    "properties": {
                                        "checkbox1": {
                                            "name": "Checkbox 1",
                                            "type": "boolean",
                                            "format": "checkbox",
                                            "readOnly": true,
                                            "default": false
                                        },
                                        "checkbox2": {
                                            "name": "Checkbox 2",
                                            "type": "boolean",
                                            "format": "checkbox",
                                            "readOnly": true,
                                            "default": true
                                        }
                                    },
                                    "required": ["checkbox1", "checkbox2"],
                                    "additionalProperties": false
                                }
                            },
                            "required": ["level3GroupWithCheckboxes"],
                            "additionalProperties": false
                        }
                    },
                    "required": ["level2Group"],
                    "additionalProperties": false
                }
            },
            "required": ["groupWithTextInputs", "groupWithCheckboxes", "groupWithMultipleLevels"],
            "additionalProperties": false
        },
        "checkBoxesWithNesting": {
            "name": "Checkboxes With Nesting",
            "type": "object",
            "properties": {
                "checkboxLevel1ExposesMoreDetails": {
                    "name": "Checkbox 1 level 1 exposes more detail",
                    "type": "boolean",
                    "format": "checkbox",
                    "additionalProperties": false,
                    "readOnly": true,
                    "default": false
                },
                "checkbox2Level1ExposesMoreDetails": {
                    "name": "Checkbox 2 level 1 exposes more detail",
                    "type": "object",
                    "format": "checkbox",
                    "properties": {
                        "checkbox2Level2ExposesMoreDetails": {
                            "name": "Checkbox 2 level 2 exposes more detail",
                            "type": "object",
                            "format": "checkbox",
                            "properties": {
                                "textInput1": {
                                    "name": "Text input 1",
                                    "type": "string",
                                    "minLength": 4,
                                    "maxLength": 20,
                                    "readOnly": true,
                                    "default": "test2"
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                }
            },
            "additionalProperties": false
        }
    },
    "required": ["usertaskSelection"],
    "title": "Flow Instance Input Data",
    "name": "Flow Instance Input Data",
    "format": "informational"
};
module.exports = {
    setupData: setupData
};