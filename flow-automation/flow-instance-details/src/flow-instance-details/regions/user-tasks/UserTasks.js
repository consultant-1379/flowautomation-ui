define([
    'jscore/core',
    'jscore/ext/net',
    './UserTasksView',
    'i18n!flow-instance-details/dictionary.json',
    'widgets/InlineMessage',
    'widgets/Button',
    'flow-automation-lib/helper/execution',
    'flow-automation-lib/services/CustomError',
    '../../widgets/user-task-table/UserTaskTable',
    'flow-automation-lib/services/PollingSynchronizer',
    '../../ext/utils/UriInfo'
], function (core, net, View, dictionary, InlineMessage, Button, execution, customError, UserTaskTable, PollingSynchronizer, UriInfo) {
    'use strict';

    var faBaseUrl = 'flowautomation/v1';
    var FLOW_INSTANCE_DETAILS_USER_TASK = "FlowInstanceDetailsUserTask";
    var userTasksXHR;
    var lastActiveUserTaskId;

    function createViewTaskButton(eventBus) {
        var userTaskButton = new Button({caption: dictionary.get("flyOut.button")});
        userTaskButton.addEventHandler("click", function () {
            eventBus.publish('UserTasks:showFlyout');
        });
        return userTaskButton;
    }

    return core.Region.extend({

        view: function () {
            return new View({
                dictionary: dictionary
            });
        },

        onViewReady: function () {
            this.view.hideUserTaskButton();
            createViewTaskButton(this.getEventBus()).attachTo(this.view.getUserTaskButtonHolder());
        },

        onStart: function () {
            this.retryCount = 0;
            this.userTaskTable = new UserTaskTable();
            this.userTaskTable.addEventHandler('UserTasks:userTaskSelected', this.onUserTaskSelected, this);
            this.userTaskTable.addEventHandler('UserTasks:userTaskSelectionUpdated', this.onUserTaskSelectionUpdated, this);
            this.userTaskTable.attachTo(this.view.getUserTaskList());

            this.fetchUserTasks();
        },

        onStop: function () {
            this.retryCount = 0;
            this.userTaskTable.detach();
            this.destroyInlineMsg();
        },
        
        onUserTaskSelected: function(userTask) {
            var allUserTasksInSelectedGroup;
            if (userTask.grouped) {
                allUserTasksInSelectedGroup = this.userTaskTable.getUserTasksGroupByDefinitionKey(userTask.definitionKey);
            }
            this.getEventBus().publish('UserTasks:createForm', {
                "userTaskId": userTask.id,
                "executionName": UriInfo.getExecutionName(),
                "flowId": UriInfo.getFlowId(),
                "userTaskName": userTask.name,
                "userTaskNameExtra": userTask.nameExtra,
                "allUserTasksInSelectedGroup": allUserTasksInSelectedGroup
                
            });
        },
        
        onUserTaskSelectionUpdated: function(userTask) {
            var allUserTasksInSelectedGroup;
            if (userTask.grouped) {
                allUserTasksInSelectedGroup = this.userTaskTable.getUserTasksGroupByDefinitionKey(userTask.definitionKey);
            }
            this.getEventBus().publish('UserTasks:updateActionButtons', {
                "userTaskId": userTask.id,
                "allUserTasksInSelectedGroup": allUserTasksInSelectedGroup
            });
        },
        
        onComplete: function (loader) {
            this.retryCount = 0;
            this.userTaskTable.clearSelection();
            this.getEventBus().publish('flowInstances:executionState', loader);
            this.fetchUserTasks();
        },

        noUserTasks: function () {
            this.userTaskTable.clear();
            this.getEventBus().publish('UserTasks:noUserTasks');
            this.setInlineMsg(dictionary.get("userTask.noAvailable"));
        },

        getNewInlineMsg: function (header) {
            this.destroyInlineMsg();
            this.noFlowSelected = new InlineMessage({
                header: header,
                icon: 'infoMsgIndicator'
            });
        },

        setInlineMsg: function (header) {
            if (execution.isInFinalState(UriInfo.getState())) {
                clearInterval(this.polling);
                this.polling = null;
            }

            this.getNewInlineMsg(header);
            this.noFlowSelected.attachTo(this.view.getUserTaskList());
        },

        destroyInlineMsg: function () {
            if (this.noFlowSelected) {
                this.noFlowSelected.destroy();
            }
        },

        handlerPollingInUserTasks: function () {
            PollingSynchronizer.agg(FLOW_INSTANCE_DETAILS_USER_TASK, this.fetchUserTasks, this);
        },

        fetchUserTasks: function () {
            if (userTasksXHR) {
                userTasksXHR.abort();   // this request might take some time if there are huge tasks so user can go back off the page and
            }                         // come back again without the request being completed.So always cancel any ongoing request before firing a new one

            this.destroyInlineMsg();
            if (!UriInfo.getExecutionName()|| !UriInfo.getFlowId()) {
                this.noUserTasks();
            } else {
                userTasksXHR = net.ajax({
                    url: faBaseUrl + '/executions/' + UriInfo.getExecutionName() + '/usertasks?flow-id=' + UriInfo.getFlowId(),
                    type: 'GET',
                    dataType: 'json',
                    success: function (usertasksResponse) {
                        this.handlerSuccess(usertasksResponse);
                    }.bind(this),
                    error: this.handleServerError.bind(this)
                });
            }
        },

        handlerSuccess: function (usertasksResponse) {
            if (!usertasksResponse || usertasksResponse.length === 0) {
                this.noUserTasks();
            } else {
                if (execution.isInSetupPhase(UriInfo.getState())) {
                    this.userTaskTable.handleData(this.createUserTaskTableData(usertasksResponse));
                    this.retryFetchUserTasksUntilNextActiveUserTaskIsAvailable(usertasksResponse);
                } else {
                    this.userTaskTable.handleData(this.createUserTaskTableData(usertasksResponse));
                }
                
                this.getEventBus().publish('UserTasks:NumberOfActiveUserTasks', this.getNumberOfActiveUserTasks(usertasksResponse));
            }
        },
        
        handleServerError: function (response, xhr) {
            try {
                var xhrResponse = xhr.getResponseJSON();
                customError.userTasksErrorHandling({data: response, xhr: xhrResponse});
            } catch (e) {
                // error?
            }
        },

        // Prepare data to be used by UserTaskTable.
        // For execute phase this involves organising into grouped and non-grouped tasks.        
        createUserTaskTableData: function(usertasksResponse) {
            
            function setupPhaseProcessUserTasks(usertasksResponse) {
                usertasksResponse.forEach(function(userTask) {
                    userTask.title = userTask.name;
                    if (userTask.nameExtra) {
                        userTask.title += ' - ' + userTask.nameExtra;    // name which will appear for task
                    }
                });
                
                return usertasksResponse;
            }

            function executePhaseGroupAndProcessUserTasks(usertasksResponse) {
                // add unique 'definitionKey' to usertasks built from processDefinitionId and taskDefinitionId
                usertasksResponse.forEach(function(userTask) {
                    userTask.definitionKey = userTask.processDefinitionId + '-' + userTask.taskDefinitionId;
                });
                
                // create an object whose definitionKeys and structure represent the grouping  
                var propertyName = 'definitionKey';
                var groupedUsertasksObject = usertasksResponse.reduce(function (reducer, item) {
                    (reducer[item[propertyName]] = reducer[item[propertyName]] || []).push(item);
                    return reducer;
                }, {});
                
                // create the 'title' for each user task, and add properties to help identify groups (used by UserTaskTable) 
                var userTasks = [];
                for (var userTaskDefinitionKey in groupedUsertasksObject) {
                    var userTask = groupedUsertasksObject[userTaskDefinitionKey];
                    if (userTask.length > 1 || userTask[0].nameExtra) {    // grouped
                        var title = userTask[0].name + ' (' + userTask.length + ')';    // name which will appear for task
                        userTask.forEach(function(xUserTask) {
                            xUserTask.title = xUserTask.name;    // name which will appear for task
                            if (xUserTask.nameExtra) {
                                xUserTask.title = xUserTask.nameExtra;
                            }
                            xUserTask.grouped = true;
                        });
                        userTasks.push({title: title, group: true, definitionKey: userTask[0].definitionKey, userTasks: userTask});
                    }
                    else {    // non-grouped
                        userTask[0].title = userTask[0].name;    // name which will appear for task
                        userTasks.push(userTask[0]);
                    }
                }
                return userTasks;
            }

            function sortUserTasks(userTasks) {        // sort by name
                // level 1, ie. group tasks and non-group tasks
                userTasks.sort(function(a, b) {
                      var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                      var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                      if (titleA < titleB) return -1;
                      if (titleA > titleB) return 1;
                      return 0;
                });
                // level 2, ie. grouped tasks
                userTasks.forEach(function(userTask) {
                    if (userTask.userTasks) {
                        userTask.userTasks.sort(function(a, b) {
                            var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                          var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                          if (titleA < titleB) return -1;
                          if (titleA > titleB) return 1;
                          return 0;
                        });
                    }
                });
                return userTasks;
            }

            var userTaskTableData;
            if (execution.isInSetupPhase(UriInfo.getState())) {
                userTaskTableData = setupPhaseProcessUserTasks(usertasksResponse);
            }
            else {
                userTaskTableData = executePhaseGroupAndProcessUserTasks(usertasksResponse);
                userTaskTableData = sortUserTasks(userTaskTableData);
            }
            
            return userTaskTableData;
        },

        getNumberOfActiveUserTasks: function (userTasks) {
            var numberOfActiveUserTasks = 0;
            for (var i = 0; i < userTasks.length; i++) {
                if (userTasks[i].status === "active") {
                    ++numberOfActiveUserTasks;
                }
            }
            return numberOfActiveUserTasks;
        },

        retryFetchUserTasksUntilNextActiveUserTaskIsAvailable: function (userTasks) {
            if (!this.activeUserTaskExists(userTasks) && this.retryCount < 3) {
                this.retryCount++;

                var promise = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve('Delay to see if new active user tasks are available');
                    }, 1000);
                }.bind(this));
                promise.then(function () {
                    this.fetchUserTasks();
                }.bind(this)).catch(function (err) {
                    console.log(err);
                });
            }
        },

        activeUserTaskExists: function (userTasks) {
            return userTasks.some(function (value) {
                return value.status === "active";
            });
        },

        reselect: function() {
            this.userTaskTable.selectFirstActiveUserTask();
        }

    });
});
