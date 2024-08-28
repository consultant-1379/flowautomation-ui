// IDUN-2980 UI – Removing Action Library
//define([
//    '../../ext/utils/LauncherUtils',
//    'flow-automation-lib/helper/utils'
//], function (LauncherUtils, helper) {
//    var handler = (function () {
//        var instance;
//
//        function init() {
//
//            var eventBus;
//            var mapSelectedAction = {};
//
//            var launcherUtils = new LauncherUtils([], {
//                successCallBack: function () {
//                },
//                failureCallBack: function () {
//                }
//            });
//
//            function setEventBus(event) {
//                eventBus = event;
//            }
//
//            function resetSelection() {
//                mapSelectedAction = {};
//            }
//
//            function processSelectedRowInMap(data) {
//                var selected = data.rowsSelected;
//
//                // contains inside the map the id
//                if (mapSelectedAction[data.id] !== undefined) {
//                    // if selected is null then delete the key in the map
//                    if (helper.isEmpty(selected)) {
//                        delete mapSelectedAction[data.id];
//                    } else {
//                        // otherwise add this new selected inside the map
//                        mapSelectedAction[data.id] = selected;
//                    }
//                } else if (!helper.isEmpty(selected)) {
//                    // if not contains inside the map and is not empty add in the map
//                    mapSelectedAction[data.id] = selected;
//                }
//            }
//
//            function handler(data) {
//                processSelectedRowInMap(data);
//
//                var keys = Object.keys(mapSelectedAction);
//                if (keys.length === 1) {
//                    launcherUtils.createLauncherAction(mapSelectedAction[keys[0]]).then(function (actions) {
//                        eventBus.publish('FlowInstanceDetails:actions', actions);
//                    });
//                } else { // clear the action framework
//                    eventBus.publish('FlowInstanceDetails:actions', null);
//                }
//            }
//
//            return {
//                setEventBus: setEventBus,
//                handler: handler,
//                resetSelection: resetSelection
//            };
//        }
//
//        return {
//            getInstance: function () {
//                return init();
//            }
//        };
//    })();
//
//    return handler.getInstance();
//});
