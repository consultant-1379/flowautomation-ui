define([
    'jscore/core',
    './UserTaskFormView',
    '../widgetProducer/WidgetProducer',
    'i18n!flow-instance-details/dictionary.json',
    '../../widgets/element/text/Text',
    'widgets/Dialog',
    'widgets/Loader',
    '../../widgets/panel/review-panel/UserTaskReviewPanel',
    '../../utils/SchemaUtil',
    'flow-automation-lib/helper/utils'
], function (core, View, WidgetProducer, dictionary, Text,
             Dialog, Loader, UserTaskReviewPanel, SchemaUtil, utils) {
    'use strict';

    return core.Region.extend({

        View: View,

        onStart: function () {
            this.clearDefaultButtonsSubscription = this.getEventBus().subscribe('UserTasks:noUserTasks', this.onDestroyActionButtons.bind(this));
            this.view.hideHeaderTitle();
        },

        onStop: function () {
            this.onDestroy();
            this.getEventBus().unsubscribe('UserTasks:noUserTasks', this.clearDefaultButtonsSubscription);
        },

        onDestroyFormElements: function () {
            if (this.formElements && this.formElements.length > 0) {
                for (var i = 0; i < this.formElements.length; i++) {
                    if (this.formElements[i]) {
                        this.formElements[i].destroy();
                    }
                }
            }
            // after destroy elements clear the error context
            this.view.hideError();
            this.resizeFormContent();
        },

        onDestroyActionButtons: function () {
            if (this.actions) {
                this.actions.destroy();
                this.actions = undefined;
            }
        },

        onDestroy: function () {
            this.title = undefined;
            this.onDestroyFormElements();
            this.onDestroyActionButtons();
            this.userTaskId = undefined;
            this.formElements = undefined;
            this.userTaskName = undefined;
            this.userTaskNameExtra = undefined;
        },

        disableActionButton: function () {
            if (this.actions) {
                this.actions.disableContinueButton();
            }
        },

        enableActionButton: function () {
            if (this.actions) {
                this.actions.enableContinueButton();
            }
        },

        renderElements: function () {
            this.view.showHeaderTitle();
            this.title = dictionary.task + ': ' + utils.concatIfExist(this.userTaskName, this.userTaskNameExtra);
            this.isConfirmAndReview = false;
            this.view.setHeaderTitle(this.title);
            if (!this.schema.properties) {
                return;
            }
            this.formElements = [];
            if ((this.schema.format && this.schema.format === 'informational')) {
                var userTaskReviewPanel = this.createUserTaskReviewPanel(this.schema);
                this.isConfirmAndReview = true;
                this.formElements = userTaskReviewPanel.widgetElements;
            } else {
                this.genericElement = this.setElement(this.schema);
                this.formElements = this.genericElement.widgetElements;
            }
            this.getEventBus().publish('UserTask:isConfirmAndReview', this.isConfirmAndReview);
            this.attachElementsToForm();
            this.addScrollListener();
        },

        addScrollListener: function () {
            var divScroll = this.view.getFormContentScrollbar();
            if (divScroll) {
                divScroll.addEventListener('change', this.resize.bind(this));

                if (Math.ceil(divScroll.scrollHeight) > Math.ceil(divScroll.offsetHeight)) {
                    divScroll.addEventListener('scroll', this.scrollVisitor.bind(this));
                }
            }
        },

        resize: function () {
            var divScroll = this.view.getFormContentScrollbar();
            if (divScroll) {
                if (this.betweenInterval(Math.ceil(divScroll.scrollHeight - divScroll.offsetHeight), Math.ceil(divScroll.scrollTop), 1)) {
                    this.enableActionButton();
                }
            }
        },

        scrollVisitor: function () {
            var divScroll = this.view.getFormContentScrollbar();
            if (divScroll) {
                var scrollTop = divScroll.scrollTop;
                var scrollHeight = divScroll.scrollHeight;
                var offsetHeight = divScroll.offsetHeight;

                var contentHeight = Math.ceil(scrollHeight - offsetHeight);
                var topHeight = Math.ceil(scrollTop);
                if (this.betweenInterval(contentHeight, topHeight, 1)) {
                    // Now this is called when scroll end!
                    this.enableActionButton();
                }
            } else {
                this.enableActionButton();
            }
        },

        /**
         * Checks if an integer is within ±x another integer.
         *
         * @param {int} op - The integer in question
         * @param {int} target - The integer to compare to
         * @param {int} range - the range ±
         */
        betweenInterval: function (op, target, range) {
            return op >= (target - range) && op <= (target + range);
        },

        resizeFormContent: function (inFlyout) {
            var windowHeight = window.innerHeight;
            var contentHeight;
            if (inFlyout) {
                //This is called before the the flyout is actually rendered so there is nothing to measure against,
                //therefore using window height - 210, based on testing -> this could be improved
                contentHeight = windowHeight - 210;
            } else {
                //using position of usertask form header subtracted from window height, and subtracting 82 to allow for the action panel at the bottom.
                //This is because there are scenarios where the action panel is not yet defined when this code is ran
                var headerPosition = this.view.getUserTaskFormHeader().getPosition();
                contentHeight = windowHeight - headerPosition.bottom - 82;
            }
            this.view.getFormContent().setStyle("max-height", contentHeight + "px");
        },

        attachElementsToForm: function () {
            for (var element in this.formElements) {
                if (this.formElements[element]) {
                    this.formElements[element].attachTo(this.view.getFormContent());
                    this.formElements[element].view.indent(this.formElements[element].indentLevel * 28, this.formElements[element].isConfirmAndReview);
                }
            }
        },

        setElement: function (schema) {
            return new WidgetProducer({
                schemaForTask: schema,
                context: this.getContext()
            });
        },

        getUserTaskFormContent: function () {
            return this.view.getUserTaskFormContent();
        },

        createUserTaskReviewPanel: function (schema) {
            return new UserTaskReviewPanel({
                schemaForTask: schema
            });
        },

        handleValidation: function (validationTriggeredByContinueButton) {
            this.thereAreValidationErrors();
            if (this.errorCounter > 0) {
                this.view.setErrorMessage(this.errorCounter + dictionary.get("errors.numValidationError"));
                if (validationTriggeredByContinueButton) {
                    this.view.showError();
                }
                this.resizeFormContent();
            } else {
                this.view.hideError();
                this.resizeFormContent();
            }
            return this.errorCounter > 0;
        },

        handleFlowValidationError: function (reason) {
            this.view.setErrorMessage(reason);
            this.view.showError();
            this.resizeFormContent();
        },

        createFormPayload: function () {
            var formData = new FormData();
            var userTaskInputFiles = [];
            var userTaskResponse = {};
            if (this.handleValidation(true)) {
                return;
            }
            if (!this.schema.format || this.schema.format !== 'informational') {
                this.addReturnValuesToSchema(userTaskInputFiles);
                userTaskResponse = SchemaUtil.walkSchema(this.schema);
            }
            for (var j = 0; j < userTaskInputFiles.length; j++) {
                formData.append("usertask-input-files", userTaskInputFiles[j]);
            }
            formData.append("usertask-input", JSON.stringify(userTaskResponse));
            return formData;
        },

        addEventHandlersToListenForInputChanges: function (input) {
            if (this.formElements[input] && !this.formElements[input].eventHandlerId) {
                this.formElements[input].eventHandlerId = this.formElements[input].addEventHandler('Text:InputValidation', this.handleValidation, this);
            }
        },

        thereAreValidationErrors: function () {
            var atLeastOneRequiredIsNotPresent = false;
            var oneInvalidInput = false;
            this.errorCounter = 0;
            var thisElementInError = false;
            for (var input in this.formElements) {
                this.addEventHandlersToListenForInputChanges(input);
                if (this.formElements[input] && this.formElements[input].error) {
                    oneInvalidInput = true;
                    thisElementInError = true;
                }
                if (this.formElements[input] && this.formElements[input].required) {
                    if (this.formElements[input].requiredFieldIsEmpty()) {
                        atLeastOneRequiredIsNotPresent = true;
                        thisElementInError = true;
                    }
                }
                if (thisElementInError) {
                    this.errorCounter++;
                    thisElementInError = false;
                }
            }
            return oneInvalidInput || atLeastOneRequiredIsNotPresent;
        },

        addReturnValuesToSchema: function (userTaskInputFiles) {
            for (var i = 0; i < this.formElements.length; i++) {
                if (this.formElements[i]) {
                    this.formElements[i].getValue(userTaskInputFiles);
                }
            }
        },

        //------------------------------------------ Overridden functions from Fly out Panel  ---------------------------------
        onShow: function () {
            //Hiding the flyout panel Header, to avoid having to hide, (and then show), the user task form header
            document.getElementsByClassName("eaFlyout-panelHeader").item(0).style = "display: none";
        },

        onHide: function () {
            this.isFlyoutShown = false;

            //Timeout is required here as the flyout will detach its content after this function is called.
            setTimeout(function () {
                this.getEventBus().publish('UserTaskForm:onFlyoutClose', this.title);
            }.bind(this), 300);
        }
    });
});
