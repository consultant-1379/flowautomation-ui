define([
    'jscore/ext/net',
    'container/api',
    'widgets/Dialog',
    'flow-automation-lib/services/CustomError',
    'flow-automation-lib/services/messageUtils',
    'flow-automation-lib/helper/execution',
    'i18n!flow-automation-lib/dictionary.json',
    '../utils/UriInfo',
    'flow-automation-lib/helper/Loader'
], function (net, container, Dialog, CustomError, messageUtils, execution, dictionary, UriInfo, Loader) {


    return {
        getAction: function (request) {
            if (isStopAllowed()) {
                return {};
            }
            this.eventBus = request.eventBus;
            return {
                name: dictionary.get('flowInstance.actions.stop'),
                type: 'button',
                icon: {
                    name: 'stop',
                    prefix: 'ebIcon',
                    position: 'left'
                },
                action: function () {
                    this.confirmStopInstanceDialog = new Dialog({
                        header: dictionary.get('flowInstance.stop.confirmDialog.header'),
                        content: dictionary.get('flowInstance.stop.confirmDialog.content'),
                        buttons: [{
                            focused: true,
                            caption: dictionary.get('flowInstance.stop.confirmDialog.buttons.stop'),
                            color: 'red',
                            action: onConfirmStopFlowInstance.bind(this)
                        }, {
                            caption: dictionary.get('flowInstance.stop.confirmDialog.buttons.cancel'),
                            action: onCancelStopFlowInstance.bind(this)
                        }]
                    });
                    this.confirmStopInstanceDialog.show();
                }.bind(this)
            };
        }
    };

    function isStopAllowed() {
        return (!execution.isInExecutingState(UriInfo.getState()) || execution.isInternalFlowInstance(UriInfo.getSource()));
    }

    function onConfirmStopFlowInstance() {
        Loader.show();
        net.ajax({
            url: '/flowautomation/v1/executions/' + UriInfo.getExecutionName() + '/stop' + '?flow-id=' + UriInfo.getFlowId(),
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            success: onStopFlowInstanceSuccess.bind(this),
            error: onStopFlowInstanceError.bind(this)
        });
    }

    function onCancelStopFlowInstance() {
        this.confirmStopInstanceDialog.destroy();
    }

    function onStopFlowInstanceSuccess() {
        Loader.hide();
        this.confirmStopInstanceDialog.destroy();
        this.eventBus.publish('FlowInstance:notify', dictionary.get('flowInstance.stop.success'));
    }

    function onStopFlowInstanceError(data, xhr) {
        Loader.hide();
        this.confirmStopInstanceDialog.destroy();
        var stopFailedDialog = new Dialog({
            type: 'error',
            header: dictionary.get('flowInstance.stop.errorDialog.header'),
            content: getErrorReason(xhr),
            buttons: [{
                caption: dictionary.get('flowInstance.stop.errorDialog.buttons.ok'),
                action: function () {
                    stopFailedDialog.hide();
                },
                color: 'darkBlue'
            }]
        });
        stopFailedDialog.show();
    }

    function getErrorReason(response) {
        var responseText = response.getResponseText();
        if (CustomError.isValidJson(responseText) && CustomError.isInLineError(response)) {
            var errorCode = response.getResponseJSON().errors[0].code;
            var errorReason = dictionary.errorCodes[errorCode];
            if (errorReason) {
                return errorReason;
            }
        }
        return messageUtils.getErrorMessage(response.getStatus(), responseText).userMessage.body;
    }

});