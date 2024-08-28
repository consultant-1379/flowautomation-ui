define([
    'jscore/core',
    './FileInputView',
    'widgets/Button',
    '../../../ext/Validations',
    'i18n!flow-instance-details/dictionary.json',
    '../../common/info/Info'
], function (core, View, Button, Validations, Dictionary, Info) {

    'use strict';

    return core.Widget.extend({

        View: View,

        init: function (options) {
            this.property = options.property;
            this.key = options.key;
            this.hidden = options.hidden;
            this.validations = this.property.validations;
            this.indentLevel = options.indentLevel;
        },

        onViewReady: function () {
            this.fileName = Object.keys(this.property.properties)[0];
            this.defaultFile = this.property.properties[this.fileName]["default"];
            this.fileContents = Object.keys(this.property.properties)[1];

            this.createSelectionButton();
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }
            this.initFileSelector();
            this._setInfo();
        },

        onDOMAttach: function () {
            if (this.validations) {
                Validations.createValidations(this.validations, this.parentName);
            }
        },

        initFileSelector: function () {
            if (this.defaultFile) {
                this.displaySelectedFile(this.defaultFile);
            } else {
                this.displayNoSelection();
            }

            this.view.getRemoveFileIcon().addEventHandler("click", this.onFileRemove.bind(this));
        },

        onFileRemove: function () {
            this.displayNoSelection();
            this.view.getFileSelectionInput().getNative().value = null;
        },

        displaySelectedFile: function (filename) {
            this.view.getFileName().setText(filename);
            this.view.showRemoveIcon();
        },

        displayNoSelection: function () {
            this.view.getFileName().setText(Dictionary.get('inputs.file.noFileChosenMessage'));
            this.view.hideRemoveIcon();
        },

        onFileSelectionEvent: function () {
            var selectedFile = this.getSelectedFile();
            var shownText = "";
            if (selectedFile) {
                shownText = selectedFile.name;
                this.displaySelectedFile(shownText);
            } else {
                this.displayNoSelection();
                this.view.getFileSelectionInput().getNative().value = null;
            }

            this.view.removeFileError();
            this.view.hideError();
        },

        getSelectedFile: function () {
            return this.view.getFileSelectionInput().getProperty('files')[0];
        },

        isValid: function () {
            var selectedFile = this.getSelectedFile();
            if (!selectedFile) {
                this.view.setFileError(Dictionary.get('inputs.file.requiredMessage'));
                this.view.showError();
                return false;
            }
        },


        _setInfo: function () {
            this.info = new Info({text: this.property.info, indentLevel: this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        createSelectionButton: function () {
            this.fileSelectionButton = new Button({
                caption: Dictionary.inputs.file.selectFileCaption
            });
            this.fileSelectionButton.attachTo(this.view.getFileSelectionButton());
            this.fileSelectionButton.addEventHandler("click", function () {
                this.view.getFileSelectionInput().trigger("click");
            }.bind(this));

            this.view.getFileName().addEventHandler("keydown", function (e) {
                // left arrow
                if (e.originalEvent.keyCode === 37) {
                    return true;
                }
                // right arrow
                else if (e.originalEvent.keyCode === 39) {
                    return true;
                } else {
                    e.preventDefault();
                }
            });

            this.view.getFileName().addEventHandler("click", function () {
                this.view.getFileSelectionButton().trigger("click");
            }.bind(this));
            this.view.getFileSelectionInput().addEventHandler("change", this.onFileSelectionEvent.bind(this));
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

        getValue: function (dataFiles) {
            var selectedFile = this.getSelectedFile();
            if (selectedFile) {
                dataFiles.push(selectedFile);
            }
            this.property.returnValue = this.view.getFileName().getText();
            return this.property.returnValue;
        }
    });
});