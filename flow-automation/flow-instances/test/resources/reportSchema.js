var schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Auto SW Rollout flow report schema body",
    "description": "Auto SW Rollout flow report schema body",
    "type": "object",
    "properties": {
        "header": {
            "type": "object",
            "properties": {
                "reportTime": {
                    "name": "Report Time",
                    "description": "Time the report was produced",
                    "type": "string",
                    "format": "date-time"
                },
                "flowId": {
                    "name": "Flow ID",
                    "description": "Identifier for the flow",
                    "type": "string"
                },
                "flowVersion": {
                    "name": "Flow Version",
                    "description": "Version of the flow",
                    "type": "string"
                },
                "flowName": {
                    "name": "Flow Name",
                    "description": "Name of the flow",
                    "type": "string"
                },
                "flowExecutionName": {
                    "name": "Flow Execution Name",
                    "description": "Name of the flow execution",
                    "type": "string"
                },
                "startedBy": {
                    "name": "Started By",
                    "description": "Name of user who started the flow execution",
                    "type": "string"
                },
                "startTime": {
                    "name": "Start Time",
                    "description": "Time the flow execution was started",
                    "type": "string",
                    "format": "date-time"
                },
                "endTime": {
                    "name": "End Time",
                    "description": "Time the flow execution ended",
                    "type": "string",
                    "format": "date-time"
                },
                "status": {
                    "name": "Status",
                    "description": "Status of the flow execution",
                    "type": "string",
                    "enum": ["SETTING_UP", "CONFIRM_EXECUTE", "EXECUTING", "EXECUTED", "CANCELLED", "INCIDENT"],
                    "enumNames": ["Setting Up", "Confirm Execute", "Executing", "Executed", "Cancelled", "Incident"]
                }
            },
            "required": ["reportTime", "flowId", "flowVersion", "flowName", "flowExecutionName", "startedBy", "startTime", "endTime", "status"]
        },
        "body": {
            "type": "object",
            "properties": {
                "overview": {
                    "name": "",
                    "description": "Overview",
                    "type":'object',
                    "properties": {
                        "name": {
                            "name": "Name",
                            "description": "Description Text",
                            "type": "string"
                        },
                        "numberOfNodes": {
                            "name": "Number of Nodes",
                            "description": "Description Text",
                            "type": "integer"
                        },
                        "summaryResult": {
                            "name": "Summary Result",
                            "description": "Description Text",
                            "type": "string",
                            "format": "link"
                        },
                        "testTextValueNotReturned": {
                            "name": "Text Value Not Returned",
                            "description": "Description Text",
                            "type": "string"
                        },
                        "link": {
                            "name": "Link Name",
                            "description": "",
                            "type": "string",
                            "format": "link"
                        }
                    }
                },
                "nodeResults": {
                    "name": "Section with multiple objects",
                    "description": "Node results",
                    "type": "object",
                    "properties": {
                        "preparation": {
                            "name": "Preparation",
                            "description": "Preparation phase node results",
                            "type": "object",
                            "format": "summary",
                            "properties": {
                                "numNodesCompletedPreparation": {
                                    "name": "NEs prepared",
                                    "description": "Number of NEs which have completed preparation",
                                    "type": "integer"
                                },
                                "numNodesFailedPreparation": {
                                    "name": "NEs failed",
                                    "description": "Number of NEs which have failed preparation",
                                    "type": "integer"
                                },
                                "numNodesOngoingPreparation": {
                                    "name": "NEs ongoing",
                                    "description": "Number of NEs which for which preparation is ongoing",
                                    "type": "integer"
                                },
                                "numNodesQueuedPreparation": {
                                    "name": "Summary value Not Returned",
                                    "description": "Number of NEs which for which preparation is queued",
                                    "type": "integer"
                                }
                            },
                            "required": ["numNodesCompletedPreparation", "numNodesFailedPreparation", "numNodesOngoingPreparation", "numNodesQueuedPreparation"]
                        },
                        "activation": {
                            "name": "Activation",
                            "format": "summary",
                            "description": "Activation phase node results",
                            "type": "object",
                            "properties": {
                                "numNodesCompletedActivation": {
                                    "name": "NEs activated",
                                    "description": "Number of NEs which have completed activation",
                                    "type": "integer"
                                },
                                "numNodesFailedActivation": {
                                    "name": "NEs failed",
                                    "description": "Number of NEs which have failed activation",
                                    "type": "integer"
                                },
                                "numNodesOngoingActivation": {
                                    "name": "NEs ongoing",
                                    "description": "Number of NEs which for which activation is ongoing",
                                    "type": "integer"
                                },
                                "numNodesQueuedActivation": {
                                    "name": "Link to somewhere",
                                    "description": "Number of NEs which for which activation is queued",
                                    "type": "string",
                                    "format": "link"
                                }
                            },
                            "required": ["numNodesCompletedActivation", "numNodesFailedActivation", "numNodesOngoingActivation", "numNodesQueuedActivation"]
                        }
                    },
                    "required": ["preparation", "activation"]
                },
                "nodeResultsTable": {
                    "name": "",
                    "description": "Results per node",
                    "type": "array",
                    "items": {
                        "name": "Node Result Table",
                        "description": "Result for a node",
                        "type": "object",
                        "properties": {
                            "ne": {
                                "name": "NE",
                                "description": "Network Element",
                                "type": "string"
                            },
                            "state": {
                                "name": "State",
                                "description": "State Description",
                                "type": "string",
                                "enum": ["SETTING_UP", "CONFIRM_EXECUTE", "EXECUTING", "EXECUTED", "CANCELLED", "INCIDENT"],
                                "enumNames": ["Setting Up", "Confirm Execute", "Executing", "Executed", "Cancelled", "Incident"]
                            },
                            "phase": {
                                "name": "Phase",
                                "description": "Phase Description",
                                "type": "string",
                                "enum": ["PREPARATION", "ACTIVATION"],
                                "enumNames": ["Preparation", "Activation"]
                            },
                            "linkToPlace": {
                                "name": "Details",
                                "description": "Details Description",
                                "type": "string",
                                "format": "link"
                            }
                        },
                        "required": ["ne", "state", "phase"]
                    }
                }
            },
            "required": ["nodeResults", "nodeResultsTable"]
        }
    },
    "required":["header", "body"]
    }
;
module.exports = {
    schema: schema
};