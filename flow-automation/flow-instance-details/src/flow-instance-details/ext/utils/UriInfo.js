define(['flow-automation-lib/helper/utils'], function (utils) {

    // singleton to handler the url params
    var uriInfo = (function () {
        var instance;

        function init() {

            var FLOW_ID = "flowId";
            var SOURCE = "source";
            var EXECUTION_NAME = "executionName";
            var USER_TASKS = "userTasks";
            var STATE = "state";
            var FLOW_VERSION = "flowVersion";

            var mapUrlVariables = {};

            function update() {
                console.debug("Executing the url variables update");
                var params = utils.getURLSearchParams();
                mapUrlVariables[FLOW_ID] = params.get(FLOW_ID);
                mapUrlVariables[SOURCE] = params.get(SOURCE);
                mapUrlVariables[EXECUTION_NAME] = params.get(EXECUTION_NAME);
                mapUrlVariables[USER_TASKS] = params.get(USER_TASKS);
                mapUrlVariables[STATE] = params.get(STATE);
                mapUrlVariables[FLOW_VERSION] = params.get(FLOW_VERSION);

                console.debug("Values:" + JSON.stringify(mapUrlVariables));
            }

            function setParam(key, value) {
                console.debug("Update url param key:" + key + " value:" + value);
                mapUrlVariables[key] = value;
                utils.setURLParams(key, value);
            }

            function clear() {
                Object.keys(mapUrlVariables).forEach(function (key) {
                    delete mapUrlVariables[key];
                });
                console.debug('%c Clear data! ', 'background: #222; color: red');
            }

            function getUrlVariable(key) {
                return mapUrlVariables[key];
            }

            function getFlowId() {
                return getUrlVariable(FLOW_ID);
            }

            function getSource() {
                return getUrlVariable(SOURCE);
            }

            function getExecutionName() {
                return getUrlVariable(EXECUTION_NAME);
            }

            function getUserTasks() {
                return getUrlVariable(USER_TASKS);
            }

            function getState() {
                return getUrlVariable(STATE);
            }

            function getFlowVersion() {
                return getUrlVariable(FLOW_VERSION);
            }

            function setState(value) {
                setParam(STATE, value);
            }

            function setFlowVersion(value) {
                setParam(FLOW_VERSION, value);
            }

            return {
                getFlowId: getFlowId,
                getSource: getSource,
                getExecutionName: getExecutionName,
                getUserTasks: getUserTasks,
                getState: getState,
                getFlowVersion: getFlowVersion,
                update: update,
                setParamState: setState,
                setParamFlowVersion: setFlowVersion,
                clear: clear
            };
        }

        return {
            getInstance: function () {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();

    return uriInfo.getInstance();
});