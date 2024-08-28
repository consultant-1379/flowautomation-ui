define([
    'jscore/core',
    'layouts/TopSection',
    './regions/FlowInstanceDetails/FlowInstanceDetails',
    'flow-automation-lib/services/AuthorizationService'
], function (core, TopSection, FlowInstanceDetails, AuthorizationService) {
    'use strict';

    return core.App.extend({

        topSection: function () {
            return new TopSection({
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                context: this.getContext(),
                defaultActions: [{}]
            });
        },

        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {
            AuthorizationService.authorize(this.onSuccess.bind(this));
        },

        onSuccess: function () {
            var topSection = this.topSection();
            var context = this.getContext();
            context.topSection = topSection;
            this.flowInstanceDetails = new FlowInstanceDetails({
                context: context
            });
            topSection.setContent(this.flowInstanceDetails);
            topSection.attachTo(this.getElement());
        },

        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {
            if (!!this.flowInstanceDetails) {
                this.flowInstanceDetails.stop();
            }
        },

        /**
         * Called when the user navigates back to the application.
         */
        onResume: function () {
            this.flowInstanceDetails.start();
        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         */
        onBeforeLeave: function () {
        }
        // See complete documentation about the application lifecycle in the Container docs.
    });
});