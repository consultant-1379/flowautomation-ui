define([
    'jscore/core',
    './InfoView'
], function (core, View) {
    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.text = options.text;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            if (this.hidden) {
                this.view.hide();
            }
            if (this.indentLevel > 0) {
                this.view.indent(this.indentLevel * 28);
            }
            this._setInfo();
        },

        _setInfo: function () {
            if (this.text) {
                this.view.setInfo(this.text);
                this.view.showInfo();
            } else {
                this.view.hideInfo();
            }
        },

        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        }
    });
});
