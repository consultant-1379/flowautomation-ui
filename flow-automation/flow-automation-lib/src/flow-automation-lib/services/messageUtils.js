
define([
    "jscore/core",
    'i18n!flow-automation-lib/dictionary.json'
], function (core, dictionary) {

    return {
        getErrorMessage: function (errorStatusCode, responseMessage) {
            var errorBody;
            switch (errorStatusCode) {

                case dictionary.get('errorCodes.UNAUTHORIZED_CODE'):
                    errorBody = {
                        userMessage: {
                            title: dictionary.get('errorResponse.accessDeniedHeader'),
                            body: dictionary.get('errorResponse.accessDeniedContent')
                        }
                    };

                    break;

                case dictionary.get('errorCodes.NO_SERVER_FOUND'):
                    errorBody = {
                        userMessage: {
                            title: dictionary.get('errorResponse.noServerFoundHeader'),
                            body: dictionary.get('errorResponse.noServerFoundContent')
                        }
                    };

                    break;

                case dictionary.get('errorCodes.UNPROCESSABLE_ENTITY'):
                    errorBody = {
                        userMessage: {
                            title: dictionary.get('errorResponse.networkObjectNotFoundHeader'),
                            body: dictionary.get('errorResponse.networkObjectNotFoundContent')
                        }
                    };

                    break;


                default:
                    errorBody = {
                        userMessage: {
                            title: dictionary.get('errorResponse.unableToRetrieveDataHeader'),
                            body: dictionary.get('errorResponse.serviceDownContent')
                        }
                    };
            }
            return errorBody;
        }
    };
});