define([
    'jscore/core',
    './ProcessDefinitionDiagramView',
    'i18n!flow-automation-lib/dictionary.json',
    'widgets/InlineMessage',
    'jscore/ext/net',
    'flow-3pps/ecabpmn/Bpmn',
    'flow-3pps/ecabpmn/Transformer'
], function (core, View, dictionary, InlineMessage, net, Bpmn, Transformer) {
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
            this.flowId = this.options.flowId;
            this.flowVersion = this.options.flowVersion;
            this.breadcrumbs = [];     // custom breadcrumbs for diagram hierarchy navigation
        },

        onDOMAttach: function () {
            if (!this.bpmnDiagram) {
                this.getRootProcessDetailsAndShowDiagram();
            }
        },

        getRootProcessDetailsAndShowDiagram: function () {
            net.ajax({
                url: faBaseUrl + '/flows/' + this.flowId + '/' + this.flowVersion + '/process-details',
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (processDetails) {
                    this.rootProcessDetails = processDetails;
                    this.processId = processDetails.processId;
                    this.getProcessModelAndShowDiagram();
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        getProcessModelAndShowDiagram: function () {
            net.ajax({
                url: peBaseUrl + '/process-definition/key/' + this.processId + '/xml',
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                success: function (processXml) {
                    this.processXml = processXml.bpmn20Xml;
                    this.showDiagram();
                }.bind(this),
                error: this.handleServerError.bind(this)
            });
        },

        showDiagram: function (doNotAddBreadcrumb) {
            this.view.hideErrorSection();
            this.view.showDiagramSection();

            this.resetDiagramPositionAndZoom();
            this.deleteDiagram();

            var bpmnModel = new Transformer().transform(this.processXml);
            this.processName = bpmnModel[0].name;
            if (!this.processName) {
                this.processName = dictionary.processDefinitionDiagram.unnamedProcess;
            }

            var position = this.view.getDiagramContent().getPosition(); 
            console.log("diagramContent: left=" + position.left + ", right=" + position.right + ", top=" + position.top + ", bottom=" + position.bottom);

            this.bpmnDiagram = new Bpmn();
            this.bpmnDiagram.renderDiagram(bpmnModel, {
                xid: "definition",
                diagramElement: "definition-processDiagram",
                width: position.right-position.left,
                height: 700
            });

            this.addElementHandlers(bpmnModel);

            this.addZoomHandlers();

            this.enablePanHandling();

            if (!doNotAddBreadcrumb) {
            	this.addBreadcrumb({processId: this.processId, processName: this.processName});
            }
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
                var diagram = this.view.getDiagramContent().children()[0];  // id="definition-processDiagram"
                diagram.children().forEach(function (child) {
                    child.remove();
                });
                delete this.bpmnDiagram;
            }
        },

        // Add diagram element overlays with handlers for actions
        addElementHandlers: function (bpmnModel) {
            var addElementHandlersForElement = function (element) {
                if (element.baseElements) {
                    element.baseElements.forEach(function (xelement) {
                        if (xelement.type === "callActivity") {
                            var calledElement = xelement.calledElement;
                            if (calledElement === '${FAInternalSetupProcessId}' && !this.rootProcessDetails.setupProcessId) {
                                return;
                            }
                            if (calledElement === '${FAInternalSetupProcessId}') {
                                calledElement = this.rootProcessDetails.setupProcessId;
                            }
                            if (calledElement === '${FAInternalExecuteProcessId}') {
                                calledElement = this.rootProcessDetails.executeProcessId;
                            }

                            var overlay = this.bpmnDiagram.getOverlay(xelement.id);
                            overlay.addEventListener("mouseenter", function () {
                                this.bpmnDiagram.annotation(xelement.id).addClasses(["elFlowAutomationLib-wProcessDefinitionDiagram-diagram-highlight-Selectable"]);
                                this.disablePanHandling();
                            }.bind(this));
                            overlay.addEventListener("mouseleave", function () {
                                this.bpmnDiagram.annotation(xelement.id).removeClasses(["elFlowAutomationLib-wProcessDefinitionDiagram-diagram-highlight-Selectable"]);
                                this.enablePanHandling();
                            }.bind(this));
                            overlay.addEventListener("click", function () {
                                this.processId = calledElement;
                                this.deleteDiagram();
                                this.getProcessModelAndShowDiagram();
                            }.bind(this));
                        }

                        addElementHandlersForElement(xelement);

                    }.bind(this));
                }
            }.bind(this);

            var bpmnProcessModel = bpmnModel[0];
            addElementHandlersForElement(bpmnProcessModel);
        },

        // add a breadcrumb as user drills down in sub processes
        addBreadcrumb: function (breadcrumbMain) {
            // handler for user selecting a breadcrumb
            var ProcessDefinitionDiagramBreadcrumbHandler = function (processId) {
                var currentBreadcrumbId = this.breadcrumbs[this.breadcrumbs.length - 1].processId;
                if (processId === currentBreadcrumbId) {
                    return;   // shouldn't be possible to select current breadcrumb, but just in case...
                }

                // remove breadcrumbs lower than the one selected
                var newBreadcrumbs = [];
                for (var i = 0; i < this.breadcrumbs.length; i++) {
                    var breadcrumb = this.breadcrumbs[i];
                    if (breadcrumb.processId === processId) {
                        break;
                    }
                    newBreadcrumbs.push(breadcrumb);
                }
                this.breadcrumbs = newBreadcrumbs;

                // redraw diagram and breadcrumbs
                this.processId = processId;
                this.deleteDiagram();
                if (this.breadcrumbs.length === 0) {
                    this.getRootProcessDetailsAndShowDiagram();
                } else {
                    this.getProcessModelAndShowDiagram();
                }
            }.bind(this);

            // add the breadcrumb
            this.breadcrumbs.push(breadcrumbMain);

            // set up click handlers for breadcrumbs
            if (this.breadcrumbs.length > 0) {
                var breadcrumbsElementContent = new core.Element("div");
                for (var i = 0; i < this.breadcrumbs.length; i++) {
                    var breadcrumb = this.breadcrumbs[i];

                    if (i < (this.breadcrumbs.length - 1)) {
                        var link = new core.Element("a");
                        link.setAttribute("class", "ebBreadcrumbs-link elFlowAutomationLib-wProcessDefinitionDiagram-diagram-breadcrumb");
                        link.setAttribute("style", "cursor: pointer");
                        link.setText(breadcrumb.processName);
                        link.addEventHandler("click", ProcessDefinitionDiagramBreadcrumbHandler.bind(this,
                            breadcrumb.processId));
                        breadcrumbsElementContent.append(link);

                        var span = new core.Element("span");
                        span.setText(" > ");
                        span.setAttribute("class", "elFlowAutomationLib-wProcessDefinitionDiagram-diagram-breadcrumb");
                        breadcrumbsElementContent.append(span);
                    } else {
                        var currentLink = new core.Element("a");
                        currentLink.setAttribute("class", "ebBreadcrumbs-link elFlowAutomationLib-wProcessDefinitionDiagram-diagram-breadcrumb-current");
                        currentLink.setAttribute("style", "pointer-events: none");
                        currentLink.setText(breadcrumb.processName);
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