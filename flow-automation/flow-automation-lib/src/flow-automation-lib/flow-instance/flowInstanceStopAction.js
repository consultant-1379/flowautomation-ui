define([
    'jscore/ext/net',
    'container/api',
    'widgets/Dialog',
    'flow-automation-lib/services/CustomError',
    'flow-automation-lib/services/messageUtils',
    'flow-automation-lib/helper/execution',
    'i18n!flow-automation-lib/dictionary.json',
    'flow-automation-lib/helper/Loader'
], function (net, container, Dialog, CustomError, messageUtils, execution, dictionary, Loader) {


    return {
        getAction: function (request) {
            if (isStopAllowed(request)) {
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
                            action: onConfirmStopFlowInstance.bind(this, request.flowInstance)
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

    function isStopAllowed(request) {
        return (!execution.isInExecutingState(request.flowInstance.state) || execution.isInternalFlowInstance(request.flowInstance.flowSource));
    }

    function onConfirmStopFlowInstance(flowInstance) {
        Loader.show();
        net.ajax({
            url: '/flowautomation/v1/executions/' + flowInstance.name + '/stop' + '?flow-id=' + flowInstance.flowId,
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            success: function () {
                Loader.hide();
                this.confirmStopInstanceDialog.destroy();
                this.eventBus.publish('FlowInstance:notify', dictionary.get('flowInstance.stop.success'), flowInstance);
            }.bind(this),
            error: onStopFlowInstanceError.bind(this)
        });
    }

    function onCancelStopFlowInstance() {
        this.confirmStopInstanceDialog.destroy();
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