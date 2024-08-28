define([
    'jscore/core',
    'template!./_fileSelector.html',
    'styles!./_fileSelector.less',
    'i18n!flow-catalog/dictionary.json'
], function (core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function () {
            return template({
                strings: strings
            });
        },

        getStyle: function () {
            return styles;
        },


        getFileName: function () {
            return this.getElement().find('.eaFlowCatalog-wFileSelector-textBox-fileName');
        },

        getFileSelectionInput: function () {
            return this.getElement().find('.eaFlowCatalog-wFileSelector-fileSelectorInput');
        },

        getFileSelectorButton: function () {
            return this.getElement().find('.eaFlowCatalog-wFileSelector-button');
        },

        getAccordionError: function () {
            return this.getElement().find('.eaFlowCatalog-wFileSelector-statusError-accordion');
        },

        getFileNameErrorText: function () {
            return this.getElement().find('.eaFlowCatalog-wFileSelector-textBox-fileNameErrorText');
        },

        removeValidationError: function () {
            this.getFileSelectorButton().setStyle("border", "0");
            this.getFileNameErrorText().setModifier('error', 'false');
            this.getFileNameErrorText().setText('');
        },


        setValidationError: function (text) {
            this.getFileSelectorButton().setStyle("border", "thin solid #ff0000");
            this.getFileNameErrorText().setModifier('error', 'true');
            this.getFileNameErrorText().setText(text);
        }

    });
});


