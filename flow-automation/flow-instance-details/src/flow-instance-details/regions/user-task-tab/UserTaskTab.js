define([
    'jscore/core',
    'jscore/ext/net',
    './UserTaskTabView',
    '../user-task-form/UserTaskForm',
    '../user-tasks/UserTasks',
    'container/api',
    'i18n!flow-instance-details/dictionary.json',
    '../../widgets/panel/action-panel/ActionPanel',
    'widgets/Dialog',
    'flow-automation-lib/helper/execution',
    '../../ext/utils/UriInfo',
    'widgets/Loader',
    'flow-automation-lib/services/CustomError',
    '../../ext/utils/net',
    '../../ext/utils/i18nTranslator',
    '../../widgets/user-task-multi-submit/UserTaskMultiSubmit',
    'flow-automation-lib/services/PollingSynchronizer',
    'flow-automation-lib/helper/utils',
    '../../widgets/user-task-backnavigation/ConfirmNavigation',
    '../setup-data/SetupData'
], function (core, net, View, UserTaskForm, UserTasks, container, dictionary, ActionPanel, Dialog, execution, UriInfo,
             Loader, customError, utilsNet, i18nTranslator, UserTaskMultiSubmit, PollingSynchronizer, utils, ConfirmNavigation, SetupData) {
    'use strict';
    var resizeTimeout;
    var defaultUrl = '/flowautomation/v1/executions/usertasks/';

    return core.Region.extend({

        View: View,

        onViewReady: function () {
            this.userTaskForm = new UserTaskForm({
                context: this.getContext()
            });

            this.userTasks = new UserTasks({
                context: this.getContext()
            });
            this.userTaskTabIsSelected = false;
            this.userTaskForm.isFlyoutShown = false;
        },

        onStart: function () {
            this.userTasks.start(this.view.getUserTasks());
            this.userTaskForm.start(this.view.getUserTasksDetails());
            this.handleEvents();
            this.hideConfirmDialog = false;
        },

        handleEvents: function () {
            this.eventBus = this.getEventBus();

            window.addEventListener("resize", this.resizeThrottler.bind(this));

            //FlowInstanceDetails events
            this.listenToTabsChange = this.eventBus.subscribe('FlowInstanceDetails:tabSelectionChanged', this.tabSelectionHasChanged.bind(this));

            //UserTaskForm events
            this.flyOutClose = this.eventBus.subscribe('UserTaskForm:onFlyoutClose', this.onFlyOutClose, this);

            //UserTasks events
            this.createForm = this.eventBus.subscribe('UserTasks:createForm', this.handleCreateUserTaskForm, this);
            this.updateActionButtons = this.eventBus.subscribe('UserTasks:updateActionButtons', this.handleUpdateUserTaskActionButtons, this);
            this.showFlyout = this.eventBus.subscribe('UserTasks:showFlyout', this.handleShowFlyOut, this);
            this.noUserTasks = this.eventBus.subscribe('UserTasks:noUserTasks', this.handleNoUserTasks, this);
            this.activeUserTask = this.eventBus.subscribe('UserTasks:activeUsertasks', this.handleUserTaskButtonWhenActiveUserTask, this);
        },

        tabSelectionHasChanged: function (title) {
            if (title.includes(dictionary.userTasks)) {
                this.userTaskTabIsSelected = true;
                this.userTaskForm.resizeFormContent();
            } else {
                this.userTaskTabIsSelected = false;
            }
        },

        onStop: function () {
            window.removeEventListener("resize", this.resizeThrottler.bind(this));

            //FlowInstanceDetails events
            this.eventBus.unsubscribe('FlowInstanceDetails:tabSelectionChanged', this.listenToTabsChange);

            //UserTaskForm events
            this.eventBus.unsubscribe('UserTaskForm:onFlyoutClose', this.flyOutClose);

            //UserTasks events
            this.eventBus.unsubscribe('UserTasks:createForm', this.createForm);
            this.eventBus.unsubscribe('UserTasks:updateActionButtons', this.updateActionButtons);
            this.eventBus.unsubscribe('UserTasks:showFlyout', this.showFlyout);
            this.eventBus.unsubscribe('UserTasks:noUserTasks', this.noUserTasks);
            this.eventBus.unsubscribe('UserTasks:activeUsertasks', this.activeUserTask);

            this.userTaskForm.stop();
            this.userTasks.stop();
        },

        // ---------------------------- User Tasks and User Task Form functions --------------------------------------

        //Handles scenario in Execution phase when in mobile mode the button is hidden when no user tasks but needs to be shown when there are user tasks
        handleUserTaskButtonWhenActiveUserTask: function () {
            if (this.view.isMobileSize() && this.userTaskForm.isFlyoutShown === false) {
                this.userTasks.view.showUserTaskButton();
            }
        },

        //Uses the polling that is started in FlowInstanceDetails
        handlePollingInUserTab: function () {
            this.userTasks.handlerPollingInUserTasks();
        },

        handleCreateUserTaskForm: function (data) {
            this.thereAreUserTasks = true;
            this.userTaskForm.view.showHeader();
            this.handleResize();
            this.renderUserTaskForm(data);
        },

        handleUpdateUserTaskActionButtons: function (data) {
            if (this._actionButtonsNeedUpdate(data)) {
                this.renderActionButton(data.userTaskId, data.allUserTasksInSelectedGroup, data.forceEnableActionButton);
            }
        },

        _actionButtonsNeedUpdate: function (data) {
            if (data.userTaskId === this.userTaskForm.userTaskId) {
                if ((data.allUserTasksInSelectedGroup && !this.allUserTasksInSelectedGroup) ||
                    (!data.allUserTasksInSelectedGroup && this.allUserTasksInSelectedGroup) ||
                    (data.allUserTasksInSelectedGroup && this.allUserTasksInSelectedGroup && data.allUserTasksInSelectedGroup.length !== this.allUserTasksInSelectedGroup.length)) {
                    return true;
                }
            }
            return false;
        },

        handleNoUserTasks: function () {
            this.thereAreUserTasks = false;
            if (this.userTaskForm.isFlyoutShown) {
                container.getEventBus().publish('flyout:hide');
            }
            this.destroyLoader();
            this.userTaskForm.view.hideHeader();
            this.userTasks.view.hideUserTaskButton();
            this.userTaskForm.onDestroy();
        },

        _fetchAndFillUserTaskFormData: function (data, i18nResponse) {
            this.fetchUserTaskFormData(data.userTaskId)
                .then(function (response) {
                    if (this.userTaskForm && data.userTaskId !== this.userTaskForm.userTaskId) {  //redraw thw form only if the user task is changed to avoid resetting data when user is in the middle of form filling
                        this.userTaskForm.onDestroyFormElements();
                        this.userTaskForm.onDestroyActionButtons();
                        try {
                            this.destroyLoader();

                            if (i18nResponse && i18nResponse.dictionary) {
                                this.userTaskForm.schema = i18nTranslator.applyDictionary(JSON.parse(response.schema), i18nResponse);
                            } else {
                                this.userTaskForm.schema = i18nTranslator.applyDictionaryWithJson(JSON.parse(response.schema), i18nResponse);
                            }

                            if (this.userTaskForm.schema.name === "Review and Confirm Execute") { // set static dictionary for review
                                this.userTaskForm.schema.name = dictionary.get("internal.reviewAndConfirm.name");
                            }

                            this.userTaskForm.userTaskId = response.id;
                            this.allUserTasksInSelectedGroup = data.allUserTasksInSelectedGroup;
                            this.userTaskForm.userTaskName = this.userTaskForm.schema.name || data.userTaskName;
                            this.userTaskForm.userTaskNameExtra = this.userTaskForm.schema.nameExtra || data.userTaskNameExtra;
                            this.userTaskForm.taskDefinitionId = response.taskDefinitionId;
                            this.userTaskForm.renderElements();
                        } catch (ignored) {
                            this.userTaskForm.onDestroy();
                            this.allUserTasksInSelectedGroup = undefined;
                        }
                    }
                    this.renderActionButton(data.userTaskId, data.allUserTasksInSelectedGroup, data.forceEnableActionButton);
                }.bind(this));
        },

        renderUserTaskForm: function (data) {
            if (data.userTaskId) {
                this.getInternationalDictionary(data);
            }
        },

        destroyLoader: function () {
            if (this.loader) {
                this.loader.destroy();
                this.loader = undefined;
            }
        },

        attachUserTaskForm: function () {
            this.userTaskForm.attach(this.view.getUserTasksDetails());
        },

        onComplete: function () {
            var userTaskForm = this.userTaskForm;
            var thisVariable = this;

            if (this.userTaskForm.taskDefinitionId === 'FAInternal-review-confirm-execute') {
                var confirmationDialog = new Dialog({
                    header: dictionary.get("confirmation.header"),
                    content: dictionary.get("confirmation.content"),
                    buttons: [{
                        caption: dictionary.get("actions.execute"),
                        action: startFlowExecutionAfterConfirmation
                    }, {
                        caption: dictionary.get("actions.cancel"),
                        action: destroyConfirmationDialog
                    }]
                });
                confirmationDialog.show();
            } else {
                var formPayload = this.userTaskForm.createFormPayload();
                if (formPayload) {
                    this.executeComplete(formPayload);
                }
            }

            function destroyConfirmationDialog() {
                confirmationDialog.destroy();
            }

            function startFlowExecutionAfterConfirmation() {
                confirmationDialog.destroy();
                var confirmationFormPayload = userTaskForm.createFormPayload();
                if (confirmationFormPayload) {
                    thisVariable.executeComplete(confirmationFormPayload);
                }
            }
        },

        isFlowValidationError: function (response) {
            return customError.isFlowAutomationError(response) && response.xhr.getResponseJSON().errors[0].code === 'error.fa.usertask.input.invalid';
        },

        executeComplete: function (formPayload) {
            if (this.userTaskForm.userTaskId) {
                this.handleLoader();
                this.complete(this.userTaskForm.userTaskId, formPayload)
                    .then(function () {
                        this.userTasks.onComplete();
                    }.bind(this), function (response) {
                        // check flow validation error, this can be thrown from within the flow and error code starts with error.fa
                        if (this.isFlowValidationError(response)) {
                            this.destroyLoader();
                            this.userTaskForm.handleFlowValidationError(response.xhr.getResponseJSON().errors[0].errorMessage);
                        } else {
                            customError.userTasksErrorHandling(response);
                            this.destroyLoader();
                        }
                        this.userTasks.onComplete();

                    }.bind(this));
            }
        },

        executeBack: function () {
            if (this.userTaskForm.userTaskId) {
                this.handleLoader();
                this.back(this.userTaskForm.userTaskId)
                    .then(function () {
                        this.userTasks.onComplete(); //this brings new tasks etc.
                    }.bind(this), function (response) {
                        customError.userTasksErrorHandling(response);
                        this.destroyLoader();
                        this.userTasks.onComplete();
                    }.bind(this));
            }
        },

        handleLoader: function () {
            if (!this.loader) {
                this.loader = new Loader({loadingText: dictionary.get("loaderMessage")});
                this.loader.attachTo(this.userTaskForm.getUserTaskFormContent());
                this.userTaskForm.disableActionButton();
            }
        },

        // ---------------------------- rest requests -----------------------------------------

        complete: function (userTaskId, dataJSON) {
            return utilsNet.ajax({
                url: defaultUrl + userTaskId + '/complete',
                type: 'POST',
                contentType: false,
                processData: false,
                data: dataJSON,
                dataType: 'multipart/form-data'
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                throw response;
            });
        },

        back: function (currentTaskId) {
            return utilsNet.ajax({
                url: defaultUrl + currentTaskId + '/back',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json'
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                throw response;
            });
        },

        fetchUserTaskFormData: function (userTaskId) {
            return utilsNet.ajax({
                url: defaultUrl + userTaskId + '/schema',
                type: 'GET',
                dataType: 'json'
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                var notification = customError.userTasksErrorHandling(response);
                if (notification) {
                    notification.attachTo(this.getElement());
                }
            }.bind(this));
        },

        getInternationalDictionary: function (data) {
            net.ajax({
                url: defaultUrl + data.userTaskId + '/dictionary',
                type: 'GET',
                dataType: 'json',
                success: function (i18nResponse) {
                    this._fetchAndFillUserTaskFormData(data, i18nResponse);
                }.bind(this),
                error: function (ignore) {
                    var i18nResponse;
                    if (data.userTaskName === "Choose Setup") { // set static dictionary for choose setup
                        i18nResponse = dictionary.get("internal.chooseSetup");
                    }
                    // ignore others cases because they need to be provided by flow
                    this._fetchAndFillUserTaskFormData(data, i18nResponse);
                }.bind(this)
            });
        },

        // ---------------------------- Flyout panel functions ----------------------------------
        onFlyOutClose: function () {
            this.userTaskForm.isFlyoutShown = false;
            this.handleResize();
        },

        handleShowFlyOut: function () {
            this.userTaskForm.isFlyoutShown = true;
            this.attachUserTaskForm();
            this.userTaskForm.resizeFormContent(true);
            var header = dictionary.task + ': ' + this.userTaskForm.userTaskName +
                (utils.isBlank(this.userTaskForm.userTaskNameExtra) ? utils.EMPTY : ' - ' + this.userTaskForm.userTaskNameExtra);
            container.getEventBus().publish('flyout:show', {
                header: header,
                content: this.userTaskForm,
                width: '85%'
            });
        },

        // ---------------------------- Resize functions ------------------------------------
        resizeThrottler: function () {
            // ignore resize events as long as an actualResizeHandler execution is in the queue
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(function () {
                    resizeTimeout = null;
                    this.handleResize();

                    // The actualResizeHandler will execute at a rate of 15fps
                }.bind(this), 66);
            }
        },

        handleResize: function () {
            if (this.userTaskForm.isFlyoutShown === false) {
                if (this.view.isMobileSize() && this.userTaskTabIsSelected) {
                    if (this.userTaskForm.isAttached()) {
                        this.userTaskForm.detach();
                    }
                    if (this.thereAreUserTasks) {
                        this.userTasks.view.showUserTaskButton();
                    }
                    this.view.getUserTasks().setStyle("width", "100%");
                } else if (this.userTaskTabIsSelected) {
                    this.userTasks.view.hideUserTaskButton();
                    this.userTaskForm.resizeFormContent();
                    this.attachUserTaskForm();

                    //Handles the case where, user in mobile size mode, then navigates outside of the flow instance details page,
                    // then the screen is resized, then navigates back
                    if (this.view.getUserTasks().getPosition().right > 330) {
                        this.view.getUserTasks().setStyle("width", "20%");
                    }
                }
            }
        },

        // ---------------------------- Action panel functions ----------------------------------

        onBack: function () {
            if (this.userTaskForm.taskDefinitionId === 'FAInternal-review-confirm-execute' || this.hideConfirmDialog) { //Dont show the dialog if navigating back from the Review and Confirm usertask or if the remember decision true.
                this.executeBack();
            } else {
                this.confirmNavigationContent = new ConfirmNavigation({
                    context: this.getContext(),
                    eventBus: this.getEventBus()
                });

                var confirmationDialog = new Dialog({
                    type: "warning",
                    fullContent: true,
                    content: this.confirmNavigationContent,
                    buttons: [{
                        caption: dictionary.get("userTask.backNavigation.confirm"),
                        action: function () {
                            this.hideConfirmDialog = this.confirmNavigationContent.isRememberUserActionChecked();
                            confirmationDialog.destroy();
                            this.executeBack();
                        }.bind(this)
                    }, {
                        caption: dictionary.get("userTask.backNavigation.cancel"),
                        action: function () {
                            confirmationDialog.destroy();
                        }
                    }]
                });
                confirmationDialog.show();
            }
        },
        onPreview: function () {
            container.getEventBus().publish("flyout:show", {
                header: dictionary.get("userTask.previewHeader"),
                content: new SetupData({context: this.getContext(), onlyLastExpanded: true}),
                width: '60%'
            });
        },

        renderActionButton: function (selectedUsertaskId, userTasksInSelectedGroup, forceEnableActionButton) {
            if (this.userTaskForm.actions) {
                this.userTaskForm.actions.destroy();
                this.userTaskForm.actions = undefined;
            }

            if (userTasksInSelectedGroup && userTasksInSelectedGroup.length > 1) {
                var allUserTasks = userTasksInSelectedGroup.map(function (task) {
                    return task;
                });
                var actionName = this.userTaskForm.schema.actions ? this.userTaskForm.schema.actions[0] : this.userTaskForm.schema.action;
                this.userTaskForm.actions = new ActionPanel({
                    actions: [{
                        name: actionName,
                        color: 'paleBlue',
                        onClick: this.onComplete.bind(this)
                    },
                        {
                            name: "submitmultipletasks",
                            onClick: this.onCompleteAll.bind(this, selectedUsertaskId, allUserTasks)
                        }
                    ]
                });
            } else {
                var actions = [];
                if (this.userTaskForm.schema.actions) {
                    this.userTaskForm.schema.actions.forEach(function (action) {
                        if (action === 'Back') {
                            actions.push({
                                name: 'Back',
                                color: 'grey',
                                icon: {
                                    name: 'leftArrowLarge',
                                    prefix: 'ebIcon',
                                    position: 'left'
                                },
                                onClick: this.onBack.bind(this)
                            });
                        } else if (action === 'Preview') {
                            actions.push({
                                name: 'Preview',
                                color: 'grey',
                                onClick: this.onPreview.bind(this)
                            });
                        } else {
                            actions.push({
                                name: action,
                                color: 'paleBlue',
                                icon: {
                                    name: 'rightArrowLarge_white',
                                    prefix: 'ebIcon',
                                    position: 'right'
                                },
                                onClick: this.onComplete.bind(this)
                            });
                        }
                    }.bind(this));
                } else { //Backward compatibility during upgrade scenario.
                    actions.push({
                        name: this.userTaskForm.schema.action,
                        color: 'paleBlue',
                        onClick: this.onComplete.bind(this)
                    });
                }

                this.userTaskForm.actions = new ActionPanel({
                    actions: actions
                });
            }
            this.userTaskForm.actions.attachTo(this.userTaskForm.view.getFormActions());

            // Enable/Disable continue button as per scroll existence
            if (!forceEnableActionButton) {
                var divScroll = this.userTaskForm.view.getFormContentScrollbar();
                if (divScroll && Math.ceil(divScroll.scrollHeight) > Math.ceil(divScroll.offsetHeight)) {
                    this.userTaskForm.disableActionButton();
                }
            }
        },

        onCompleteAll: function (selectedUsertaskId, allUserTasks) {
            PollingSynchronizer.stop(); // stopping polling for show the multi submit
            var userTaskMultiSubmit = new UserTaskMultiSubmit(
                {
                    context: this.getContext(),
                    eventBus: this.getEventBus(),
                    usertasks: allUserTasks,
                    selectedUsertaskId: selectedUsertaskId
                });

            var multiUserTaskSubmissionDialog = new Dialog({
                fullContent: true,
                content: userTaskMultiSubmit,
                buttons: [
                    {
                        caption: dictionary.get('userTask.multiSubmit.buttons.submit'),
                        color: "darkBlue",
                        action: function () {
                            multiUserTaskSubmissionDialog.setButtons([{
                                caption: dictionary.get('userTask.multiSubmit.buttons.close'),
                                color: "grey",
                                action: function () {
                                    PollingSynchronizer.start();
                                    this.userTasks.onComplete();
                                    userTaskMultiSubmit.destroy();
                                    multiUserTaskSubmissionDialog.destroy();
                                }.bind(this)
                            }]);
                            userTaskMultiSubmit.submitSelectedUsertasks(this.complete, this.userTaskForm.createFormPayload());
                        }.bind(this)
                    },
                    {
                        caption: dictionary.get('userTask.multiSubmit.buttons.cancel'),
                        action: function () {
                            PollingSynchronizer.start();
                            userTaskMultiSubmit.destroy();
                            multiUserTaskSubmissionDialog.destroy();
                        }
                    }
                ]
            });
            multiUserTaskSubmissionDialog.show();

            this.getEventBus().subscribe('UserTaskMultiSubmit:selectedUsertasksCount', function (selectedUserTasksCount) {
                var buttons = multiUserTaskSubmissionDialog.getButtons();
                buttons.forEach(function (button) {
                    if (button.options.caption === dictionary.get('userTask.multiSubmit.buttons.submit')) {
                        if (selectedUserTasksCount === 0) {
                            button.disable();
                        } else {
                            button.enable();
                        }
                    }
                });
            });
        }
    });
});