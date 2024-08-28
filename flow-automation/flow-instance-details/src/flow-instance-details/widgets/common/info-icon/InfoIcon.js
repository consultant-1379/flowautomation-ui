define([
    'jscore/core',
    './InfoIconView',
    'widgets/InfoPopup',
    'widgets/Tooltip',
    'i18n!flow-instance-details/dictionary.json',
    '../../common/enums/InfoIconOpacity',
    '../../common/enums/InfoIconVisibility'
], function (core, View, InfoPopup, Tooltip, Dictionary, Opacity, Visibility) {
    'use strict';

    return core.Widget.extend({

        View: View,

        /************* internal methods ************************/

        init: function (options) {
            this.descriptionData = this._getDescriptionData(options);
        },

        onViewReady: function () {
            if (this.hidden) {
                this.view.hide();
            }
            if (this.indentLevel > 0) {
                this.view.indent(this.indentLevel * 28);
            }
            this._setInfoIcon();
        },

        /*************** event handlers ************************/

        onShowPopup: function () {
            this.tooltip.destroy();

            if (this._isHoverVisibility()) {
                this._handleSelectedOpacity();
            } else if(this._isDefaultHoverAndVisibility()){
                this.view.setSelectedLowOpacity();
            }
        },

        onhidePopup: function () {
            this.tooltip = this._setTooltip();

            if (this._isHoverVisibility()) {
                this._handleHoverOpacity();
            } else if(this._isDefaultHoverAndVisibility()){
                this.view.setVisibleOnHoverAndLowOpacity();
            }
        },

        /**************  private methods **********************/

        _setInfoIcon: function () {
            if (this._isNeverVisibility()) {
                return;
            }

            this.popup = new InfoPopup({
                content: this.descriptionData.text,
            });

            this.popup.addEventHandler("show", this.onShowPopup.bind(this));
            this.popup.addEventHandler("hide", this.onhidePopup.bind(this));
            this.popup.attachTo(this.view.getInfo());

            this.tooltip = this._setTooltip();

            if (this._isAlwaysVisibility()) {
                this._handleAlwaysVisibleOpacity();
            } else if (this._isHoverVisibility()) {
                this._handleHoverOpacity();
            } else {
                this.view.setVisibleOnHoverAndLowOpacity();
            }
        },

        _getDescriptionData: function (property) {
            var descriptionData = {};

            if (property.description) {
                descriptionData = Object.assign({}, descriptionData, {text: property.description});
            }
            if (property.uiStyle) {
                if (property.uiStyle.descriptionOpacity) {
                    descriptionData = Object.assign({}, descriptionData, {opacity: property.uiStyle.descriptionOpacity});
                }
                if (property.uiStyle.descriptionVisibility) {
                    descriptionData = Object.assign({}, descriptionData, {visibility: property.uiStyle.descriptionVisibility});
                }
            }

            return descriptionData;
        },

        _setTooltip: function () {
            var tooltip = new Tooltip({
                parent: this.view.getInfo(),
                contentText: Dictionary.get("showInfo")
            });

            return tooltip;
        },

        _handleSelectedOpacity: function () {
            switch (this.descriptionData.opacity.toLowerCase().trim()) {
                case Opacity.HIGH:
                    this.view.setSelectedHighOpacity();
                    break;

                case Opacity.MEDIUM:
                    this.view.setSelectedMediumOpacity();
                    break;

                case Opacity.LOW:
                    this.view.setSelectedLowOpacity();
                    break;
                default :
                    this.view.setSelectedLowOpacity();
            }
        },

        _handleAlwaysVisibleOpacity: function () {
            if (this.descriptionData.opacity) {

                switch (this.descriptionData.opacity.toLowerCase().trim()) {
                    case Opacity.HIGH:
                        this.view.setAlwaysVisibleAndHighOpacity();
                        break;

                    case Opacity.MEDIUM:
                        this.view.setAlwaysVisibleAndMediumOpacity();
                        break;

                    case Opacity.LOW:
                        this.view.setAlwaysVisibleAndLowOpacity();
                        break;
                    default :
                        this.view.setAlwaysVisibleAndLowOpacity();
                }
            }
        },

        _handleHoverOpacity: function () {
            if (this.descriptionData.opacity) {

                switch (this.descriptionData.opacity.toLowerCase().trim()) {
                    case Opacity.HIGH:
                        this.view.setVisibleOnHoverAndHighOpacity();
                        break;

                    case Opacity.MEDIUM:
                        this.view.setVisibleOnHoverAndMediumOpacity();
                        break;

                    case Opacity.LOW:
                        this.view.setVisibleOnHoverAndLowOpacity();
                        break;
                    default :
                        this.view.setVisibleOnHoverAndLowOpacity();
                }
            }
        },

        _isDefaultHoverAndVisibility: function(){
            return this.descriptionData.text && !this.descriptionData.visibility && !this.descriptionData.opacity;
        },

        _isHoverVisibility: function(){
            return this.descriptionData.visibility && this.descriptionData.visibility.toLowerCase().trim() === Visibility.HOVER;
        },

        _isNeverVisibility: function(){
            return this.descriptionData.visibility && this.descriptionData.visibility.toLowerCase().trim() === Visibility.NEVER;
        },

        _isAlwaysVisibility: function(){
            return this.descriptionData.visibility && this.descriptionData.visibility.toLowerCase().trim() === Visibility.ALWAYS;
        }
    });
});
