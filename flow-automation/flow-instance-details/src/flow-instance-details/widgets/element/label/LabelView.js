define([
    'jscore/core',
    'template!./_label.hbs',
    'styles!./_label.less'
], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wLabel';

    return core.View.extend({
        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (classId) {
            return this.getElement().find(parentEl + classId);
        },

        getLabel: function () {
            return this.getViewElement('-content-label');
        },

        setLabel: function (property, defaultValue, indentLevel, header) {
            if (!!property.name) {
                this.getLabel().setText(property.name);
                if (header) {
                    this.setHeader(indentLevel);
                }
            }
        },

        setConfirmAndReviewLabel: function (property, defaultValue, indentLevel, header, nestedObject) {
            this.getElement().setAttribute('class',
                this.getElement().getAttribute('class') + " eaFlowInstanceDetails-wLabel-review");
            if (!!property.name) {
                this.getLabel().setText(property.name);
                if (header) {
                    this.setConfirmAndReviewHeader(indentLevel, nestedObject);
                }
            }
        },

        getInfo: function () {
            return this.getViewElement('-info');
        },

        getInfoIcon: function(){
            return this.getViewElement('-inner-description');
        },

        setHeader: function (indentLevel) {
            if (indentLevel !== 0) {
                this.getLabel().setAttribute('class',
                    this.getLabel().getAttribute('class') + " eaFlowInstanceDetails-wLabel-content-label-h4");
            } else {
                this.getLabel().setAttribute('class',
                    this.getLabel().getAttribute('class') + " eaFlowInstanceDetails-wLabel-content-label-h3");
            }
        },

        setConfirmAndReviewHeader: function (indentLevel, nestedObject) {
            if (indentLevel === 0) {
                if (nestedObject) {
                    this.getLabel().setAttribute('class',
                        this.getLabel().getAttribute('class') + " eaFlowInstanceDetails-wLabel-content-label-h4");
                } else {
                    this.getLabel().setAttribute('class',
                        this.getLabel().getAttribute('class') + " eaFlowInstanceDetails-wLabel-content-label-h3");
                    this.getElement().setStyle('margin-bottom','unset');
                }
            }
        },

        // -------------- content-link element ---------------------------------

        getLinkValue: function () {
            return this.getViewElement("-content-link");
        },

        setLinkValue: function (value) {
            return this.getLinkValue().setText(value);
        },

        removeValueLinkElement: function () {
            this.getLinkValue().remove();
        },

        // -------------- content-value element ---------------------------------

        getDefaultValue: function () {
            return this.getViewElement("-content-value");
        },

        getDefaultIcon: function () {
            return this.getViewElement("-content-icon");
        },

        getDefaultTrueIcon: function () {
            return this.getViewElement("-content-icon-true");
        },

        getDefaultFalseIcon: function () {
            return this.getViewElement("-content-icon-false");
        },

        isDefaultValueTrue: function (value) {
            return (value === true || value === "true");
        },

        isDefaultValueFalse: function (value) {
            return (value === false || value === "false");
        },

        isDefaultValueBoolean: function (value) {
            return (this.isDefaultValueTrue(value) || this.isDefaultValueFalse(value));
        },

        setDefaultValue: function (value, isConfirmAndReview) {
            if (isConfirmAndReview) {
                if (this.isDefaultValueBoolean(value)) {
                    if (this.isDefaultValueTrue(value)) {
                        this.getDefaultFalseIcon().remove();
                    } else {
                        this.getDefaultTrueIcon().remove();
                    }
                    this.getDefaultIcon().setStyle("display", "inline-grid");
                    this.getDefaultValue().remove();
                } else {
                    this.getDefaultValue().setText(value);
                    this.getDefaultIcon().remove();
                }
            } else {
                this.getDefaultValue().setText(value);
            }
        },

        removeValueElement: function () {
            this.getDefaultValue().remove();
        },

        displayValueElement: function (displayValue) {
            this.getLabel().setStyle("width", "40%");
            if (this.getDefaultValue()) {
                this.getDefaultValue().setStyle("display", displayValue ? displayValue : "inline");
            }
        },

        displayArrayValueElement: function () {
            this.displayValueElement('inline-flex');
        },

        // ------------------ default method ---------------------- //

        indent: function (valueToIndent, isConfirmAndReview) {
            if (isConfirmAndReview) {
                this.getViewElement('-content-label').setStyle('margin-left', (valueToIndent + 5) + 'px');
            } else {
                this.getViewElement('-content-label').setStyle('margin-left', valueToIndent + 'px');
            }
        },

        indentValue: function (valueToIndent) {
            this.getViewElement('-content-label').setStyle('margin-right', valueToIndent + 'px');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
        },

        isHidden: function () {
            return this.getViewElement('-inner').getStyle('display') === 'none';
        },

        reveal: function () {
            var element = this.getViewElement('-inner');
            element.setStyle('display', 'flex');
            element.setStyle('width', 'auto');
        },

        padBottom: function () {
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        }
    });
});
