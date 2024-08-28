define([
    'widgets/Dialog',
    'container/api',
    'widgets/InlineMessage',
    'flow-automation-lib/services/ErrorHandler',
    'flow-automation-lib/services/messageUtils',
    'i18n!flow-automation-lib/dictionary.json',
    './Notifications',
    'widgets/Accordion'
], function (Dialog, container, InlineMessage, ErrorHandler, messageUtils, dictionary, Notifications, Accordion) {

    return {
        flowsErrorHandling: function (response, dialog, errorMsg, handler) {
            var errorCode;
            var errorBody;

            if (this.isValidJson(response.getResponseText())) {
                if (this.isInLineError(response)) {
                    var flowErrorCode = response.getResponseJSON().errors[0].code;
                    var error = (dictionary.errorCodes[flowErrorCode]);
                    if (!error) {
                        handler.showValidationError(dictionary.genericErrorMessage);
                    } else {
                        handler.showValidationError(error);
                    }
                } else {
                    errorCode = response.getStatus();
                    var responseText = response.getResponseText();
                    errorBody = messageUtils.getErrorMessage(errorCode, responseText);

                    switch (errorCode) {

                        case 401:
                        case 403:
                        case 404:
                            ErrorHandler.fullScreenError(errorBody);
                            break;

                        default:
                            ErrorHandler.error(errorBody, dialog, errorMsg);
                    }
                }
            } else {
                errorBody = messageUtils.getErrorMessage(response.getStatus(), response.getResponseText());
                ErrorHandler.error(errorBody, dialog, errorMsg);
            }
        },


        userTasksErrorHandling: function (response) {
            var errorCode = response.data.status;
            var responseText = response.xhr.getResponseText();
            var errorBody = messageUtils.getErrorMessage(errorCode, responseText);

            if (this.isValidJson(response.xhr.getResponseText())) {
                if (this.isFlowAutomationError(response)) {
                    var flowErrorCode = response.xhr.getResponseJSON().errors[0].code;
                    var error = (dictionary.errorCodes[flowErrorCode]);
                    var reasonPhrase = response.xhr.getResponseJSON().reasonPhrase;
                    if (response.xhr.getResponseJSON().status && response.xhr.getResponseJSON().status === 500 && flowErrorCode && flowErrorCode.startsWith("error.fa")) {
                        reasonPhrase = response.xhr.getResponseJSON().errors[0].errorMessage;
                        error = dictionary.errorCodes.internalFlowError;
                    }
                    if (!error) {
                        error = dictionary.errorCodes.internalServiceError;
                    }
                    if (errorCode === 409) {
                        return Notifications.error(error);
                    }
                    ErrorHandler.onComplete(error, reasonPhrase);
                } else {
                    errorBody = messageUtils.getErrorMessage(errorCode, responseText);

                    switch (errorCode) {

                        case 401:
                        case 403:
                        case 404:
                            ErrorHandler.fullScreenError(errorBody);
                            break;

                        default:
                            ErrorHandler.userTask(errorBody);
                    }
                }
            } else {
                var errorMsg = dictionary.get('userTask.error');
                ErrorHandler.flowStatus(errorBody, errorMsg);
            }
            return null;
        },

        reportErrorHandling: function (response, handler) {
            var errorCode = response.getStatus();
            var responseText = response.getResponseText();
            if (this.isValidJson(response.getResponseText())) {
                if (this.isFlowAutomationError(response)) {
                    var flowErrorCode = response.getResponseJSON().errors[0].code;
                    var error = (dictionary.errorCodes[flowErrorCode]);
                    var reasonPhrase = response.getResponseJSON().reasonPhrase;

                    ErrorHandler.onComplete(error, reasonPhrase);
                } else {
                    var errorBody = messageUtils.getErrorMessage(errorCode, responseText);

                    switch (errorCode) {
                        case 401:
                        case 403:
                            ErrorHandler.fullScreenError(errorBody);
                            break;
                        case 404:
                            handler.setNoReportInline(dictionary.get("report.noAvailable"));
                            break;
                        case 500:
                            handler.setNoReportInline(dictionary.errorResponse.errorInFlow + response.getResponseJSON().reasonPhrase, 'error');
                            break;

                        default:
                            ErrorHandler.userTask(errorBody);
                    }
                }
            } else {
                handler.setNoReportInline(dictionary.report.noAvailable);
            }
        },

        persistanceObjectErrorHandling: function (response) {
            var errorCode = response.getStatus();
            var responseText = response.getResponseText();
            var errorBody = messageUtils.getErrorMessage(errorCode, responseText);

            switch (errorCode) {

                case 401:
                case 403:
                case 404:
                    ErrorHandler.fullScreenError(errorBody);
                    break;

                default:
                    ErrorHandler.userTask(errorBody);
            }
        },

        isFlowAutomationError: function (response) {
            return (response.xhr && response.xhr.getResponseJSON().errors && response.xhr.getResponseJSON().errors.length > 0);
        },

        isInLineError: function (response) {
            return (response && response.getResponseJSON().errors && response.getResponseJSON().errors.length > 0);
        },

        isValidJson: function (textToCheck) {
            try {
                JSON.parse(textToCheck);
                return true;
            } catch (e) {
                return false;
            }
        },

        importFlowErrorHandler: function (response, dialog, errorMsg, handler) {
            if (this.isValidJson(response.getResponseText()) && this.isInLineError(response)) {
                var responseJSON = response.getResponseJSON();
                var message = "";
                responseJSON.errors.forEach(function (error) {
                    message += (dictionary.errorCodes[error.code]) ? dictionary.errorCodes[error.code] + " " : "";
                });

                // if dictionary cannot resolve the error.code then will try use the reasonPhrase
                if (message === "") {
                    message = responseJSON.reasonPhrase || dictionary.genericErrorMessage;
                }
                handler.showValidationError(message);

                // contains errorDetail then create accordion with details
                if (responseJSON.errorDetail) {
                    handler.showValidationAccordionError(new Accordion({
                        title: dictionary.get("errorDialogBox.viewErrorDetails"),
                        content: responseJSON.errorDetail
                    }));
                }
            } else {
                ErrorHandler.error(messageUtils.getErrorMessage(response.getStatus(), response.getResponseText()), dialog, errorMsg);
            }
        }
    };
});