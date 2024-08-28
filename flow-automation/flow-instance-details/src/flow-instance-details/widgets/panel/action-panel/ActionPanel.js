define([
    'jscore/core',
    './ActionPanelView',
    'widgets/Button',
    'i18n!flow-instance-details/dictionary.json'
], function (core, View, Button, dictionary) {

    'use strict';
    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.actions = options.actions;
            this.buttons = [];
        },

        onViewReady: function () {
            var view = this.view;
            this.actions.forEach(function (action) {
                var button = new Button({
                    caption: dictionary.get("actions." + action.name.toString().toLocaleLowerCase()),
                    icon: action.icon,
                    modifiers: [{
                        name: 'small'
                    }, {
                        name: 'color',
                        value: action.color
                    }],
                });

                button.getElement().setAttribute("style", "margin: 2.5px;");

                if (action.onClick) {
                    button.addEventHandler("click", action.onClick.bind(this));
                }
                button.attachTo(view.getActions());
                this.buttons.push(button);
            }.bind(this));
        },

        onDestroy: function () {
            this.actions = null;
            this.buttons.forEach(function (button) {
                button.destroy();
            });
            this.buttons = null;
        },

        disableContinueButton: function () {
            this.view.disableContinueButton();
        },

        enableContinueButton: function () {
            this.view.enableContinueButton();
        }
    });
});