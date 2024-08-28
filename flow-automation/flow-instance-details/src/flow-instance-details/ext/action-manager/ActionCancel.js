define([
    'widgets/Dialog',
    'i18n!flow-instance-details/dictionary.json',
    './Rest',
    '../utils/UriInfo',
    'flow-automation-lib/helper/execution',
    'flow-automation-lib/helper/Loader'
], function (Dialog, dictionary, Rest, UriInfo, execution, Loader) {
    return {
        getAction: function (request) {

            if (!execution.isInSetupPhase(UriInfo.getState())) {
                return {};
            }

            this.locationController = request.locationController;
            this.executionName = UriInfo.getExecutionName();
            this.flowId = UriInfo.getFlowId();
            this.classRef = request.classRef;

            return {
                name: dictionary.get("actions.discard"),
                type: 'button',
                action: function () {
                    this.dialogWidget = new Dialog({
                        header: dictionary.cancel.header,
                        content: dictionary.cancel.content,
                        buttons: [{
                            focused: true,
                            caption: dictionary.cancel.button,
                            color: "darkBlue",
                            action: onSubmit.bind(this)
                        }, {
                            caption: dictionary.get("actions.cancel"),
                            action: onCancel.bind(this)
                        }]
                    });
                    this.dialogWidget.show();
                }.bind(this)
            };
        }
    };

    function onSubmit() {
        this.dialogWidget.destroy();
        Loader.show();
        Rest.deleteExecution(this.executionName, this.flowId).then(function () {
            this.classRef.onStop();
            Loader.hide();
            this.locationController.setLocation('flow-automation/flowinstances');
        }.bind(this));
    }

    function onCancel() {
        this.dialogWidget.destroy();
    }
});