#!/usr/bin/env bash
# contribute.sh
#  Adds the default metadata for the application to the Application Launcher
#  Relies on copy_meta_data_to_nfs.sh found in:
#  The /ericsson/httpd/bin/pre-start/ folder in a httpd VM of an installed IDUN system.
#  The ERIChttpdconfig_CXP9031096/src/main/resources/pre-start/ folder of the OSS/com.ericsson.oss.itpf.configuration/HttpdConfig git repository.
#  More info: https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/Presentation_Server/latest/installing-metadata-files.html
# UTILITIES
_CP=/bin/cp
_CHOWN=/bin/chown
_RM=/bin/rm
_MKDIR=/bin/mkdir
APPS_ROOT_PATH=/ericsson/httpd/data/apps
APP_NAME="flow-automation"
FLOW_AUTOMATION_STATIC_CONTENT="$APPS_ROOT_PATH/$APP_NAME"
#######################################
# Action :
#  For each Launcher app
# Globals :
#   None
# Arguments:
#   None
# Returns:
#
#######################################
install_app(){
    # Delete existing files before copy
    $_RM -rf "$FLOW_AUTOMATION_STATIC_CONTENT"
    # Create fresh directory
    $_MKDIR -p "$FLOW_AUTOMATION_STATIC_CONTENT"
    # Copy files
    $_CP -R /var/www/html/flow-automation/metadata/$APP_NAME/* "$FLOW_AUTOMATION_STATIC_CONTENT"
    # Set ownership to jboss user
    $_CHOWN -R jboss_user:jboss "$FLOW_AUTOMATION_STATIC_CONTENT"
}
#/////////////////////////
# Main starts here
#/////////////////////////
# handle the project structure changes.
$_RM -rf /ericsson/{httpd,tor}/data/apps/FlowAutomation
install_app
exit 0