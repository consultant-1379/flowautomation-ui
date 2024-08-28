define([
    'jscore/core',
    'jscore/ext/net',
    'i18n!flow-catalog/dictionary.json',
    'layouts/TopSection',
    'layouts/MultiSlidingPanels',
    './regions/main/Main',
    './regions/flow-summary/FlowSummary',
    './ext/ActionManager',
    'flow-automation-lib/services/Notifications',
    'jscore/ext/locationController',
    'flow-automation-lib/services/AuthorizationService'
], function (core, net, dictionary, TopSection, MultiSlidingPanels, Main, FlowSummary, ActionManager, Notifications, LocationController, AuthorizationService) {
    'use strict';

    /*The following code is taken from Mozzilla's pageVisibility api documentation which can be found here:
    https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    It sets 'hidden' and 'visibilityChange' variables based on the browser under which you are running*/
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    return core.App.extend({

        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {
            AuthorizationService.authorize(this.onSuccess.bind(this));
        },

        onSuccess: function () {

            //Listening to visibility changed events (switching tabs)
            document.addEventListener(visibilityChange, this.handleVisibilityChange.bind(this), false);

            ActionManager.setEventBus(this.getEventBus());

            var main = new Main({
                context: this.getContext()
            });

            var flowSummary = new FlowSummary({
                context: this.getContext()
            });

            var msp = new MultiSlidingPanels({
                context: this.getContext(),
                resizeable: true,
                showFlyoutInMobileMode: true,
                resizeMode: MultiSlidingPanels.RESIZE_MODE.ON_DRAG,
                main: {
                    label: dictionary.main.header,
                    content: main
                },
                right: [{
                    label: dictionary.summary.title,
                    icon: "info",
                    value: 'info',
                    content: flowSummary,
                    expanded: true
                }],
                rightWidth: 300
            });

            var topSection = new TopSection({
                context: this.getContext(),
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                defaultActions: ActionManager.getDefaultActions()
            });

            topSection.setContent(msp);
            topSection.attachTo(this.getElement());

            this.getEventBus().subscribe('mainflow:selected', this.onFlowSelect, this);
            this.getEventBus().subscribe('mainflow:selectionCleared', this.onClearSelection, this);
            this.getEventBus().subscribe('mainflow:flowStatusChangedSuccess', this.onFlowStatusChangedSuccess, this);

            this.getEventBus().subscribe('ActionManager:setLocationToInstances', this.setLocation, this);
            this.getEventBus().subscribe('FlowInstances:newInstance', this.fetchInstance, this);
            this.locationController = new LocationController({
                namespace: this.options.namespace
            });
            this.locationController.start();
        },

        setLocation: function (parameter) {
            this.locationController.setLocation('flow-automation?' + parameter);
        },

        fetchInstance: function (data) {
            net.ajax({
                url: '/flowautomation/v1/executions',
                type: 'GET',
                dataType: 'json',
                data: {
                    "flow-id": this.selectedFlowData.flow.id,
                    "flow-execution-name": data.name,
                    "filter-by-user": "false"
                },
                success: this.instanceFetchSuccess.bind(this),
                error: this.instanceFetchError.bind(this)
            });
        },

        instanceFetchSuccess: function (flowInstance) {
            var openUsertasks = flowInstance && (typeof flowInstance.userTasks === 'object');
            this.locationController.setLocation('flow-automation/flowinstancedetails?flowId=' + flowInstance[0].flowId + '&source=' + flowInstance[0].flowSource + '&executionName=' + flowInstance[0].name + '&userTasks=' + openUsertasks + '&state=' + flowInstance[0].state);
        },

        instanceFetchError: function () {
            var errorMessage = dictionary.get("execute.failedToRetrieveInstance");
            var notification = Notifications.warning(errorMessage);
            notification.attachTo(this.getElement());
        },

        onFlowSelect: function (flowData) {
            this.selectedFlowData = flowData;
            var contextActions = ActionManager.getCurrentContextActions();

            if (flowData.flow.status === 'enabled') {
                contextActions.disable.name = dictionary.flow.disable;
                contextActions.execute.disabled = false;
            } else {
                contextActions.disable.name = dictionary.flow.enable;
                contextActions.execute.disabled = true;
            }
            ActionManager.setSelectedFlowData(flowData.flow);
            ActionManager.updateCurrentContextActions(contextActions);
            var actions = ActionManager.getContextActions(flowData);
            this.getEventBus().publish('topsection:contextactions', actions);
        },

        onClearSelection: function () {
            var actions = ActionManager.getContextActions(false);
            this.getEventBus().publish('topsection:contextactions', actions);
            this.getEventBus().publish('topsection:leavecontext');
        },

        onFlowStatusChangedSuccess: function () {
            var contextActions = ActionManager.getCurrentContextActions();

            if (contextActions.disable.name === dictionary.flow.enable) {
                contextActions.disable.name = dictionary.flow.disable;
                contextActions.execute.disabled = false;
                this.selectedFlowData.flow.status = 'enabled';
            } else {
                contextActions.disable.name = dictionary.flow.enable;
                contextActions.execute.disabled = true;
                this.selectedFlowData.flow.status = 'disabled';
            }

            var actions = ActionManager.getContextActions(this.selectedFlowData);
            this.getEventBus().publish('topsection:contextactions', actions);
        },
        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {

        },

        /**
         * Called when the user navigates back to the application.
         */
        onResume: function () {
            this.getEventBus().publish('FlowAutomation:ResumingApp');
            this.getEventBus().publish('topsection:leavecontext');
        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         */
        onBeforeLeave: function () {
            this.getEventBus().publish('topsection:leavecontext');
        },

        handleVisibilityChange: function () {
            if (!document[hidden]) {
                this.getEventBus().publish('FlowAutomation:appVisible');
            }
        }
    });

});