define([
    'jscore/core',
    'text!./_fileInput.hbs',
    'styles!./_fileInput.less'
], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-wFileSelector';

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

        getFileName: function () {
            return this.getElement().find(parentEl + '-textBox-fileName');
        },

        getFileSelectionInput: function () {
            return this.getElement().find(parentEl + '-fileSelectorInput');
        },

        getFileSelectionButton: function () {
            return this.getElement().find(parentEl + '-button');
        },

        getFileNameErrorParentDiv: function () {
            return this.getElement().find(parentEl + '-status');
        },

        getFileNameErrorText: function () {
            return this.getElement().find('.ebInput-status');
        },

        removeFileError: function () {
            this.getFileName().setAttribute(
                'class',
                'eaFlowInstanceDetails-wFileSelector-textBox-fileName'
            );
        },

        setFileError: function () {
            this.getFileName().setAttribute(
                'class',
                'eaFlowInstanceDetails-wFileSelector-textBox-fileName eaFlowInstanceDetails-wFileSelector-inputError'
            );
        },

        hide: function () {
            this.getViewElement('-inner').setStyle('display', 'none');
        },

        isHidden: function () {
            if (this.getViewElement('-inner').getStyle('display') === 'none') {
                return true;
            }
            return false;
        },

        reveal: function () {
            this.getViewElement('-inner').setStyle('display', 'inline-block');
        },

        getInfo: function(){
            return this.getViewElement('-info');
        },

        indent: function (valueToIndent) {
            this.getViewElement('-inner').setStyle('margin-left', valueToIndent + 'px');
        },

        showError: function () {
            this.getFileNameErrorParentDiv().setStyle('display', 'block');
        },

        hideError: function () {
            this.getFileNameErrorParentDiv().setStyle('display', 'none');
        },

        padBottom: function (){
            this.getViewElement('-inner').setStyle('margin-bottom', '15px');
        },

        getRemoveFileIcon: function(){
            return this.getElement().find(parentEl + '-remove-file');
        },

        showRemoveIcon: function(){
            this.getRemoveFileIcon().setStyle('display', 'inline-block');
        },

        hideRemoveIcon: function(){
            this.getRemoveFileIcon().setStyle('display', 'none');
        }
    });
});