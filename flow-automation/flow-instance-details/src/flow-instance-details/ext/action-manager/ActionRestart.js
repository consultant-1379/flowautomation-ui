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
            this.classRef = request.classRef;
            return {
                name: dictionary.actions.restart,
                type: 'button',
                action: function () {
                    this.restartDialogWidget = new Dialog({
                        header: dictionary.restart.header,
                        content: dictionary.restart.content,
                        buttons: [{
                            focused: true,
                            caption: dictionary.restart.button,
                            color: "darkBlue",
                            action: onRestart.bind(this)
                        }, {
                            caption: dictionary.get("actions.cancel"),
                            action: onCancel.bind(this)
                        }]
                    });
                    this.restartDialogWidget.show();
                }.bind(this)
            };
        }
    };

    function onRestart() {
        this.restartDialogWidget.destroy();
        Loader.show();
        Rest.deleteExecution(UriInfo.getExecutionName(), UriInfo.getFlowId()).then(function () {
            Rest.createExecution(UriInfo.getExecutionName(), UriInfo.getFlowId()).then(function () {
                this.classRef.onStop();
                Loader.hide();
                location.reload(true);
            }.bind(this));
        }.bind(this));
    }

    function onCancel() {
        this.restartDialogWidget.destroy();
    }

});