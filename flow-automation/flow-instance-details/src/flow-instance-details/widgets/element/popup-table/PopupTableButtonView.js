define([
    'jscore/core',
    'text!./_popupTableButton.hbs',
    'styles!./_popupTableButton.less'
], function (core, template, styles) {
    'use strict';
    var parentEl = '.eaFlowInstanceDetails-wPopupTableButton';

    return core.View.extend({
        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getViewElement: function () {
            return this.getElement().find(parentEl);
        },

        getHeaderElement: function () {
            return this.getElement().find(parentEl + '-header');
        },

        hide: function () {
            this.getHeaderElement().setStyle('display', 'none');
            this.getElement().setStyle('padding-bottom', 'inherit');
        },

        isHidden: function () {
            if (this.getHeaderElement().getStyle('display') === 'none') {
                return true;
            }
            return false;

        },

        reveal: function () {
            this.getHeaderElement().removeStyle('display');
            this.getElement().removeStyle('padding-bottom');
        },

        indent: function (valueToIndent) {
            this.getHeaderElement().setStyle('margin-left', valueToIndent + 'px');
        },

        padBottom: function () {
            this.getHeaderElement().setStyle('margin-bottom', '15px');
        },

        getSelectedItems: function(){
            return this.getElement().find(parentEl + '-header-selectedValue');
        },

        getSelectedItemsTable: function(){
            return this.getElement().find(parentEl + '-header-selectedValue-table');
        },

        getButton: function(){
            return this.getElement().find(parentEl + '-header-button');
        },

        getInfo: function(){
            return this.getElement().find(parentEl + '-header-info');
        },

        getTitle: function(){
            return this.getElement().find(parentEl + '-header-title');
        },

        setTitle: function(text){
            this.getTitle().getNative().textContent = text;
        },

        hideSelectedItems: function(){
            this.getSelectedItems().setStyle('display', 'none');
        },

        showSelectedItems: function(){
            this.getSelectedItems().removeStyle('display');
        },

        getSelectedItemsTitle: function(){
            return this.getElement().find(parentEl + '-header-selectedValue-title');
        },

        setSelectedItemsTitle: function(text){
            this.getSelectedItemsTitle().getNative().textContent = text;
        }
    });
});