define([
    'jscore/core',
    'text!./_poupupTable.hbs',
    'styles!./_popupTable.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wPopupTable';
    var USER_TASK_FORM_OVERLOAD_WIDTH = 30;
    var INDENT_WIDTH = 28;

    return core.View.extend({
        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function (cssText) {
            return this.getElement().find(parentEl + cssText);
        },

        getTable: function(){
            return this.getViewElement("-container-table");
        },

        getFilter: function(){
            return this.getElement().find(parentEl + '-container-topPanel-filter');
        },

        getHeader: function(){

            return this.getElement().find(parentEl + '-container-topPanel-header');
        },

        hide: function () {
            this.getViewElement("-container").setStyle('display', 'none');
        },

        isHidden: function () {
            if (this.getViewElement("-container").getStyle('display') === 'none') {
                return true;
            }
            return false;

        },

        reveal: function () {
            this.getViewElement("-container").setStyle('display', 'inline-block');
        },

        indent: function (valueToIndent) {
            this.getViewElement("-container").setStyle('margin-left', valueToIndent + 'px');
        },

        getInfo: function(){
            return this.getElement().find(parentEl + '-container-info');
        },

        setError: function (message) {
            this.getViewElement("-error").setStyle('display', 'block');
            this.getViewElement('-error-text').setText(message);
        },

        hideFilter: function(){
            this.getFilter().setStyle('display', 'none');
        },

        showTopPanel: function(){
            this.getTopPanel().setStyle('display', 'block');
        },

        hideTopPanel: function(){
            this.getTopPanel().setStyle('display', 'none');
            this.getTopPaneHeader().setStyle('display', 'none');
        },

        padBottom: function () {
            this.getViewElement("-container").setStyle('margin-bottom', '15px');
        },

        getTitle: function(){
            return this.getElement().find(parentEl + '-container-topPanel-header-text');
        },

        setTitle: function (text) {
            this.getTitle().getNative().textContent = text;
        },

        getTopPanel: function(){
            return this.getElement().find(parentEl + '-container-topPanel');
        },

        getTopPaneHeader: function(){
            return this.getElement().find(parentEl + '-container-header');
        },

        resetContainerWidth: function (indentLevel) {
            if (indentLevel > 0) {
                this.getViewElement("-container").setStyle('width', 'calc(100% - ' + indentLevel * INDENT_WIDTH + 'px)');
            }
        },

        getPopupTableWidth: function (indentLevel) {
            return document.querySelector(".eaFlowInstanceDetails-wUserTaskForm-form").clientWidth - USER_TASK_FORM_OVERLOAD_WIDTH - indentLevel * INDENT_WIDTH;
        }
    });
});