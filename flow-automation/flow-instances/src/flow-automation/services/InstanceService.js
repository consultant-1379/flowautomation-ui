define([
    'jscore/ext/net'
], function (net) {

    function fetchInstances(successCallBack, errorCallBack, data) {
        net.ajax({
            url: '/flowautomation/v1/executions',
            type: 'GET',
            dataType: 'json',
            data: data,
            success: successCallBack,
            error: errorCallBack
        });
    }

    return {
        fetchInstances: fetchInstances
    };
});