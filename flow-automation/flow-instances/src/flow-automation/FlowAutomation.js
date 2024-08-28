define([
    'jscore/core',
    'i18n!flow-automation/dictionary.json',
    'layouts/TopSection',
    'layouts/MultiSlidingPanels',
    './regions/flows/Flows',
    './regions/instances/Instances',
    './services/FlowService',
    './ext/InstanceActionManager',
    'jscore/ext/locationController',
    'flow-automation-lib/helper/utils',
    'flow-automation-lib/services/Notifications',
    'flow-automation-lib/services/AuthorizationService'
], function (core, Dictionary, TopSection, MultiSlidingPanels, Flows, Instances,
             FlowService, ActionManager, LocationController, utils, Notifications, AuthorizationService) {
    'use strict';

    return core.App.extend({

        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {
            AuthorizationService.authorize(this.onSuccess.bind(this));
        },

        onSuccess: function () {
            this.topSection = this.newTopSection();
            this.regions = this.newRegions();

            this.topSection.setContent(this.multiSlidingPanel(this.regions.flows, this.regions.instances));
            this.topSection.attachTo(this.getElement());

            this.getEventBus().subscribe('Instances:selected', this.onFlowInstanceSelect, this);
            this.getEventBus().subscribe('FlowInstance:notify', this._onSendNotification, this);
            this.getEventBus().subscribe('FlowInstance:notifyDeletion', this._onSendNotificationDeletion, this);

            this.locationController = new LocationController({
                namespace: this.options.namespace
            });
            this.locationController.start();
            ActionManager.setLocation(this.locationController);
            ActionManager.setEventBus(this.getEventBus());
        },

        newTopSection: function () {
            return new TopSection({
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                context: this.getContext(),
                defaultActions: []
            });
        },

        newRegions: function () {
            var flows = new Flows({
                context: this.getContext()
            });
            var instances = new Instances({
                context: this.getContext()
            });
            return {'flows': flows, 'instances': instances};
        },

        multiSlidingPanel: function (flows, instances) {
            return new MultiSlidingPanels({
                context: this.getContext(),
                showLabel: true,
                resizeable: true,
                showFlyoutInMobileMode: true,
                resizeMode: MultiSlidingPanels.RESIZE_MODE.ON_DRAG,
                main: {
                    label: Dictionary.get('instances'),
                    content: instances
                },
                left: [{
                    label: Dictionary.get('flows'),
                    value: 'info',
                    content: flows,
                    expanded: true
                }]
            });
        },

        _onSendNotification: function (message, element) {
            this.regions.instances.fetchAllInstances();
            var notification = Notifications.success(message);
            notification.attachTo(this.getElement());
        },

        _onSendNotificationDeletion: function (message, removeElement) {
            if (!!removeElement) {
                this.onFlowInstanceSelect(false, false);
                this.regions.instances.removeRow(removeElement);
            }
            var notification = Notifications.success(message);
            notification.attachTo(this.getElement());
        },


        onFlowInstanceSelect: function (flowInstance, selected) {
            if (selected) {
                ActionManager.getFlowInstanceActions(flowInstance);
            } else {
                var isSelectedRow = FlowService.getSelectedRow().length > 0;
                var enable = isSelectedRow ? FlowService.getSelectedRow()[0].options.model.enabled : false;
                ActionManager.getFlowActions(isSelectedRow, enable);
            }
        },

        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {
            if (!!this.locationController) {
                this.locationController.stop();
            }
        },

        /**
         * Called when the user navigates back to the application.
         */
        onResume: function () {
            this.locationController.start();
            this.getEventBus().publish('FlowInstances:resumed', utils.getURLSearchParams().get("flowId"));
        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         */
        onBeforeLeave: function () {
            this.getEventBus().publish('FlowInstances:leaving');
        }
    });
});
