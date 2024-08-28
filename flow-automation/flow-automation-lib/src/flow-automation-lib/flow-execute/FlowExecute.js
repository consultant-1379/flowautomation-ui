define([
    'jscore/core',
    'jscore/ext/net',
    './FlowExecuteView',
    'flow-automation-lib/services/Notifications',
    'flow-automation-lib/services/CustomError',
    'container/api',
    'i18n!flow-automation-lib/dictionary.json',
    'widgets/InlineMessage',
    'jscore/ext/keyboard'
], function (core, net, View, Notifications, CustomError, container, dictionary, InlineMessage, keyboard) {

    /**
     * verify is exist the option inside the dialog, if exist return the permission
     * @param optionalParameters
     * @returns {boolean|*}
     */
    function _isValidPermissionValue(optionalParameters) {
        var checkUserFlowExecutionPermission = optionalParameters ? optionalParameters.split(":") : undefined;
        if (checkUserFlowExecutionPermission && checkUserFlowExecutionPermission.length !== 0 && checkUserFlowExecutionPermission.length < 3) {
            return checkUserFlowExecutionPermission[1];
        }
        return false;
    }

    return core.Widget.extend({

        init: function (options) {
            this.eventBus = options.eventBus;
            this.flowName = options.flowName;
        },

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this.view.getFlowInstanceNameInput().addEventHandler('keyup', function (e) {
                e.preventDefault();
                this.isValid();
            }.bind(this));

            keyboard.addEventHandler('enter', function () {
                this.eventBus.publish('FlowExecute:execute');
            }.bind(this), this.view.getFlowInstanceNameInput());

            this.view.setFlowInstanceNameInput(this.flowName);
        },

        executeFlow: function (executeFlowData, dialog, selectedFlowData) {
            this.dialog = dialog;
            this.selectedFlowData = selectedFlowData;

            container.getEventBus().publish('container:loader');

            var flowId = selectedFlowData.flowId || selectedFlowData.id;

            net.ajax({
                url: '/flowautomation/v1/flows/' + flowId + '/execute',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                headers: {
                    'checkUserFlowExecutionPermission': _isValidPermissionValue(dialog.options.optionalContent)
                },
                data: JSON.stringify({
                    name: executeFlowData.name.trim()
                }),
                success: this.executeFlowSuccess.bind(this),
                error: this.executeFlowError.bind(this)
            });

            return true;
        },

        executeFlowSuccess: function (data) {
            this.dialog.destroy();
            container.getEventBus().publish('container:loader-hide');
            this.trigger('flowstart:success', data);
        },

        _handlePermissionError: function (responseJson) {
            var errors = responseJson ? responseJson.errors : undefined;
            var errorCode = errors ? errors[0].code : undefined;
            if (errorCode && errorCode === "flow-execution-2181") {
                this.dialog.options.optionalContent = "checkUserFlowExecutionPermission:false";
            }
        },

        executeFlowError: function (error, response) {
            this.dialog.show();
            var errorMessage = dictionary.get('execute.failureMessage') + ' - ' + this.selectedFlowData.name;
            CustomError.flowsErrorHandling(response, this.dialog, errorMessage, this);
            container.getEventBus().publish('container:loader-hide');

            this._handlePermissionError(response.getResponseJSON());

            if ((!CustomError.isValidJson(response.getResponseText())) || (!CustomError.isInLineError(response))) {
                this.dialog.hide();
            }
        },

        showValidationError: function (text) {
            this.view.setValidationError(text);
        },

        setFlowSetupPhaseRequiredMessage: function () {
            var inlineMessage = new InlineMessage({
                icon: 'infoMsgIndicator',
                header: dictionary.get('execute.setupPhaseRequiredNote')
            });
            inlineMessage.attachTo(this.view.getFlowSetupPhaseRequiredMessage());
        },
        /**
         * Check validity of flow name
         *
         * @returns {Boolean} isValid
         */
        isValid: function () {
            var flowInstanceName = this.view.getFlowInstanceName();
            var deniedChars = new RegExp('[^A-Za-z0-9 _\\\\-]', 'g');
            var specialCharsStart = new RegExp('^([- ]|[_ ])');
            if (flowInstanceName === undefined || flowInstanceName === null || flowInstanceName === "") {
                this.view.setValidationError(dictionary.get('execute.validateName.nameRequired'));
            } else if (specialCharsStart.test(flowInstanceName)) {
                this.view.setValidationError(dictionary.get('execute.validateName.cannotStartWithSpecial'));
            } else if (flowInstanceName.length > 128) {
                this.view.setValidationError(dictionary.get('execute.validateName.flowInstanceNameLengthExceeded'));
            } else if (deniedChars.test(flowInstanceName)) {
                this.view.setValidationError(dictionary.get('execute.validateName.specialCharsNotAllowed'));
            } else {
                this.view.removeValidationError();
                return true;
            }
            return false;
        },

        getInstanceData: function () {

            var flowInstanceName = this.view.getFlowInstanceName();

            if (this.isValid() === false) {
                return false;
            }

            return {
                name: flowInstanceName
            };
        }
    });
});