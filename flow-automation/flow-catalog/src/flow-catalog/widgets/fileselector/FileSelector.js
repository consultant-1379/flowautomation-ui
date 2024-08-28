define([
    'jscore/core',
    './FileSelectorView',
    'widgets/Button',
    'flow-automation-lib/services/CustomError',
    'i18n!flow-catalog/dictionary.json'
], function (core, View, Button, CustomError, dictionary) {

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.eventBus = options.eventBus;
            var importFlowDialogSubscriber = this.eventBus.subscribe('ActionManager:importFlowFormDisplayed', function () {
                this.fileSelectionButton.getElement().focus();
                this.eventBus.unsubscribe(importFlowDialogSubscriber);
            }.bind(this));
        },

        /*
         * Widget lifecycle method
         */
        onViewReady: function () {
            this.createSelectionButton();
        },

        /**
         * Called when a change occurs in the hidden file selection input.
         * If the change is due to a file selection then the file name is assigned to the visible file name element,
         * otherwise an empty string is assigned to it.
         *
         * @method onFileSelectionEvent
         */
        onFileSelectionEvent: function () {
            var selectedFile = this.getSelectedFile();
            var shownText = "";
            if (selectedFile) {
                shownText = selectedFile.name;
                this.eventBus.publish('FileSelector:selectionChange');
            }
            this.view.getFileName().setText(shownText);
        },

        /**
         * Gets the file that was selected by the user, or undefined in case of no selection.
         *
         * @method getSelectedFile
         * @return{File} or undefined if no file was selected.
         */
        getSelectedFile: function () {
            return this.view.getFileSelectionInput().getProperty('files')[0];
        },

        /**
         * Verifies if a valid file was selected and displays an error message
         * if no file was selected.
         *
         * @method isValid
         * @return{Boolean} true if a valid file is selected, false otherwise.
         */
        isValid: function () {
            var selectedFile = this.getSelectedFile();

            if (selectedFile) {
                var selectedFileName = selectedFile.name;
                var fileExtension = selectedFileName.substr(selectedFileName.lastIndexOf('.') + 1).toLowerCase();
                if (fileExtension === 'zip') {
                    return true;
                } else {
                    this.view.setValidationError(dictionary.get('import.validFlowPackage'));
                    return false;
                }
            } else {
                this.view.setValidationError(dictionary.get('import.flowPackageRequired'));
                return false;
            }
        },

        destroyAccordionErrorIfExist: function(){
            if (this.errorAccordion) {
                this.errorAccordion.destroy();
            }
        },

        checkImportError: function (response, dialog) {
            var importErrorMsg = dictionary.get("import.failureMessage");
            CustomError.importFlowErrorHandler(response, dialog, importErrorMsg, this);
        },

        showValidationError: function (text) {
            this.view.setValidationError(text);
        },

        showValidationAccordionError: function (accordion) {
            this.destroyAccordionErrorIfExist();
            this.errorAccordion = accordion;
            this.errorAccordion.attachTo(this.view.getAccordionError());
        },

        /**
         * Creating a custom and interactive fileselect button
         *
         * @method createSelectionButton
         */
        createSelectionButton: function () {
            this.fileSelectionButton = new Button({
                caption: dictionary.import.selectFileButton
            });
            this.fileSelectionButton.attachTo(this.view.getFileSelectorButton());
            this.fileSelectionButton.addEventHandler("click", function () {
                this.destroyAccordionErrorIfExist();
                this.view.removeValidationError();
                this.view.getFileSelectionInput().trigger("click");
            }.bind(this));
            this.view.getFileSelectionInput().addEventHandler("change", this.onFileSelectionEvent.bind(this));

        }
    });
});
