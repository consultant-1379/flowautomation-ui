define([
    'jscore/core',
    './LabelView',
    'i18n!flow-instance-details/dictionary.json',
    '../../common/enums/linkTypes',
    './linkUtil',
    '../../common/info/Info',
    '../../common/info-icon/InfoIcon'
], function (core, View, dictionary, linkTypes, linkUtil, Info, InfoIcon) {

    'use strict';

    function _getDefaultValue(property) {
        if (property.format === 'checkbox' && property.type === 'object') {
            //inserting true or false as the default value for nested checkbox, because it wont be returned in the schema for confirm and review
            //left out of dictionary as they just represent the positive and negative boolean values, rather than the text value
            if (!property.properties) {
                return 'false';
            } else {
                return 'true';
            }
        }
        if (property.format === 'radio') {
            // Returning undefined here because 'default' for radio button means the default selection as opposed to a value for a label
            return undefined;
        }
        if (property.format === 'select' || property.format === 'select-list') {
            if (property.enumNames) {
                var indexOfDefault = 0;
                if (property.default) {
                    indexOfDefault = property.enum.indexOf(property.default);
                }
                return property.enumNames[indexOfDefault];
            } else {
                return property.default;
            }
        }
        return property.default;
    }

    return core.Widget.extend({

        view: function () {
            return new View({isConfirmAndReview: this.isConfirmAndReview});
        },

        init: function (options) {
            this.property = options.property;
            this.linkType = options.linkType;
            //Do not remove these properties as they are used for creating the overall form
            this.hidden = options.hidden;
            this.isConfirmAndReview = options.isConfirmAndReview;
            this.indentLevel = options.indentLevel;
            this.header = options.header;
            this.nestedObject = options.nestedObject;
        },

        onViewReady: function () {
            var defaultValue = _getDefaultValue(this.property);
            if (this.isConfirmAndReview) {
                if (this.indentLevel === 0) {
                    this.header = true;
                }
                this.view.setConfirmAndReviewLabel(this.property, defaultValue, this.indentLevel, this.header, this.nestedObject);
            } else {
                if (this.property.type && this.property.type === 'object' && !defaultValue) {
                    this.header = true;
                }
                this.view.setLabel(this.property, defaultValue, this.indentLevel, this.header);
                if (!!this.property.description) {
                    this.infoIcon = new InfoIcon(this.property);
                    this.infoIcon.attachTo(this.view.getInfoIcon());
                }
            }

            this.handleReviewElements(defaultValue);
            this.view.indent(this.indentLevel * 28, this.isConfirmAndReview);
            if (this.hidden && !this.isConfirmAndReview) {
                this.hide();
            }

           this._setInfo();
        },

        handleReviewElements: function (defaultValue) {
            if (defaultValue !== undefined && defaultValue !== null) {
                if (this.linkType === linkTypes.TABLE) {
                    if (this.property.default && this.property.default.length > 0) {
                        this.view.setDefaultValue(this.property.default.length, this.isConfirmAndReview);
                        this.view.getLinkValue().addEventHandler('click', this.onTableLinkClick, this);
                        this.view.setLinkValue(dictionary.get("reviewConfirmDialog.link"));
                        this.view.displayValueElement();
                        return;
                    }
                } else if (this.linkType === linkTypes.LIST) {
                    if (this.property.default && this.property.default.length > 0) {
                        this.view.setDefaultValue(this.property.default.length, this.isConfirmAndReview);
                        this.view.getLinkValue().addEventHandler('click', this.onListLinkClick, this);
                        this.view.setLinkValue(dictionary.get("reviewConfirmDialog.link"));
                        this.view.displayValueElement();
                        return;
                    }
                } else if (Array.isArray(defaultValue)) {
                    this.view.setDefaultValue(defaultValue.join("\n"), this.isConfirmAndReview);
                    this.view.displayArrayValueElement();
                    return;
                } else {
                    this.view.setDefaultValue(defaultValue, this.isConfirmAndReview);
                }
                this.view.removeValueLinkElement();
                this.view.displayValueElement();
            } else {
                this.view.removeValueElement();
                this.view.removeValueLinkElement();
            }
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        onTableLinkClick: function () {
            linkUtil.onTableLinkClick({property: this.property, isReviewConfirmView: this.isConfirmAndReview});
        },

        onListLinkClick: function () {
            linkUtil.onListLinkClick({property: this.property, isReviewConfirmView: this.isConfirmAndReview});
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