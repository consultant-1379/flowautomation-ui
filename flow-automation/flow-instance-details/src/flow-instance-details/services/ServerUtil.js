define([
    'jscore/ext/net'

], function (net) {
    var commonOptions = {
        contentType: 'application/json',
        dataType: 'json',
        processData: false
    };

    function getCallBackOptions() {
        return {
            alwaysExecute: true,
            includeErrors: true
        };
    }

    function getCommonOptions(type) {

        if (type === 'GET') {
            return commonOptions;
        } else {
            return Object.assign({}, commonOptions, {type: 'POST'});
        }
    }

    return {
        sendRestCall: function (requestType, url, successCallBack, errorCallBack, responseDataType, contentType, requestData) {
            var xhr = net.ajax({
                type: requestType,
                url: url,
                success: successCallBack,
                error: errorCallBack,
                dataType: responseDataType,
                contentType: contentType,
                data: requestData
            });
            return xhr;
        },

        sendParallelRestCalls: function (type, requests, callback) {
            var xhrs = net.parallel(getCommonOptions(type), requests, callback, getCallBackOptions());
        }
    };
});