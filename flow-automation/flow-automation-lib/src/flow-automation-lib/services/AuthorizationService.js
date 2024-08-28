define([
    'jscore/ext/net',
    './ErrorHandler',
    './messageUtils'
], function (net, ErrorHandler, messageUtils) {

    function authorize(success) {
        net.ajax({
            url: '/flowautomation/authorize',
            type: 'HEAD',
            success: success,
            error: function (response, xhr) {
                var errorMessage = messageUtils.getErrorMessage(xhr.getStatus());
                ErrorHandler.fullScreenError(errorMessage);
            }
        });
    }

    return {
        authorize: authorize
    };
});