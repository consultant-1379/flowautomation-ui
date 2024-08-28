define([
    'jscore/core',
    './LinkView',
    'widgets/Tooltip',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, Tooltip, Info, utils, InfoIcon) {

    'use strict';
    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.setLink();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

            this._setInfo();
        },

        setLink: function () {
            // Hide the link widget itself when the link doesn't have any value.
            if (!this.property.default) {
                this.hide();
            } else {
                this.view.setLabel(utils.concatIfExist(this.property.name, this.property.nameExtra));
                var linkText = this.property.linkText;
                this.view.setLink(linkText ? linkText : "View", this.property.default);
                this.createLinkTooltip();
            }
        },

        createLinkTooltip: function () {
            var toolTip = new Tooltip({
                parent: this.view.getLink(),
                content: this.property.default,
                width: 200
            });
            toolTip.enable();
        },


        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        getValue: function () {
            return undefined;
        },

        hide: function () {
            this.view.hide();
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },
    });
});