define([
    'jscore/core',
    'jscore/ext/net',
    './FlowImportView',
    'i18n!flow-catalog/dictionary.json',
    'flow-automation-lib/services/CustomError',
    'container/api',
    '../fileselector/FileSelector'
], function (core, net, View, dictionary, CustomError, container, FileSelector) {
    return core.Widget.extend({

        view: function () {
            return new View({
                flowPackage: dictionary.import.flowPackage,
                selectFile: dictionary.import.selectFile
            });
        },

        init: function (options) {
            this.options = options;
        },

        onViewReady: function () {
            this.fileSelector = new FileSelector(this.options);
            this.fileSelector.attachTo(this.view.getImportFileInput());
        },

        submitForm: function (dialog) {
            if (!this.fileSelector.isValid()) {
                return false;
            }

            this.dialog = dialog;
            container.getEventBus().publish('container:loader');

            var file = this.fileSelector.getSelectedFile();
            var formData = new FormData();
            formData.append('flow-package', file);

            net.ajax({
                url: '/flowautomation/v1/flows',
                type: 'POST',
                contentType: false,
                processData: false,
                data: formData,
                success: this.importFlowSuccess.bind(this),
                error: this.importFlowError.bind(this)
            });
            return true;
        },

        importFlowSuccess: function (message) {
            this.dialog.destroy();
            container.getEventBus().publish('container:loader-hide');
            this.trigger('flowimport:success', message);
        },

        importFlowError: function (error, response) {
            this.fileSelector.checkImportError(response, this.dialog);
            container.getEventBus().publish('container:loader-hide');
            if ((!CustomError.isValidJson(response.getResponseText())) || (!CustomError.isInLineError(response))) {
                this.dialog.hide();
            }
        }
    });
});