#!/bin/bash
#
# USAGE:
#   First parameter sets a specific port to serve on
#   e.g. <scriptname> 8787
#
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd ${SCRIPT_DIR}/flow-automation/flow-instances/
PORT=8585
PROXY_CONFIG_FILE=proxy-config-docker.json

if [ ! -z "$1" ]; then
    PORT=$1
fi

if [ ! -z "$2" ]; then
    PROXY_CONFIG_FILE=$2
fi

cdt2 serve -p $PORT --proxy-config $PROXY_CONFIG_FILE
