define([
    'jscore/core',
    'text!./_infoIcon.hbs',
    'styles!./_infoIcon.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wInfoIcon';
    var parentClass = 'eaFlowInstanceDetails-wInfoIcon';
    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (classId) {
            return this.getElement().find(parentEl + classId);
        },

        getInfo: function () {
            return this.getViewElement('-inner');
        },

        setInfo: function (infoText) {
            this.getInfo().setText(infoText);
        },

        hideInfo: function () {
            this.getInfo().setStyle('display', 'none');
        },

        showInfo: function () {
            this.getInfo().setStyle('display', 'block');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');

        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'block');
        },

        setAlwaysVisibleAndHighOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' +  parentClass + '-inner-always-visible ' + parentClass + '-inner-always-visible-opacity-high');
        },

        setAlwaysVisibleAndMediumOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' + parentClass + '-inner-always-visible ' + parentClass + '-inner-always-visible-opacity-medium');
        },

        setAlwaysVisibleAndLowOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' +  parentClass + '-inner-always-visible ' + parentClass + '-inner-always-visible-opacity-low');
        },

        setVisibleOnHoverAndHighOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' + parentClass + '-inner-hover-opacity-high');
        },

        setVisibleOnHoverAndMediumOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' + parentClass + '-inner-hover-opacity-medium');
        },

        setVisibleOnHoverAndLowOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' + parentClass + '-inner-hover-opacity-low');
        },

        setSelectedLowOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' +  parentClass + '-inner-hover-selected ' + parentClass + '-inner-hover-selected-opacity-low');
        },

        setSelectedMediumOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' +  parentClass + '-inner-hover-selected ' + parentClass + '-inner-hover-selected-opacity-medium');
        },

        setSelectedHighOpacity : function(){
            this.getInfo().setAttribute("class", parentClass + '-inner ' +  parentClass + '-inner-hover-selected ' + parentClass + '-inner-hover-selected-opacity-high');
        }

    });

});