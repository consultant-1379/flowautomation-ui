/*global define*/
define([
    'jscore/core',
    '../utils/net',
    'widgets/Dialog',
    'flow-automation-lib/services/CustomError',
    'i18n!flow-automation-lib/dictionary.json',
    'flow-automation-lib/helper/Loader'
], function (core, net, Dialog, CustomError, dictionary, Loader) {
    'use strict';

    var baseUrl = '/flowautomation/v1/';
    return {

        createExecution: function (executionName, flowId) {
            return net.ajax({
                url: baseUrl + "flows/" + flowId + "/execute",
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: executionName
                })
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                Loader.show();
                throw CustomError.userTasksErrorHandling(response);
            });
        },

        deleteExecution: function (executionName, flowId) {
            return net.ajax({
                url: baseUrl + "executions/" + executionName + "?flow-id=" + flowId,
                type: 'DELETE',
                dataType: 'json'
            }).then(function (response) {
                return response.data;
            }).catch(function (response) {
                Loader.show();
                throw CustomError.userTasksErrorHandling(response);
            });
        },
        download: function (executionName, resource, flowId) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', baseUrl + 'executions/' + executionName + '/download/' + resource + '?flow-id=' + flowId);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                if (xhr.status !== 200) {
                    var errorCode = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(xhr.response))).errors[0].code;
                    var downloadFailedDialog = new Dialog({
                        type: 'error',
                        header: dictionary.get('resources.notAvailable'),
                        content: dictionary.errorCodes[errorCode],
                        buttons: [{
                            caption: dictionary.get('resources.buttons.ok'),
                            action: function () {
                                downloadFailedDialog.hide();
                            },
                            color: 'darkBlue'
                        }]
                    });
                    downloadFailedDialog.show();
                } else {
                    var filename = "";
                    var disposition = xhr.getResponseHeader('Content-Disposition');
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches !== null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                    }
                    var type = xhr.getResponseHeader('Content-Type');
                    var blob = new Blob([xhr.response], {type: type});
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }.bind(this);
            xhr.send();
        }
    };
});