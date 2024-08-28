define([], function () {

    var singleton = (function () {
        var instance;

        function init() {

            var fistElement = 0;
            var secondElement = 1;
            var polling = null;
            var mapMethods = {};

            function executeMethods() {
                Object.keys(mapMethods).forEach(function (key) {
                    console.debug(key + " element added in the polling");
                    mapMethods[key][fistElement].call(mapMethods[key][secondElement]);
                });
            }

            function start() {
                stop();
                console.debug("start the polling");
                executeMethods();
                polling = setInterval(function () {
                    executeMethods();
                }, 10000);
            }

            function aggregator(key, method, scope) {
                if (mapMethods.hasOwnProperty(key)) {
                    console.debug(key + " already exist");
                }else{
                    mapMethods[key] = [method, scope];
                }
                start();
            }

            function remove(key) {
                if (mapMethods.hasOwnProperty(key)) {
                    console.debug(key + " will be removed");
                    stop();
                    delete mapMethods[key];
                    start();
                }
            }

            function stop() {
                if (polling) {
                    console.debug("stop polling");
                    clearInterval(polling);
                    polling = null;
                }
            }

            return {
                start: start,
                stop: stop,
                agg: aggregator,
                remove: remove
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

    return singleton.getInstance();
});