package com.ericsson.flowautomationui.utils


class FlowAutomationConstants {

    // Constants for Import Flow Dialog
    public static final String CLOSE = "Close"
    public static final String SELECT_FLOW_PKG = "Select Flow Package"
    public static final String FLOW_PACKAGE_REQUIRED = "Flow package is required"
    public static final String ONLY_ZIP_FILES_ALLOWED = "Only Zip files allowed"
    public static final String SYSTEM_ERROR_PACKAGE = "Unable to import flow"
    public static final String MISSING_FLOW_DEFINITION_JSON_ERROR = "flow-definition.json file is missing in the flow package"
    public static final String UNEXPECTED_PARSING_DEF_ERROR = "Unexpected error while parsing the flow-definition.json file"
    public static final String UNEXPECTED_PARSING_RESOURCE_ERROR = "Unexpected error while parsing the flow resource"
    public static final String EMPTY_ZIP_ERROR = "Either the flow package is not a valid zip format or it's an empty zip"
    public static final String VALIDATE_ZIP_ERROR = "Failed to validate the zip content. Invalid flow package"
    public static final String IMPORT_FAILED_ERROR = "Import failed"
    public static final String INVALID_FLOW_DEFINITION_ERROR = "Invalid flow-definition.json file"
    public static final String EXECUTION_PHASE_MISSING_ERROR = "Execution phase missing in flow package"
    public static final String UNAUTHORIZED_TO_IMPORT_FLOW_ERROR = "The user doesn't have the required capability/role to perform the requested action."
    public static final String FLOW_VERSION_NOT_ALLOWED_ERROR = "Flow version is not allowed"
    public static final String INVALID_FLOW_VERSION_SYNTAX_ERROR = "Invalid Flow version syntax"
    public static final String INVALID_FLOW_PACKAGE_STRUCTURE_ERROR = "Invalid flow package structure"
    public static final String USER_TASK_JSON_VALIDATION_ERROR = "Validation Error"
    public static final String USER_TASK_JSON_NO_INPUT_ERROR = "Invalid flow input"
    public static final String USER_TASK_JSON_PROCESSING_ERROR = "Processing Error"
    public static final String USER_TASK_JSON_INTERNAL_FLOW_ERROR = "Internal Flow Error"
    public static final String CANCEL = "Cancel"
    public static final String OK = "OK"
    public static final String START = "Start"
    public static final String CONTINUE = "Continue"
    public static final String EXECUTE = "Execute"
    public static final String START_HEADER = "Start: Collect PM Counters, Activate KPI"
    public static final String CONFIRM_EXECUTION = "Confirm Execution"
    public static final String FLOW_INSTANCE_NAME = "Flow Automation"
    public static final String FLOW_INSTANCE_SUCCESS = "Flow Collect PM Counters, Activate KPI started successfully"

    public static final String NAME_REQUIRED_ERROR_MSG = "Enter a flow instance name"
    public static final String SPECIAL_CHARACTERS_ERROR_MSG = "Use only letters (a-z, A-Z), numbers and spaces"
    public static final String SPACE_DASH_ERROR_MSG = "Flow instance name cannot start with “-“ or space"
    public static final String ERRORCODE_PERMISSION_DENIED_MSG = "You do not have all the capabilities required to execute this flow. Do you still want to continue?"
    public static final String CHARACTER_LENGTH_ERROR_MSG = "Flow instance name cannot exceed 128 characters"
    public static final String ERRORCODE_INPUT_ERROR_MSG = "The flow instance name is already in use"
    public static final String ERRORCODE_SYSTEM_ERROR_MSG = "Unable to start flow - Collect PM Counters, Activate KPI"

    public static final String NAME_REQUIRED_INPUT_ERROR = ""
    public static final String SPECIAL_CHARACTERS_INPUT_ERROR = "^&^&^&"
    public static final String DASH_INPUT_ERROR = "----- "
    public static final String SPACE_INPUT_ERROR = "        "
    public static final String CHARACTER_LENGTH_INPUT_ERROR = '12345678910' * 13
    public static final String ERRORCODE_INPUT_ERROR = "InlineError"
    public static final String ERRORCODE_SYSTEM_ERROR = "SystemError"

    public static final String PANEL_TITLE = "Add Network Objects"
    public static final String ME_CONTEXT_NODE = "LTE02ERBS00010"
    public static final String SGSN_NODE = "SGSN-16A-CP01-V101"
    public static final String LEINSTER_NODE = "Leinster"
    public static final String COLLECTIONS_TAB_NAME = "Collections"
}
