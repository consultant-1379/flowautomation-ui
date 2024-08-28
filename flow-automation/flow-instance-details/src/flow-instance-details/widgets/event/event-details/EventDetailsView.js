/*global define*/
define([
    'jscore/core',
    'template!./_eventDetails.hbs',
    'styles!./_eventDetails.less',
    'flow-automation-lib/helper/utils'
], function (core, template, styles, utils) {
    'use strict';

    var __prefix = '.eaFlowInstanceDetails-wEventDetails';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getViewElement: function (classId) {
            return this.getElement().find(__prefix + classId);
        },

        getStyle: function () {
            return styles;
        },

        setSeverity: function (text) {
            this.getViewElement("-group-severity-data").setText(text);

            var className;
            var icon = "ebIcon_error";

            switch (text) {
                case "INFO":
                    className = "eaFlowInstanceDetails-wEventDetails-group-severity ebBgColor_paleBlue";
                    icon = "ebIcon_infoMsgIndicator";
                    break;
                case "WARNING":
                    className = "eaFlowInstanceDetails-wEventDetails-group-severity ebBgColor_yellow";
                    icon = "ebIcon_warning";
                    break;
                default:
                    className = "eaFlowInstanceDetails-wEventDetails-group-severity ebBgColor_red";
            }
            this.getSeverityField().getNative().className = className;
            this._setIcon(icon);
            this._setIconBackground();
        },

        setTime: function (text) {
            this.getViewElement("-group-time-data").setText(text);
        },

        setSynopsis: function (text) {
            this.getViewElement("-group-synopsis-data").getNative().innerHTML = utils.convertLinkIntoClickableLink(text);
        },

        setTarget: function (text) {
            this.getViewElement("-group-target-data").setText(text);
        },

        setDetails: function (text) {
            this.getViewElement("-group-details-data").getNative().innerHTML = utils.convertLinkIntoClickableLink(text);
        },

        getSeverityField: function () {
            return this.getViewElement("-group-severity");
        },

        setMarginLeftMain: function (flyOut) {
            if (flyOut) {
                this.getViewElement("-group").setStyle("margin-left", "0px");
            } else {
                this.getViewElement("-group").setStyle("margin-left", "15px");
            }
        },

        _setIcon: function (ebIconClass) {
            if (ebIconClass) {
                this.getViewElement('-group-severity-icon').setAttribute('class', ebIconClass + ' ebIcon eaFlowInstanceDetails-wEventDetails-group-severity-icon');
            } else {
                this.getViewElement('-group-severity-icon').setAttribute('class', 'eaFlowInstanceDetails-wEventDetails-group-severity-no-icon eaFlowInstanceDetails-wEventDetails-group-severity-icon'); // If no icon is specified, then un-set ebIcon class to remove "width: 16px" style from <i>
            }
        },

        _setIconBackground: function () {
            this.getViewElement('-group-severity-icon').setStyle('background-color', '#FFF');
        }
    });
});