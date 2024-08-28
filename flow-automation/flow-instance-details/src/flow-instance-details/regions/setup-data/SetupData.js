define([
    'jscore/core',
    'jscore/ext/net',
    './SetupDataView',
    '../../widgets/panel/review-panel/UserTaskReviewPanel',
    'widgets/InlineMessage',
    '../../ext/utils/i18nTranslator',
    'flow-automation-lib/services/ErrorHandler',
    '../../ext/utils/UriInfo',
    'i18n!flow-instance-details/dictionary.json',
], function (core, net, View, UserTaskReviewPanel, InlineMessage, i18nTranslator, errorHandler, UriInfo, dictionary) {
    'use strict';

    function _attachElementsToForm(formElements, setupDataContent) {
        formElements.forEach(function (element) {
            element.attachTo(setupDataContent);
        });
    }

    function _detachElements(formElements) {
        if (formElements) {
            formElements.forEach(function (elem) {
                elem.destroy();
            });
        }
    }

    return core.Region.extend({

        view: new View(),

        init: function (options) {
            this.onlyLastExpanded = options.onlyLastExpanded === undefined ? false : options.onlyLastExpanded;
        },

        onViewReady: function () {
            this.view.getSetupDataButton().addEventHandler("click", function () {
                var event = 'expand';
                if (this.view.getButtonText() === dictionary.get("setupData.button.expandAll")) {
                    this.view.setButtonText(dictionary.get("setupData.button.collapseAll"));
                } else {
                    this.view.setButtonText(dictionary.get("setupData.button.expandAll"));
                    event = 'collapse';
                }

                this.formElements.forEach(function (element) {
                    element.accordionWidget.trigger(event);
                }.bind(this));
            }.bind(this));
        },

        onStart: function () {
            this._fetchSchemaWithDictionary();
        },

        _fetchSchemaWithDictionary: function () {
            net.ajax({
                url: '/flowautomation/v1/executions/flowinput-schema-data-dictionary',
                type: 'GET',
                dataType: 'json',
                data: "flow-id=" + UriInfo.getFlowId() + '&flow-version=' + UriInfo.getFlowVersion(),
                success: function (i18nResponse) {
                    this._fetchSchemaAndApplyDictionary(i18nResponse);
                }.bind(this),
                error: function (ignore) {
                    this._fetchSchemaAndApplyDictionary();
                }.bind(this)
            });
        },

        showEmptyFlowInputMessage: function () {
            if (this.inlineMsg) {
                this.inlineMsg.destroy();
            }
            this.inlineMsg = new InlineMessage({
                icon: 'infoMsgIndicator',
                header: dictionary.get("setupData.emptyMessage")
            });
            this.inlineMsg.attachTo(this.view.getSetupDataContent());
        },

        _fetchSchemaAndApplyDictionary: function (i18n) {
            net.ajax({
                url: '/flowautomation/v1/executions/' + UriInfo.getExecutionName() + '/flowinput-schema-data?flow-id=' + UriInfo.getFlowId(),
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    var schema = i18nTranslator.applyDictionary(response, i18n);
                    this.formElements = new UserTaskReviewPanel({
                        schemaForTask: schema,
                        onlyLastExpanded: this.onlyLastExpanded
                    }).widgetElements;

                    if (this.formElements.length === 0) {
                        this.view.hideButton();
                        this.showEmptyFlowInputMessage();
                    } else {
                        _attachElementsToForm(this.formElements, this.view.getSetupDataContent());
                        this.view.setButtonText(dictionary.get(this.onlyLastExpanded && this.formElements.length > 1 ? 'setupData.button.expandAll' : 'setupData.button.collapseAll'));
                    }
                }.bind(this),
                error: function (response, xhr) {
                    this.view.hideButton();
                    this.inlineMsg = errorHandler.errorMessageTranslator(this.inlineMsg, xhr.getResponseText());
                    if (this.inlineMsg) {
                        this.inlineMsg.attachTo(this.view.getSetupDataContent());
                    }
                }.bind(this)
            });
        },

        onStop: function () {
            if (this.inlineMsg) {
                this.inlineMsg.destroy();
            }
            _detachElements(this.formElements);
        },

        onHide: function () {
            this.onStop();
        }
    });
});