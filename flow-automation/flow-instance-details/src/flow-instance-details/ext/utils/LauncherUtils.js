// IDUN-2980 UI – Removing Action Library
//define([
//    'actionlibrary/ActionLibrary',
//    'widgets/Dialog'
//], function (ActionLibrary, Dialog) {
//    var LauncherUtils = function (defaultActions, actionCallback) {
//        this.defaultActionList = defaultActions;
//        this.actionCallback = actionCallback;
//    };
//
//    LauncherUtils.prototype = {
//        createLauncherAction: function (selection) {
//            var actions = this.defaultActionList ? JSON.parse(JSON.stringify(this.defaultActionList)) : [];
//            for (var t = 0; t < actions.length; t++) {
//                actions[t].action = this.defaultActionList[t].action;
//            }
//            if (!!selection[0] && selection[0].enableRemoveNodeButton === true) {
//                var removeNodesActionButton = this.createRemoveNodesAction(selection);
//                actions.push({type: 'separator'}, removeNodesActionButton);
//            }
//
//            var metaObject = this.getMetaObject(selection);
//
//            return ActionLibrary.getAvailableActions(metaObject)
//                .then(function (actions) {
//                    return this.createActionButtons(actions, selection);
//                }.bind(this))
//                .then(function (nodeActions) {
//                    if (nodeActions.length > 0 && actions.length > 0) {
//                        actions.push({type: 'separator'});
//                    }
//                    var currentCategory;
//                    nodeActions.forEach(function (action) {
//                        if (action.category !== currentCategory && currentCategory !== undefined) {
//                            actions.push({
//                                type: 'separator'
//                            });
//                        }
//                        currentCategory = action.category;
//                        actions.push(action);
//                    });
//                    return actions;
//                });
//        },
//
//        /**
//         * Create array of buttons that launch applications
//         * with selectied objects.
//         * @param Array of of actions that can be consumed by topologybrowser.
//         * @param Array of selected objects.
//         * @returns Array of buttons.
//         */
//        createActionButtons: function (actions, selection) {
//            return actions.map(function (action) {
//                var uisdkAction = {
//                    type: 'button',
//                    name: action.defaultLabel,
//                    category: action.category,
//                    action: function () {
//                        this.launchAction(action, selection);
//                    }.bind(this)
//                };
//                if (action.icon) {
//                    uisdkAction.icon = action.icon;
//                }
//                return uisdkAction;
//            }.bind(this));
//        },
//
//        /**
//         * Create metaObject based on selection
//         * @param Array of selected objects
//         * @returns {Object} metaObject
//         */
//        getMetaObject: function (selection) {
//
//            var dataType = 'ManagedObject';
//            var ob = ActionLibrary.createMetaObject(
//                'flow-automation',
//                dataType,
//                selection
//            );
//
//            return ob;
//        },
//
//        /**
//         * Executes Action i.e. Launches application.
//         * @param Action to execute.
//         * @param Selected objects.
//         */
//        launchAction: function (action, objects) {
//
//            function getButtons(dialog) {
//                return [{
//                    caption: 'OK',
//                    action: function () {
//                        dialog.hide();
//                    }.bind(this)
//                }];
//            }
//
//            ActionLibrary.executeAction(action, objects,
//                {
//                    onReady: function () {
//                        console.log('onReady: Action loaded');
//                    },
//                    onProgress: function (progress) {
//                        console.log('onProgress: Action in progress [' + Math.ceil(progress.percentage) + ']');
//                    },
//                    onComplete: function (result) {
//                        if (result.success) {
//                            console.log('onComplete: Action Clicked');
//                        }
//                        if (result.afterUseCase) {
//                            result.afterUseCase
//                                .then(this.actionCallback.successCallBack, this.actionCallback.failureCallBack)
//                                .catch(function (error) {
//                                    console.log('Error in executing action : ' + error);
//                                });
//                        }
//                    }.bind(this),
//                    onFail: function (e) {
//                        console.log('onFail: Action failed to complete and gracefully returned with an ActionResult in an Error state: ' + JSON.stringify(e));
//                        var dialog = new Dialog({
//                            header: 'Action complete',
//                            content: 'The Action was unable to launch successfully',
//                            optionalContent: 'Reason: ' + e.message
//                        });
//                        dialog.setButtons(getButtons(dialog));
//                        dialog.show();
//                    }
//                });
//        },
//
//        /**
//         * Create the action button from "Remove Nodes From This Collection"
//         * @param Selected objects.
//         * converts the @param to array of objects expected for this action:
//         * EXPECTED CONVERTED PARAMETERS
//         # [{ id: 'parentId', objects: [{ id: 'nodeId' }] }]
//         * @return a action button with "Remove Nodes From This Collection" action
//         */
//        createRemoveNodesAction: function (selection) {
//            var removeNodesAction = [{defaultLabel: Dictionary.actions.RemoveTopologyData.defaultLabel,
//                 name: 'networkexplorer-remove-from-this-collection',
//                 type: 'button',
//                 category: 'Collection Modification Actions',
//                 plugin: 'networkexplorer/networkexplorer-remove-from-this-collection'
//             }];
//             var parentId = selection[0].parentId;
//             var objectList = [];
//             selection.forEach(function(element) {
//                 objectList.push({id: element.id});
//             });
//             var objectsToRemoval = [{
//                 id: parentId,
//                 objects: objectList
//             }];
//
//             var removeNodesActionButton = removeNodesAction.map(function(action) {
//                 var uisdkAction = {
//                     type: 'button',
//                     name: action.defaultLabel,
//                     category: action.category,
//                     action: function() {
//                         this.runRemoveNodesAction(action, objectsToRemoval);
//                     }.bind(this)
//                 };
//                 if (action.icon) {
//                     uisdkAction.icon = action.icon;
//                 }
//                 return uisdkAction;
//             }.bind(this));
//
//             return removeNodesActionButton[0];
//        },
//
//        /*
//        *
//        * function to generate the Dialog Box to confirm the removal
//        * @parans action, objectsToRemoval
//        *
//        */
//        runRemoveNodesAction: function (action, objectsToRemoval) {
//            var removeNodesDialog = new Dialog({
//                header: 'header',
//                content: 'content',
//                buttons: [
//                    {
//                        caption: 'ok',
//                        action: function () {
//                            this.launchAction(action, objectsToRemoval);
//                            removeNodesDialog.hide();
//                        }.bind(this)
//                    },
//                    {
//                        caption: 'cancel',
//                        action: function () {
//                            removeNodesDialog.hide();
//                        }
//                    }
//                ]
//            });
//            removeNodesDialog.show();
//        }
//
//
//    };
//    return LauncherUtils;
//});
