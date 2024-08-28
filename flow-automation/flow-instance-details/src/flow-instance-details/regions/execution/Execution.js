define([
    'jscore/core',
    './ExecutionView',
    'container/api',
    '../../widgets/report-widgets/summary/Summary',
    '../../widgets/report-widgets/table/ReportTable',
    '../../widgets/report-widgets/fullTextArea/ReportText',
    '../../widgets/report-widgets/section/Section',
    'i18n!flow-instance-details/dictionary.json',
    'flow-automation-lib/services/CustomError',
    'flow-automation-lib/services/ErrorHandler',
    'jscore/ext/net',
    '../../ext/utils/UriInfo',
    'flow-automation-lib/helper/execution',
    '../../ext/utils/i18nTranslator'
], function (core, View, container, Summary, ReportTable, ReportText, Section, dictionary, CustomError,
             ErrorHandler, net, UriInfo, execution, i18nTranslator) {
    'use strict';

    return core.Region.extend({

        view: new View(),

        onViewReady: function () {
            this.widgets = {};
            this.sections = [];
            this.level = 1;
        },

        onStart: function () {
            this.idTables = 0;
            this.context = this.getContext();
            this.reportTables = [];
            this.isPolling = false;
            this.reportTableCount = 0;
// IDUN-2980 UI – Removing Action Library
//            HandlerSelectedAction.resetSelection();
//            HandlerSelectedAction.setEventBus(this.getEventBus());
//            this.actionFrwSubscriber = this.getEventBus().subscribe('FlowInstanceDetails:selectAction', HandlerSelectedAction.handler.bind(this));
            this.pollingSubscriber = this.getEventBus().subscribe('FlowInstanceDetails:adjustPolling', this.handlePolling.bind(this));
        },

        onStop: function () {
            this.reportTableCount = 0;
            this.isPolling = false;
            this.reportTables = [];
            this.stopReportPolling();
            for (var section in this.sections) {
                this.sections[section].destroy();
            }
// IDUN-2980 UI – Removing Action Library
//            this.getEventBus().unsubscribe('FlowInstanceDetails:selectAction', this.actionFrwSubscriber);
            this.getEventBus().unsubscribe('FlowInstanceDetails:adjustPolling', this.pollingSubscriber);
        },

        setNoReportInline: function (text, icon) {
            this.inlineMsg = ErrorHandler.reportInlineErrorMessage(text, icon);
            this.inlineMsg.attachTo(this.view.getElement());
        },

        // --------------------- private ---------------------

        _startBuildingWidgets: function (response) {
            var height = this.context.topSection.getElement().getNative().scrollTop;

            for (var section in this.sections) {
                this.sections[section].destroy();
            }

            if (this.inlineMsg) {
                this.inlineMsg.destroy();
            }
            this.sections = [];
            var reportAreas = this.schema.properties.body.properties;
            this._buildReportWidgets(reportAreas, response.body, null);

            if (execution.isInFinalState(response.header.status)) {
                this.stopReportPolling();
            }

            this.context.topSection.getElement().getNative().scrollTop = height;  // Workaround For TORF-369349 - Firfox scroll issue
        },

        _buildReportWidgets: function (schema, payload, section, parentSection) {
            var dataNeededForWidget = {};
            var data = payload;
            for (var schemaSection in schema) {
                if (this._isANewSection(schema, schemaSection)) {
                    var sectionData = {header: schema[schemaSection], level: this.level, shortInfo: schema[schemaSection].description};
                    parentSection = section;
                    var childSection = new Section(sectionData);
                    this.sections.push(childSection);
                    this.level++;
                    this._buildReportWidgets(schema[schemaSection].properties, data[schemaSection], childSection, parentSection);
                    this.level--;
                    parentSection = null;
                    continue;
                }
                this._buildDataForWidget(dataNeededForWidget, schema, schemaSection, data, section);
                this._buildIndividualWidget(schema, schemaSection, section, dataNeededForWidget);
                section = this._attachWidgetToSection(section, schema, schemaSection);
            }
            this._attachWidgetsToParentSection(parentSection, section);
            this.widgets = [];
        },

        _attachWidgetsToParentSection: function (parentSection, section) {
            if (!parentSection && section) {
                section.attachTo(this.view.getElement());
            } else if (section) {
                section.attachTo(parentSection.getContents());
            }
        },

        _buildDataForWidget: function (dataNeededForWidget, schema, schemaSection, data, section) {
            dataNeededForWidget.headerless = !section || section.header === '';
            dataNeededForWidget.schema = schema[schemaSection];
            dataNeededForWidget.data = data[schemaSection];
            dataNeededForWidget.level = this.level;
            dataNeededForWidget.shortInfo = schema[schemaSection].description;
        },

        _buildIndividualWidget: function (schema, schemaSection, section, dataNeededForWidget) {
            if (!section) {
                dataNeededForWidget.level = this.level + 1;
            }
            dataNeededForWidget.context = this.context;
            if (schema[schemaSection].format === 'summary') {
                this.widgets[schemaSection] = new Summary(dataNeededForWidget);
            } else if (schema[schemaSection].items) {
                dataNeededForWidget.counter = ++this.reportTableCount;
                if (!this.isPolling) {
                    dataNeededForWidget.idTable = ++this.idTables;
                    var newReportTable = new ReportTable(dataNeededForWidget);
                    this.widgets[schemaSection] = newReportTable;
                    this.reportTables.push(newReportTable);
                }

                var reportTable = this.reportTables.find(function (rt) {
                    return rt.counter === dataNeededForWidget.counter;
                });

                if (reportTable) {
                    reportTable.refreshReportTableOnPolling(dataNeededForWidget.data);
                    this.widgets[schemaSection] = reportTable;
                }

            } else {
                this.widgets[schemaSection] = new ReportText(dataNeededForWidget);
            }
        },

        _attachWidgetToSection: function (section, schema, schemaSection) {
            if (!section) {
                this._createSectionAndAttachWidgets(schema, schemaSection, section);
                section = null;
            } else {
                this._attachWidgetsToTopSection(section);
                this.widgets = [];
            }
            return section;
        },

        _createSectionAndAttachWidgets: function (schema, schemaSection, section) {
            var sectionData = {
                header: schema[schemaSection],
                level: this.level,
                shortInfo: schema[schemaSection].description
            };
            section = new Section(sectionData);
            this.sections.push(section);
            this._attachWidgetsToTopSection(section);
            section.attachTo(this.view.getElement());
            this.widgets = [];
            return section;
        },

        _attachWidgetsToTopSection: function (section) {
            section.attachWidgets(this.widgets);
        },

        _isANewSection: function (schema, name) {
            var allSimple = true;
            if (schema[name].type === 'object') {
                for (var object in schema[name].properties) {
                    if (schema[name].properties[object].type === 'object' || schema[name].properties[object].type === 'array') {
                        allSimple = false;
                        break;
                    }
                }
            }
            return schema[name].properties && !allSimple && !schema[name].items;
        },

        /**
         * UTILITY METHODS FOR POLLING
         */
        _setUpPolling: function () {
            this.refreshAll = setInterval(function () {
                this.isPolling = true;
                this.reportTableCount = 0;
                this._fetchReport();
            }.bind(this), 10000);
        },

        stopReportPolling: function () {
            this.reportTableCount = 0;
            clearInterval(this.refreshAll);
            this.refreshAll = null;
        },

        handlePolling: function (event) {
            if (event.fetchReport) { // final state of execution so only fetch it
                this._fetchSchemaWithDictionary();
                if (this.refreshAll) {
                    this.stopReportPolling();
                }
            } else if (event.pollReport) { // poll report
                this._fetchSchemaWithDictionary();
                if (!this.refreshAll) {
                    this._setUpPolling();
                }
            } else {
                if (this.refreshAll) {
                    this.stopReportPolling();
                }
            }
        },

        // --------------------- server request ---------------------
        _fetchSchemaWithDictionary: function () {
            net.ajax({
                url: '/flowautomation/v1/executions/report-dictionary',
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

        _fetchSchemaAndApplyDictionary: function (i18n) {
            net.ajax({
                url: '/flowautomation/v1/executions/' + UriInfo.getExecutionName() + '/report-schema',
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                data: "flow-id=" + UriInfo.getFlowId(),
                success: function (schema) {
                    this.schema = i18nTranslator.applyDictionary(schema, i18n);
                    this._fetchReport();
                }.bind(this),
                error: this._schemaError.bind(this)
            });
        },

        _fetchReport: function () {
            net.ajax({
                url: '/flowautomation/v1/executions/' + UriInfo.getExecutionName() + '/report',
                type: 'GET',
                dataType: 'json',
                data: "flow-id=" + UriInfo.getFlowId(),
                success: this._startBuildingWidgets.bind(this),
                error: this._schemaError.bind(this)
            });
        },

        _schemaError: function (response, unhandledServerError) {
            CustomError.reportErrorHandling(unhandledServerError, this);
        }
    });
});