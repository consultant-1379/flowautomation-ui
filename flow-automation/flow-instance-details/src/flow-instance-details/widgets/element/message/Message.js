define([
    'jscore/core',
    './MessageView',
    'widgets/InlineMessage',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, InlineMessage, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.messageWidget = new InlineMessage({
                icon: this.getIcon(this.property),
                header: this.property.name,
                description: this.property.info
            });
            this.messageWidget.attachTo(this.view.getContent());
            this.view.setBorderStyle(this.getBorderStyle(this.property));
            this.view.indent(this.indentLevel * 28);
            if (this.hidden) {
                this.hide();
            }
        },

        getIcon: function (property) {
            if (property.format === "message-error") {
                return "error";
            } else if (property.format === "message-warning") {
                return "warning";
            } else {
                return "infoMsgIndicator";
            }
        },

        getBorderStyle: function (property) {
            if (property.format === "message-error") {
                return "error";
            } else if (property.format === "message-warning") {
                return "warning";
            } else {
                return "info";
            }
        },

        // ------------------ default method ---------------------- //

        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        getValue: function () {
            return undefined;
        }
    });
});