define([
    'jscore/core',
    'container/api',
    './ProcessActivityDiagramView',
    'i18n!flow-automation-lib/dictionary.json',
    'widgets/InlineMessage',
    'jscore/ext/net',
    'flow-3pps/ecabpmn/Bpmn',
    'flow-3pps/ecabpmn/Transformer',
    'widgets/ContextMenu',
    'widgets/Loader',
    'i18n/AdvancedDateTime',
    'flow-automation-lib/helper/utils'
], function (core, container, View, dictionary, InlineMessage, net, Bpmn,
             Transformer, ContextMenu, Loader, DateTime, utils) {
    'use strict';

    var faBaseUrl = 'flowautomation/v1';
    var peBaseUrl = 'fa-engine-rest/engine/default';

    // needed to control propagation of event handling behaviour in certain cases
    function preventDefault(e) {
        e.preventDefault();
    }

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            this.executionName = this.options.executionName;
            this.flowId = this.options.flowId;
            this.breadcrumbs = [];     // custom breadcrumbs for diagram hierarchy navigation
        },

        onDOMAttach: function () {
            if (!this.bpmnDiagram) {
                this.getDataForWrapperProcessInstanceAndShowDiagram();
            }
        },

        //Uses the polling that is started in FlowInstanceDetails
        handlePolling: function () {
            this.getHistoryDataAndUpdateDiagram(false);
        },

        handleLoader: function () {
            if (!this.loader) {
                this.loader = new Loader({loadingText: 'Waiting on Response from the Server'});
                this.loader.attachTo(this.view.getDiagramContent());
            }
        },

        destroyLoader: function () {
            if (this.loader) {
                this.loader.destroy();
                this.loader = undefined;
            }
        },

        getDataForWrapperProcessInstanceAndShowDiagram: function () {
            this.processInstanceId = null;
            this.activityInstanceName = null;

            // get process instance id for execution
            net.ajax({
                url: faBaseUrl + '/executions?flow-id=' + this.flowId + '&flow-execution-name=' + this.executionName,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (executions) {
                    this.processInstanceId = executions[0].processInstanceId;
                    this.getDataForProcessInstanceAndShowDiagram();
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        getDataForProcessInstanceAndShowDiagram: function () {
            // get process instance history
            net.ajax({
                url: peBaseUrl + '/history/process-instance/' + this.processInstanceId,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (historicProcessInstance) {
                    // TODO - use PI history to indicate status ? eg in 'info'

                    // get process model
                    net.ajax({
                        url: peBaseUrl + '/process-definition/key/' + historicProcessInstance.processDefinitionKey + '/xml',
                        type: 'GET',
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (processXml) {
                            this.processXml = processXml.bpmn20Xml;
                            this.showDiagram();
                        }.bind(this),
                        error: this.handleServerError.bind(this)
                    });
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        showDiagram: function (doNotAddBreadcrumb) {
            this.view.hideErrorSection();
            this.view.showDiagramSection();

            this.resetDiagramPositionAndZoom();
            this.deleteDiagram();

            this.bpmnModel = new Transformer().transform(this.processXml);
            this.processName = this.bpmnModel[0].name;
            if (!this.processName) {
                this.processName = dictionary.processActivityDiagram.unnamedProcess;
            }

            var position = this.view.getDiagramContent().getPosition(); 

            this.bpmnDiagram = new Bpmn();
            this.bpmnDiagram.renderDiagram(this.bpmnModel, {
                xid: "activity",
                diagramElement: "activity-processDiagram",
                width: position.right-position.left,
                height: 700
            });

            this.addZoomHandlers();

            this.enablePanHandling();

            if (!doNotAddBreadcrumb) {
                this.addBreadcrumb();
            }

            this.getHistoryDataAndUpdateDiagram(true);
        },

        processHistoricActivityInstances: function () {
            var getActivityInstanceName = function (historicActivityInstance) {
                var instanceName = "";
                var variables = historicActivityInstance.faVariables;
                if (variables) {
                    for (var i = 0; i < variables.length; i++) {
                        var variableName = variables[i].name;
                        if (variableName === "faActivityInstanceName") {
                            var variableValue = variables[i].value;
                            instanceName = variableValue.substring(variableValue.lastIndexOf("/") + 1);
                        }
                    }
                }

                return instanceName;
            };

            var processHistoricActivityVariables = function () {
                // attach variables to activities
                this.historicActivityInstances.forEach(function (historicActivityInstance) {
                    var activityInstanceId = historicActivityInstance.id;
                    var variables = [];
                    this.historicVariableInstances.forEach(function (historicVariableInstance) {
                        if (historicVariableInstance.activityInstanceId === activityInstanceId) {
                            variables.push(historicVariableInstance);
                        }
                    });
                    historicActivityInstance.faVariables = variables;
                }.bind(this));

                // special handling for multi-instance embedded subprocess
                this.historicVariableInstances.forEach(function (historicVariableInstance) {
                    if (historicVariableInstance.name === "faActivityInstanceName") {
                        var variableValue = historicVariableInstance.value;
                        var activityInstanceId = variableValue.substring(0, variableValue.lastIndexOf("/"));
                        // find this activity and attach the variable to it
                        this.historicActivityInstances.forEach(function (historicActivityInstance) {
                            if (historicActivityInstance.activityType === "subProcess" && historicActivityInstance.id === activityInstanceId) {
                                historicActivityInstance.faVariables.push(historicVariableInstance);
                            }
                        });
                    }
                }.bind(this));

                this.historicActivityInstances.forEach(function (historicActivityInstance) {
                    historicActivityInstance.instanceName = getActivityInstanceName(historicActivityInstance);
                });

            }.bind(this);

            var activityHistories = this.createActivityHistory(this.historicActivityInstances);

            processHistoricActivityVariables();

            return activityHistories;
        },

        createActivityHistory: function (historicActivityInstances) {
            // create map of properties keyed by activity id
            // list of successful completed activity instances
            // list of cancelled activity instances
            // list of active activity instances
            var activityHistories = {};
            historicActivityInstances.forEach(function (historicActivityInstance) {
                var activityId = historicActivityInstance.activityId;
                var activityHistory = activityHistories[activityId];
                if (!activityHistory) {
                    activityHistory = {
                        activityId: historicActivityInstance.activityId,
                        activityType: historicActivityInstance.activityType,
                        completed: [], cancelled: [], active: []
                    };

                    activityHistories[activityId] = activityHistory;
                }

                if (historicActivityInstance.canceled) {
                    activityHistory.cancelled.push(historicActivityInstance);
                } else if (historicActivityInstance.endTime) {
                    activityHistory.completed.push(historicActivityInstance);
                } else {
                    activityHistory.active.push(historicActivityInstance);
                }
            });

            return activityHistories;
        },

        processHistoricActivityInstancesForSubprocessActivityInstance: function (activityInstanceId) {
            var addChildHistoricActivityInstances = function (parentHistoricActivityInstance, childHistoricActivityInstances) {
                for (var i = 0; i < this.historicActivityInstances.length; i++) {
                    var historicActivityInstance = this.historicActivityInstances[i];
                    if (historicActivityInstance.parentActivityInstanceId === parentHistoricActivityInstance.id) {
                        childHistoricActivityInstances.push(historicActivityInstance);
                        addChildHistoricActivityInstances(historicActivityInstance, childHistoricActivityInstances);
                    }
                }
            }.bind(this);

            var rootHistoricActivityInstance = this.findHistoricActivityInstance(activityInstanceId);

            // find all HAIs (children) which have the root as parent, and all HAIs (children) which have those as parents....
            // ...recurse branches until no children on a branch
            var childHistoricActivityInstances = [];
            addChildHistoricActivityInstances(rootHistoricActivityInstance, childHistoricActivityInstances);

            var activityHistories = this.createActivityHistory(childHistoricActivityInstances);

            return {activityHistories: activityHistories, rootHistoricActivityInstance: rootHistoricActivityInstance};
        },

        findHistoricActivityInstance: function (activityInstanceId) {
            var instance = null;

            for (var i = 0; i < this.historicActivityInstances.length; i++) {
                if (this.historicActivityInstances[i].id === activityInstanceId) {
                    instance = this.historicActivityInstances[i];
                    break;
                }
            }

            return instance;
        },

        getHistoryDataAndUpdateDiagram: function (firstRender) {
            // get activity history for process instance
            // TODO - need to get activities and variables history in parallel to reduce inconsistencies ?
            // TODO - need to handle inconsistencies between activities and variables history ?

            if (firstRender) {
                this.handleLoader();
            }

            net.ajax({
                url: peBaseUrl + '/history/activity-instance?processInstanceId=' + this.processInstanceId,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (historicActivityInstances) {
                    this.historicActivityInstances = historicActivityInstances;
                    // get 'faActivityInstanceName' variable history for process instance (needed for 'instance name' of multi-instance activities)
                    net.ajax({
                        url: peBaseUrl + '/history/variable-instance?processInstanceId=' + this.processInstanceId,
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify({
                            processInstanceId: this.processInstanceId,
                            variableName: 'faActivityInstanceName'
                        }),
                        contentType: 'application/json',
                        success: function (historicVariableInstances) {
                            this.destroyLoader();
                            this.historicVariableInstances = historicVariableInstances;
                            if (this.activityInstanceId !== null && this.activityInstanceName !== null) {
                                this.updateDiagramForSubprocess();
                            } else {
                                this.updateDiagram();
                            }
                        }.bind(this),
                        error: function () {
                            this.destroyLoader();
                            this.handleServerError.bind(this);
                        }
                    });
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        updateDiagram: function () {
            this.removeProgressAndActivityHandlers();
            var activityHistories = this.processHistoricActivityInstances();
            this.addProgressAndActivityHandlers(activityHistories);
        },

        updateDiagramForSubprocess: function () {
            this.removeProgressAndActivityHandlers();
            var subprocessHistory = this.processHistoricActivityInstancesForSubprocessActivityInstance(this.activityInstanceId);
            this.addProgressAndActivityHandlers(subprocessHistory.activityHistories);
            return subprocessHistory;
        },

        handleServerError: function () {
            // remove diagram
            this.view.hideDiagramSection();

            // show inline error
            if (this.inlineMessage) {
                this.inlineMessage.destroy();
            }

            this.inlineMessage = new InlineMessage({
                icon: 'error',
                header: dictionary.get('errorResponse.unableToRetrieveDataHeader')
            });
            this.inlineMessage.attachTo(this.view.getErrorSection());
            this.view.showErrorSection();
        },

        deleteDiagram: function () {
            if (this.hasOwnProperty('bpmnDiagram')) {
                var diagram = this.view.getDiagramContent().children()[0];  // id="activity-processDiagram"
                diagram.children().forEach(function (child) {
                    child.remove();
                });
                delete this.bpmnDiagram;
            }
        },

        // Add diagram element overlays with highlights and handlers for actions
        addProgressAndActivityHandlers: function (activityHistories) {
            var isEventActivityType = function (activityType) {
                return activityType === "startEvent" || activityType === "endEvent" || activityType === "noneEndEvent" ||
                    activityType === "intermediateMessageCatch" || activityType === "intermediateMessageThrow" ||
                    activityType === "intermediateNoneThrowEvent" || activityType === "intermediateTimer" ||
                    activityType === "boundaryError" || activityType === "errorStartEvent" || activityType === "intermediateCompensationThrowEvent";
            };

            var isGatewayActivityType = function (activityType) {
                return activityType === "exclusiveGateway" || activityType === "parallelGateway" || activityType === "inclusiveGateway" || activityType === "eventBasedGateway";
            };

            var getTotalExecutions = function (activityHistory) {
                return activityHistory.active.length + activityHistory.cancelled.length + activityHistory.completed.length;
            };

            var getMainHighlight = function (activityHistory) {
                var highlight = null;
                var activityType = activityHistory.activityType;

                // TODO - change to 'most recent status' approach ?
                if (activityHistory.active.length > 0) {
                    highlight = "elFlowAutomationLib-wProcessActivityDiagram-diagram-highlight-Active";
                } else if (activityHistory.cancelled.length > 0) {
                    highlight = "elFlowAutomationLib-wProcessActivityDiagram-diagram-highlight-Cancelled";
                } else if (activityHistory.completed.length > 0) {
                    highlight = "elFlowAutomationLib-wProcessActivityDiagram-diagram-highlight-Completed";
                }

                if (highlight !== null) {
                    if (isEventActivityType(activityType)) {
                        highlight += "-Event";
                    } else if (isGatewayActivityType(activityType)) {
                        highlight += "-Gateway";
                    }
                }

                return highlight;
            };

            var addMainHighlight = function (activityHistory) {
                var activityId = activityHistory.activityId;
                var highlight = getMainHighlight(activityHistory);

                if (highlight !== null) {
                    var bpmnAnnotation = this.bpmnDiagram.annotation(activityId);
                    if (bpmnAnnotation !== null) {
                        bpmnAnnotation.addClasses([highlight]);
                    }
                }
            }.bind(this);

            var addBadges = function (activityHistory, bpmnDiagram) {
                var activityId = activityHistory.activityId;
                var badgesDiv = "<div>";        // NB: Building html here because camunda Bpmn library will only accept inner html

                if (activityHistory.active.length > 0) {
                    badgesDiv += '<p class="elFlowAutomationLib-wProcessActivityDiagram-diagram-badge-Active">' + activityHistory.active.length + '</p>';
                }
                if (activityHistory.cancelled.length > 0) {
                    badgesDiv += '<p class="elFlowAutomationLib-wProcessActivityDiagram-diagram-badge-Cancelled">' + activityHistory.cancelled.length + '</p>';
                }
                if (activityHistory.completed.length > 0) {
                    badgesDiv += '<p class="elFlowAutomationLib-wProcessActivityDiagram-diagram-badge-Completed">' + activityHistory.completed.length + '</p>';
                }
                badgesDiv += "</div>";

                // only added badges if >1 execution
                if (getTotalExecutions(activityHistory) > 1) {
                    bpmnDiagram.annotation(activityId).addDiv(badgesDiv, ['elFlowAutomationLib-wProcessActivityDiagram-diagram-badges-position']);
                }
            }.bind(this);

            var addMouseSelection = function (overlay, annotation, highlight, selectHighlight) {
                overlay.addEventListener("mouseenter", function () {
                    annotation.removeClasses([highlight]);
                    annotation.addClasses([selectHighlight]);
                    this.disablePanHandling();
                }.bind(this));
                overlay.addEventListener("mouseleave", function () {
                    annotation.removeClasses([selectHighlight]);
                    annotation.addClasses([highlight]);
                    this.enablePanHandling();
                }.bind(this));
            }.bind(this);

            var findHistoricActivityInstanceSingleExecution = function (activityHistory) {
                var historicActivityInstance = null;
                if (activityHistory.active.length > 0) {
                    historicActivityInstance = activityHistory.active[0];
                } else if (activityHistory.cancelled.length > 0) {
                    historicActivityInstance = activityHistory.cancelled[0];
                } else {
                    historicActivityInstance = activityHistory.completed[0];
                }
                return historicActivityInstance;
            };

            var callActivityDrilldownAction = function (calledProcessInstanceId, activityInstanceName) {
                this.processInstanceId = calledProcessInstanceId;
                this.activityInstanceId = null;
                this.activityInstanceName = activityInstanceName;
                this.getDataForProcessInstanceAndShowDiagram();
            }.bind(this);

            var subProcessDrilldownAction = function (activityInstanceId, activityInstanceName) {
                this.activityInstanceId = activityInstanceId;
                this.activityInstanceName = activityInstanceName;

                var subprocessHistory = this.updateDiagramForSubprocess();

                var processName = subprocessHistory.rootHistoricActivityInstance.activityName;
                if (!processName) {
                    processName = dictionary.processActivityDiagram.unnamedProcess;
                }
                this.processName = processName;

                this.addBreadcrumb();

            }.bind(this);

            var formatDrilldownContextMenuItem = function (instanceName, status, startTime, endTime) {
                var item = "";
                if (instanceName !== "") {
                    item += "[" + instanceName + "] - ";
                }

                item += status + " - " + dictionary.processActivityDiagram.started + ":";
                item += utils.convertDate(startTime);
                if (endTime) {
                    item += " - " + dictionary.processActivityDiagram.ended + ":" + utils.convertDate(endTime);
                }

                return item;
            }.bind(this);

            var createActivityDrilldownContextMenuItem = function (historicActivityInstance, state, isCallActivity, isSubProcess) {
                var activityInstanceName = historicActivityInstance.instanceName;
                var itemName = formatDrilldownContextMenuItem(activityInstanceName, state, historicActivityInstance.startTime, historicActivityInstance.endTime);
                var item = null;
                if (isCallActivity) {
                    item = {
                        activityInstanceName: activityInstanceName,
                        name: itemName,
                        action: callActivityDrilldownAction.bind(this, historicActivityInstance.calledProcessInstanceId, activityInstanceName)
                    };
                } else if (isSubProcess) {
                    item = {
                        activityInstanceName: activityInstanceName,
                        name: itemName,
                        action: subProcessDrilldownAction.bind(this, historicActivityInstance.id, activityInstanceName)
                    };
                }
                return item;
            };

            var createActivityDrilldownContextMenuItems = function (activityHistory, isCallActivity, isSubProcess) {
                var items = [];

                activityHistory.active.forEach(function (historicActivityInstance) {
                    items.push(createActivityDrilldownContextMenuItem(historicActivityInstance, dictionary.processActivityDiagram.active, isCallActivity, isSubProcess));
                });

                activityHistory.completed.forEach(function (historicActivityInstance) {
                    items.push(createActivityDrilldownContextMenuItem(historicActivityInstance, dictionary.processActivityDiagram.completed, isCallActivity, isSubProcess));
                });

                activityHistory.cancelled.forEach(function (historicActivityInstance) {
                    items.push(createActivityDrilldownContextMenuItem(historicActivityInstance, dictionary.processActivityDiagram.cancelled, isCallActivity, isSubProcess));
                });

                items.sort(function (a, b) {
                    if (a.activityInstanceName && b.activityInstanceName) {
                        if (a.activityInstanceName < b.activityInstanceName) {
                            return -1;
                        }
                        if (a.activityInstanceName > b.activityInstanceName) {
                            return 1;
                        }
                        return 0;
                    }
                    return 0;
                });

                return [{header: dictionary.processActivityDiagram.selectActivityInstanceToDrilldown, items: items}];
            }.bind(this);

            var addDrilldownSelectionHandling = function (activityHistory, bpmnDiagram) {
                var totalExecutions = getTotalExecutions(activityHistory);
                if (totalExecutions === 0) {
                    return;
                }

                var activityId = activityHistory.activityId;
                var activityType = activityHistory.activityType;
                var isCallActivity = (activityType === "callActivity");
                var isSubProcess = (activityType === "subProcess");

                if (totalExecutions === 1) {
                    if (isCallActivity) {
                        var historicActivityInstance = findHistoricActivityInstanceSingleExecution(activityHistory);
                        var calledProcessInstanceId = historicActivityInstance.calledProcessInstanceId;

                        var overlaySingleSelect = bpmnDiagram.getOverlay(activityId);
                        var annotationSingleSelect = bpmnDiagram.annotation(activityId);
                        addMouseSelection(overlaySingleSelect, annotationSingleSelect, getMainHighlight(activityHistory), "elFlowAutomationLib-wProcessActivityDiagram-diagram-highlight-Selectable");

                        overlaySingleSelect.addEventListener("click", function () {
                            this.processInstanceId = calledProcessInstanceId;
                            this.activityInstanceId = null;
                            this.getDataForProcessInstanceAndShowDiagram();
                        }.bind(this));
                    }
                } else if (totalExecutions > 1 && (isCallActivity || isSubProcess)) {
                    // Mouse enter/leave highlight
                    var overlayMultiSelect = bpmnDiagram.getOverlay(activityId);
                    var annotationMultiSelect = bpmnDiagram.annotation(activityId);
                    addMouseSelection(overlayMultiSelect, annotationMultiSelect, getMainHighlight(activityHistory), "elFlowAutomationLib-wProcessActivityDiagram-diagram-highlight-Selectable");

                    overlayMultiSelect.addEventListener("click", function (event) {
                        var rect = bpmnDiagram.getOverlay(activityId).getBoundingClientRect();
                        var newEvent = {
                            clientX: rect.left + 5,
                            clientY: rect.top,
                            preventDefault: function () {
                            },
                            stopPropagation: function () {
                            }
                        };

                        container.getEventBus().publish('contextmenu:show', newEvent, createActivityDrilldownContextMenuItems.call(this, activityHistory, isCallActivity, isSubProcess));
                    }.bind(this));
                }
            }.bind(this);

            var activityTypeCanBeRenderered = function (activityType) {
                var canBeRendered = true;
                if (activityType === 'multiInstanceBody') {
                    canBeRendered = false;
                }
                return canBeRendered;
            };

            for (var activityId in activityHistories) {
                if (activityHistories.hasOwnProperty(activityId)) {
                    var activityHistory = activityHistories[activityId];
                    var activityType = activityHistory.activityType;

                    if (activityTypeCanBeRenderered(activityType)) {
                        addMainHighlight(activityHistory, this.bpmnDiagram);
                        addBadges(activityHistory, this.bpmnDiagram);
                    }

                    addDrilldownSelectionHandling(activityHistory, this.bpmnDiagram);
                }
            }
        },

        removeProgressAndActivityHandlers: function () {
            var removeProgressAndActivityHandlersForElement = function (element) {
                if (element.baseElements) {
                    element.baseElements.forEach(function (xelement) {
                        if (xelement.type !== 'sequenceFlow') {
                            var annotation = this.bpmnDiagram.annotation(xelement.id);
                            if (annotation !== null) {
                                annotation.removeClassesByPrefix('elFlowAutomationLib-wProcessActivityDiagram-diagram');
                                annotation.removeDivs();

                                // remove handlers
                                var old_overlay = this.bpmnDiagram.getOverlay(xelement.id);
                                var new_overlay = old_overlay.cloneNode(true);
                                old_overlay.parentNode.replaceChild(new_overlay, old_overlay);

                                removeProgressAndActivityHandlersForElement(xelement); // recurse - TODO -move this to Bpmn.js ?
                            }
                        }
                    }.bind(this));
                }
            }.bind(this);

            if (this.hasOwnProperty('bpmnDiagram')) {
                var bpmnProcessModel = this.bpmnModel[0];
                removeProgressAndActivityHandlersForElement(bpmnProcessModel);
            }
        },

        // add a breadcrumb as user drills down in sub processes
        addBreadcrumb: function () {
            // handler for user selecting a breadcrumb
            var processDiagramBreadcrumbHandler = function (breadcrumbToHandle) {
                var currentBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
                if (breadcrumbToHandle.id === currentBreadcrumb.id) {
                    return;   // shouldn't be possible to select current breadcrumb, but just in case...
                }

                // remove breadcrumbs lower than the one selected
                var newBreadcrumbs = [];
                for (var i = 0; i < this.breadcrumbs.length; i++) {
                    var breadcrumb = this.breadcrumbs[i];
                    if (breadcrumb.id === breadcrumbToHandle.id) {
                        break;
                    }
                    newBreadcrumbs.push(breadcrumb);
                }
                this.breadcrumbs = newBreadcrumbs;

                // redraw diagram and breadcrumbs
                if (this.breadcrumbs.length === 0) {
                    this.getDataForWrapperProcessInstanceAndShowDiagram();
                } else {
                    this.processInstanceId = breadcrumbToHandle.processInstanceId;
                    this.processName = breadcrumbToHandle.processName;
                    this.activityInstanceName = breadcrumbToHandle.activityInstanceName;
                    this.activityInstanceId = breadcrumbToHandle.activityInstanceId;
                    this.getDataForProcessInstanceAndShowDiagram();
                }
            }.bind(this);

            var newBreadcrumb = {};
            newBreadcrumb.processName = this.processName;
            newBreadcrumb.processInstanceId = this.processInstanceId;
            newBreadcrumb.activityInstanceName = this.activityInstanceName;
            newBreadcrumb.activityInstanceId = this.activityInstanceId;
            newBreadcrumb.id = this.processInstanceId;
            if (this.activityInstanceName) {
                newBreadcrumb.id = this.processInstanceId + '--' + this.activityInstanceName;
            }

            // add the breadcrumb
            this.breadcrumbs.push(newBreadcrumb);

            // set up click handlers for breadcrumbs
            if (this.breadcrumbs.length > 0) {
                var breadcrumbsElementContent = new core.Element("div");
                for (var i = 0; i < this.breadcrumbs.length; i++) {
                    var breadcrumb = this.breadcrumbs[i];

                    var breadCrumbText = breadcrumb.processName;
                    if (breadcrumb.activityInstanceName) {
                        breadCrumbText += " [" + breadcrumb.activityInstanceName + "]";
                    }
                    if (i < (this.breadcrumbs.length - 1)) {
                        var link = new core.Element("a");
                        link.setAttribute("class", "ebBreadcrumbs-link elFlowAutomationLib-wProcessActivityDiagram-diagram-breadcrumb");
                        link.setAttribute("style", "cursor: pointer");
                        link.setText(breadCrumbText);
                        link.addEventHandler("click", processDiagramBreadcrumbHandler.bind(this, breadcrumb));
                        breadcrumbsElementContent.append(link);

                        var span = new core.Element("span");
                        span.setText(" > ");
                        span.setAttribute("class", "elFlowAutomationLib-wProcessActivityDiagram-diagram-breadcrumb");
                        breadcrumbsElementContent.append(span);
                    } else {
                        var currentLink = new core.Element("a");
                        currentLink.setAttribute("class", "ebBreadcrumbs-link elFlowAutomationLib-wProcessActivityDiagram-diagram-breadcrumb-current");
                        currentLink.setAttribute("style", "pointer-events: none");
                        currentLink.setText(breadCrumbText);
                        breadcrumbsElementContent.append(currentLink);
                    }
                }

                // remove existing breadcrumbs
                var breadcrumbsElement = this.view.getBreadcrumbs();
                var children = breadcrumbsElement.children();
                if (children.length !== 0) {
                    children[0].remove();
                }

                // and replace with new breadcrumbs
                breadcrumbsElement.append(breadcrumbsElementContent);
            }
        },

//      -------------------------------------------------------------------------------------------------
//      ------------- Start of section identical in ProcessDefinitionDiagram and ProcessActivityDiagram
//      Ideally a common widget would be refactored out which would render bare diagram with zoom&pan
//      functionality, but ther resulting widget interaction would be complex given the need to coordinate
//      mouse handling for zoom&pan features and element selection features. So for this reason the
//      adopted approach is to allow for 'controlled' code duplication between the 2 widgets.
//      Note also that there is a small amount of duplication also within the widget html template and LESS styles.

        resetDiagramPositionAndZoom: function () {
            this.resetDiagramPosition();
            this.zoomFactor = 1;
        },

        resetDiagramPosition: function () {
            this.currentX = 0;
            this.currentY = 0;
            var dragElement = this.view.getDraggableContent();
            dragElement.setStyle("left", '0px');
            dragElement.setStyle("top", '0px');
        },

        addZoomHandlers: function () {
            if (this.zoomHandlingAdded) {
                return;
            }
            this.zoomHandlingAdded = true;

            this.zoomFactor = 1;
            this.view.getZoomInButton().addEventHandler("click", function () {
                this.zoomFactor += 0.1;
                this.bpmnDiagram.zoom(this.zoomFactor);
            }.bind(this));

            this.view.getZoomOutButton().addEventHandler("click", function () {
                if (this.zoomFactor >= 0.4) {
                    this.zoomFactor -= 0.1;
                }
                this.bpmnDiagram.zoom(this.zoomFactor);
            }.bind(this));

            this.view.getZoomResetButton().addEventHandler("click", function () {
                this.showDiagram(true);
            }.bind(this));

            this.view.getDraggableContent().addEventHandler("mousewheel", function (event) {
                event.preventDefault();
                if (event.originalEvent.wheelDelta >= 0) {
                    this.zoomFactor += 0.1;
                } else {
                    if (this.zoomFactor >= 0.4) {
                        this.zoomFactor -= 0.1;
                    }
                }
                this.bpmnDiagram.zoom(this.zoomFactor);
            }.bind(this));
        },

        enablePanHandling: function () {
            this.clearAllMouseEvents();
            this.mousedownEventId = this.view.getDraggableContent().addEventHandler("mousedown", function (event) {

                // Prevent default here prevents selected text from being dragged
                event.preventDefault();
                document.addEventListener("mousemove", preventDefault, false);

                var dragElement = this.view.getDraggableContent();
                dragElement.setStyle("cursor", "move");

                var startAbsoluteX = event.originalEvent.clientX;
                var startAbsoluteY = event.originalEvent.clientY;

                this.panStartX = this.currentX;
                this.panX = this.panStartX;
                this.panStartY = this.currentY;
                this.panY = this.panStartY;

                this.mousemoveEventId = core.Element.wrap(document.body).addEventHandler("mousemove", function (event) {
                    var panAbsoluteX = event.originalEvent.clientX;
                    var panAbsoluteY = event.originalEvent.clientY;

                    var newX = this.panStartX + panAbsoluteX - startAbsoluteX;
                    this.panX = newX;
                    var newY = this.panStartY + panAbsoluteY - startAbsoluteY;
                    this.panY = newY;

                    var dragElement = this.view.getDraggableContent();
                    dragElement.setStyle("left", newX + 'px');
                    dragElement.setStyle("top", newY + 'px');
                }.bind(this));

                this.mouseleaveEventId = core.Element.wrap(document.body).addEventHandler("mouseleave", function () {
                    this.view.getDraggableContent().setStyle("cursor", "default");
                    this.clearMouseEvents();
                    this.currentX = this.panX;
                    this.currentY = this.panY;
                }.bind(this));

                this.mouseupEventId = core.Element.wrap(document.body).addEventHandler("mouseup", function () {
                    this.view.getDraggableContent().setStyle("cursor", "default");
                    this.clearMouseEvents();
                    this.currentX = this.panX;
                    this.currentY = this.panY;
                }.bind(this));

            }.bind(this));
        },

        disablePanHandling: function () {
            this.clearAllMouseEvents();
        },

        clearAllMouseEvents: function () {
            document.removeEventListener("mousemove", preventDefault, false);
            if (this.mousedownEventId !== undefined) {
                core.Element.wrap(document.body).removeEventHandler(this.mousedownEventId);
                delete this.mousedownEventId;
            }
            this.clearMouseEvents();
        },

        clearMouseEvents: function () {
            document.removeEventListener("mousemove", preventDefault, false);
            if (this.mousemoveEventId !== undefined) {
                core.Element.wrap(document.body).removeEventHandler(this.mousemoveEventId);
                delete this.mousemoveEventId;
            }
            if (this.mouseleaveEventId !== undefined) {
                core.Element.wrap(document.body).removeEventHandler(this.mouseleaveEventId);
                delete this.mouseleaveEventId;
            }
            if (this.mouseupEventId !== undefined) {
                core.Element.wrap(document.body).removeEventHandler(this.mouseupEventId);
                delete this.mouseupEventId;
            }
        }

//      ------------- End of section identical in ProcessDefinitionDiagram and ProcessActivityDiagram
//      -----------------------------------------------------------------------------------------------

    });
});