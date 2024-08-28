define([
    'jscore/ext/net',
    'container/api',
    'widgets/Dialog',
    'flow-automation-lib/services/CustomError',
    'flow-automation-lib/services/messageUtils',
    'flow-automation-lib/helper/execution',
    'i18n!flow-automation/dictionary.json',
    'flow-automation-lib/helper/Loader',
], function (net, container, Dialog, CustomError, messageUtils, execution, dictionary, Loader) {

    return {
        getAction: function (request) {
            if (_isDeletionAllowed(request)) {
                var key = execution.isInSetupPhase(request.flowInstance.state) ? "actions.discard." : "actions.delete.";
                this.eventBus = request.eventBus;
                return {
                    name: dictionary.get(key + "title"),
                    type: 'button',
                    icon: {
                        name: 'delete',
                        prefix: 'ebIcon',
                        position: 'left'
                    },
                    action: function () {
                        this.confirmInstanceDialog = new Dialog({
                            header: dictionary.get(key + "header"),
                            content: dictionary.get(key + "content"),
                            buttons: [{
                                focused: true,
                                caption: dictionary.get(key + "confirm"),
                                action: _deleteFlow.bind(this, request.flowInstance)
                            }, {
                                caption: dictionary.get('actions.delete.cancel'),
                                action: _onCancel.bind(this)
                            }]
                        });
                        this.confirmInstanceDialog.view.contentBlock.setModifier("type_warning");
                        this.confirmInstanceDialog.view.content.setStyle("width", "300px");
                        this.confirmInstanceDialog.show();
                    }.bind(this)
                };
            }
            return {};
        }
    };

    /**
     * It will be allow when the flow it is not internal flow and it is in final state
     * @param request
     * @returns {boolean}
     */
    function _isDeletionAllowed(request) {
        return !execution.isInternalFlowInstance(request.flowInstance.flowSource) &&
            !execution.isInIntermediateState(request.flowInstance.state);
    }

    function _deleteFlow(flowInstance) {
        Loader.show();
        net.ajax({
            url: '/flowautomation/v1/executions/' + flowInstance.name + '?flow-id=' + flowInstance.flowId,
            type: 'DELETE',
            dataType: 'json',
            contentType: 'application/json',
            success: _onSuccess.bind(this, flowInstance),
            error: _onError.bind(this)
        });
    }

    function _onCancel() {
        this.confirmInstanceDialog.destroy();
    }

    function _onSuccess(flowInstance) {
        Loader.hide();
        this.confirmInstanceDialog.destroy();
        this.eventBus.publish('FlowInstance:notifyDeletion', dictionary.get('actions.delete.success'), flowInstance);
    }

    function _onError(data, xhr) {
        Loader.hide();
        this.confirmInstanceDialog.destroy();
        var deleteFailedDialog = new Dialog({
            type: 'error',
            header: dictionary.get('actions.delete.errorDialog.header'),
            content: getErrorReason(xhr),
            buttons: [{
                caption: dictionary.get('actions.delete.errorDialog.ok'),
                action: function () {
                    deleteFailedDialog.hide();
                },
                color: 'darkBlue'
            }]
        });
        deleteFailedDialog.show();
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