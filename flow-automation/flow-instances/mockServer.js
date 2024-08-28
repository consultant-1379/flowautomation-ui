var tags = ['Sunday Updates', 'Node 3', 'Autocut', 'BTS', 'Tuesday Updates', 'Tough', 'Fire alarm', 'Physical', 'Tuesday', 'recovery', 'All', 'no shutdown']

var flows = require("../flow-instances/test/resources/flows").flows;
var instances = require("../flow-instances/test/resources/instances").instances;
var schema = require("../flow-instances/test/resources/schema").schema;
var usertasks = require("../flow-instances/test/resources/usertasks").usertasks;
var reportSchema = require("../flow-instances/test/resources/reportSchema").schema;
var reportResponse = require("../flow-instances/test/resources/reportResponce").reportResponse;
var nodes = require("../flow-instances/test/resources/treeNodes").nodes;
var setupData = require("../flow-instances/test/resources/setupData").setupData;
var events = require("../flow-instances/test/resources/events").events;

var fs = require('fs');

module.exports = function (app) {
    this.num = 0;
    this.reportIncrement = 0;

    var currentUserTaskStep = 1;
    var counter = 1;
    var i18nCounter = 1;

    app.get('/flowautomation/v1/executions/:flowName/events', function (req, res) {
        res.set('Content-Type', 'application/json');
        var flowId = req.query["flow-id"];
        var from = req.query["from"];
        var to = req.query["to"];
        var flowName = req.params.flowName;

        if (flowName === "0taski" && flowId === "com.ericsson.oss.fa.flows.collectPMCounters") {
            var data = events[flowName];
            var records = data.records.slice(from, Math.min(to, data.records.length));
            var response = {"numberOfRecords": data.numberOfRecords, "records": records};
            res.status(200).send(response);
        } else {
            res.status(200).send("{\"numberOfRecords\":0,\"records\":[]}");
        }
    });

    app.get('/flowautomation/v1/executions/:flow/flowinput-schema-data', function (req, res) {
        res.status(200).send(setupData);
    });

    app.get('/flowautomation/v1/executions/:mock/usertasks', function (req, res) {
        res.set('Content-Type', 'application/json');
        var flowId = req.query["flow-id"];

        if (flowId === 'com.ericsson.oss.fa.flows.usertaskShowcase.i18n') {
            if (i18nCounter > 3) {
                i18nCounter = 1;
            }
            return res.send(JSON.stringify(usertasks["i18n-" + i18nCounter]));
        }

        if (flowId === 'com.ericsson.oss.fa.flows.fillNodeData' || flowId === 'com.ericsson.oss.fa.flows.errorHandling') {
            res.send(JSON.stringify([])); // without usertask
        } else {
            if (req.params.mock === "mock-more-user-tasks") {
                res.send(JSON.stringify(usertasks[req.params.mock]));
                counter = 1;
                return;
            }
            if (currentUserTaskStep === 3) {
                var i = 0;
                do {
                    i++;
                } while (i < 100000000);
            } else if (currentUserTaskStep > 14) {
                currentUserTaskStep = 1;
                counter = 1;
            }
            res.send(JSON.stringify(usertasks["step" + currentUserTaskStep]));
        }
    });

    app.head('/flowautomation/authorize', function (req, res) {
        res.status(200).send();
    });

    app.get('/flowautomation/v1/flows/:flowId/user-permissions', function (req, res) {
        res.status(200).send(JSON.stringify({
            "execute": {
                "strategy": "warn",
                "permission": false
            }
        }));
    });

    app.post('/flowautomation/v1/executions/usertasks/:taskId/complete', function (req, res) {

        if (req.params.taskId === ("i18n-" + i18nCounter)) {
            i18nCounter++;
            res.status(204).send("{}");
            return;
        }

        if (currentUserTaskStep === 1 && counter === 1) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Please upload the flow input file to complete the task",
                "errors": [{"code": "flow-execution-2106", "errorMessage": "Invalid flow input"}]
            }));
            counter++;
        } else if (currentUserTaskStep === 1 && counter === 2) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Json processing error when parsing json.",
                "errors": [{"code": "flow-execution-2141", "errorMessage": "Json processing error"}]
            }));
            counter++;
        } else if (currentUserTaskStep === 1 && counter === 3) {
            res.status(500).send(JSON.stringify({
                    "status": 500,
                    "reasonPhrase": "Internal Server Error",
                    "errorDetail": "The value should be between 100-200",
                    "errors": [
                        {
                            "code": "error.fa.usertask.input.invalid",
                            "errorMessage": "The value should be between 100-200"
                        }
                    ]
                }
            ));
            counter++;
        } else {
            counter = 4;
            currentUserTaskStep++;
            res.status(204).send("{}");
        }
    });

    app.delete('/flowautomation/v1/executions/mock-setup', function (req, res) {
        res.status(200).send({"errorCode": 0, "statusMessage": "OK"});
    });

    app.get('/flowautomation/v1/executions/', function (req, res) {
        res.set('Content-Type', 'application/json');
        var flowId = req.query["flow-id"];
        var user = req.query["filter-by-user"];
        var flowExecutionName = req.query["flow-execution-name"];

        var returnedInstances = [];
        if (flowId === 'com.ericsson.oss.fa.flows.fillNodeData2') {
            flowId = 'com.ericsson.oss.fa.flows.fillNodeData'
        }
        if (flowId) {
            if (flowExecutionName) {
                for (var key in instances[flowId]) {
                    if (flowExecutionName === instances[flowId][key].name) {
                        returnedInstances.push(instances[flowId][key]);
                    }
                }
            } else {
                returnedInstances = instances[flowId];
            }
            if (!returnedInstances) {
                returnedInstances = [];
            }
        } else {
            for (var key in instances) {
                for (var key2 in instances[key]) {
                    returnedInstances.push(instances[key][key2]);
                }
            }
        }
        for (var key in returnedInstances) {
            returnedInstances[key].summaryReport = (this.num++)
        }
        if (user === 'true') {
            var userSpecific = []
            for (var instance in returnedInstances) {
                if (returnedInstances[instance].executedBy === 'User 1') {
                    userSpecific.push(returnedInstances[instance])
                }
            }
            returnedInstances = userSpecific;
        }
        res.send(JSON.stringify(returnedInstances));
    });

    app.get('/flowautomation/v1/executions/usertasks/:taskId/dictionary', function (req, res) {
        var taskId = req.params.taskId;
        try {
            res.send(require("../flow-instances/test/resources/locale/user-task/" + taskId + ".json"));
        } catch (ignore) {
            res.send([]);
        }
    });

    app.get('/flowautomation/v1/executions/flowinput-schema-data-dictionary', function (req, res) {
        var flowId = req.query["flow-id"];
        var flowVersion = req.query["flow-version"];
        if (flowId === 'com.ericsson.oss.fa.flows.usertaskShowcase.i18n' && flowVersion === '1.0.6') {
            try {
                res.send(require("../flow-instances/test/resources/locale/report/setup.json"));
            } catch (ignore) {
                res.send([]);
            }
        } else {
            res.send([]);
        }
    });


    app.get('/flowautomation/v1/executions/report-dictionary', function (req, res) {
        var flowId = req.query["flow-id"];
        var flowVersion = req.query["flow-version"];
        if (flowId === 'com.ericsson.oss.fa.flows.usertaskShowcase.i18n' && flowVersion === '1.0.6') {
            try {
                res.send(require("../flow-instances/test/resources/locale/report/execution.json"));
            } catch (ignore) {
                res.send([]);
            }
        } else {
            res.send([]);
        }
    });

    app.get('/flowautomation/v1/flows', function (req, res) {
        res.set('Content-Type', 'application/json');
        var returnedFlows = [];
        flows.forEach(function (flow) {
            returnedFlows.push(flow);
        });
        res.send(JSON.stringify(returnedFlows));
    });

    app.get('/flowautomation/v1/executions/:flowExecutionName/report-schema', function (req, res) {
        res.set('Content-Type', 'application/json');

        var flowId = req.query["flow-id"];
        if (flowId === 'com.ericsson.oss.fa.flows.usertaskShowcase.i18n') {
            try {
                res.send(require("../flow-instances/test/resources/locale/report/schema.json"));
            } catch (ignore) {
                res.send([]);
            }
        } else {
            res.send(JSON.stringify(reportSchema));
        }
    });

    app.get('/flowautomation/v1/executions/:flowExecutionName/report', function (req, res) {
        res.set('Content-Type', 'application/json');
        var flowId = req.query["flow-id"];
        if (flowId === 'com.ericsson.oss.fa.flows.usertaskShowcase.i18n') {
            try {
                res.send(require("../flow-instances/test/resources/locale/report/report.json"));
            } catch (ignore) {
                res.send([]);
            }
        } else if (flowId === 'com.ericsson.oss.fa.flows.fillNodeData' || flowId === 'com.ericsson.oss.fa.flows.errorHandling') {
            res.status(404).send({}); // without report
        } else if (flowId === 'com.ericsson.oss.fa.flows.fillNodeData2') {
            res.status(500).send(JSON.stringify({
                "status": 500,
                "reasonPhrase": "[object has missing required properties ([\"numberOfNodes\"])] ",
                "errorDetail": "",
                "errors": [{"code": "flow-execution-2142", "errorMessage": "Json validation failed"}]
            }));
        } else {
            res.send(JSON.stringify(reportResponse));
        }
    });

    app.post('/flowautomation/v1/flows', function (req, res) {
        res.set('Content-Type', 'application/json');
        var returnedFlows = [];
        var fileName = req.files['flow-package'].originalname;
        var errorFlowPackage500 = 'SystemErrorInvalidJsonInResponse.zip';
        var errorFlowPackage2 = 'SystemErrorFlow.zip';
        var errorFlowPackage2003 = 'InlineErrorFlow.zip';
        var errorFlowPackage2001 = 'EmptyZip.zip';
        var errorFlowPackage2002 = 'FailedToValidate.zip';
        var errorFlowPackage2004 = 'UnexpectedParsingErrorFlow.zip';
        var errorFlowPackage2005 = 'DeploymentFailed.zip';
        var errorFlowPackage2006 = 'InvalidVersionSyntax.zip';
        var errorFlowPackage2007 = 'FlowVersionNotAllowed.zip';
        var errorFlowPackage2008 = 'ParsingFlowError.zip';
        var errorFlowPackage2009 = 'InvalidFlowDefJson.zip';
        var errorFlowPackage2010 = 'InvalidFlowPkgStructure.zip';
        var errorFlowPackage2011 = 'MissingExecutePhase.zip';
        var errorFlowPackageUnauthorized = 'UnauthorizedFlow.zip';

        if (errorFlowPackage2003 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Bad Request",
                "errors": [{
                    "code": "flow-2003",
                    "errorMessage": "flow-definition.json file is missing in the flow package"
                }]
            }));
        } else if (errorFlowPackage2 === fileName) {
            res.status(500).send({});
        } else if (errorFlowPackage500 === fileName) {
            res.status(500).send("org.camunda.bpm.model.xml.ModelParseException: SAXException while parsing input stream");
        } else if (errorFlowPackage2001 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Bad Request",
                "errors": [{
                    "code": "flow-2001",
                    "errorMessage": "Either the flow package is not a valid zip format or it's an empty zip"
                }]
            }));
        } else if (errorFlowPackage2002 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Bad Request",
                "errors": [{
                    "code": "flow-2002",
                    "errorMessage": "Failed to validate the zip content. Invalid flow package"
                }]
            }));
        } else if (errorFlowPackage2004 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Unexpected error while parsing the flow-definition.json file",
                "errors": [{
                    "code": "flow-2004",
                    "errorMessage": "Unexpected error while parsing the flow-definition.json file"
                }]
            }));
        } else if (errorFlowPackage2005 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Deployment failed",
                "errors": [{"code": "flow-2005", "errorMessage": "Deployment failed"}]
            }));
        } else if (errorFlowPackage2006 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "InvalidFlow version",
                "errors": [{"code": "flow-2006", "errorMessage": "Invalid Flow version syntax"}]
            }));
        } else if (errorFlowPackage2007 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Flow version not allowed",
                "errors": [{"code": "flow-2007", "errorMessage": "Flow version is not allowed"}]
            }));
        } else if (errorFlowPackage2008 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Error Parsing resource",
                "errors": [{"code": "flow-2008", "errorMessage": "Unexpected error while parsing the flow resource"}]
            }));
        } else if (errorFlowPackage2009 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Invalid Flow Definition",
                "errors": [{"code": "flow-2009", "errorMessage": "Invalid flow-definition.json file"}]
            }));
        } else if (errorFlowPackage2010 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Invalid flow package structure",
                "errors": [{"code": "flow-2010", "errorMessage": "Invalid flow package structure"}]
            }));
        } else if (errorFlowPackage2011 === fileName) {
            res.status(400).send(JSON.stringify({
                "status": 400,
                "reasonPhrase": "Execution Phase missing",
                "errors": [{"code": "flow-2011", "errorMessage": "Execution phase missing in flow package"}]
            }));
        } else if (errorFlowPackageUnauthorized === fileName) {
            res.status(401).send(JSON.stringify({
                "status": 401,
                "reasonPhrase": "Unauthorized",
                "errors": [{
                    "code": "flow-0001",
                    "errorMessage": "The user doesn't have the required capibility/role to perform the requested action."
                }]
            }));
        } else {
            flows.forEach(function (flow) {
                returnedFlows.push(flow);
            });
            res.send(JSON.stringify(JSON.stringify(req.body)));
        }
    });

    function getFlowSummary(flow) {
        app.get('/flowautomation/v1/flows/:flowId', function (req, res) {
            res.set('Content-Type', 'application/json');
            var flowIndex;
            for (var i in flows) {
                if (flows[i].id == req.params.flowId) {
                    flowIndex = i;
                    break;
                }
            }
            console.log('Summary flow index = ' + flowIndex);
            res.send(JSON.stringify(flows[flowIndex]));
        });
    }

    // register all rest endpoints foreach flow
    flows.forEach(function (flow) {
        getFlowSummary(flow);
    });

    app.put('/flowautomation/v1/flows/:flowId/enable', function (req, res) {
        console.log('flow Id = ' + req.params.flowId);
        console.log('flow enable status = ' + req.body.value);
        var statusIndex = -1;
        for (var i in flows) {
            if (flows[i].id == req.params.flowId) {
                flows[i].enabled = req.body.value;
                statusIndex = i;
                break;
            }
        }
        res.send(flows[statusIndex]);
    });

    app.put('/flowautomation/v1/executions/:flowExecutionName/stop', function (req, res) {
        var flowId = req.query["flow-id"];
        var flowExecutionName = req.params.flowExecutionName;
        if (!flowExecutionName || !flowId) {
            res.status(500).send(JSON.stringify({
                "status": 500,
                "reasonPhrase": "The request to stop flow instance is not valid.",
                "errorDetail": "",
                "errors": [
                    {
                        "code": "flow-execution-2102",
                        "errorMessage": "The request to stop flow instance is not valid."
                    }
                ]
            }));
            return;
        }
        var flowInstance = instances[flowId];
        if (flowInstance) {
            for (var index in flowInstance) {
                if (flowInstance[index]['flowId'] === flowId && flowInstance[index]['name'] === flowExecutionName) {
                    flowInstance[index]['state'] = 'Stopped';
                    res.status(204).send("{}");
                    return;
                }
            }
        }
        res.status(500).send("{}");
    });

    app.post('/flowautomation/v1/flows/:flowId/execute', function (req, res) {
        console.log('flow Id = ' + req.params.flowId);
        console.log('flow name = ' + req.body.name);
        console.log('flow desc = ' + req.body.description);

        var headers = req.headers;
        var instanceName = req.body.name;
        var errorInstanceName1 = "InlineError";
        var errorInstanceName2 = "SystemError";
        var errorInstanceName3 = "notAllowed";
        var errorInstanceName4 = "generic";

        if (req.params.flowId === 'com.ericsson.oss.fa.flows.autoSoftwareRollout' && instanceName === 'Fill data for 100 nodes-1' && headers["checkuserflowexecutionpermission"] === "true") {
            return res.status(403).send({
                "status": 403,
                "reasonPhrase": "The flow has declared set of capabilities needed by the user to successfully execute it",
                "errorDetail": "",
                "errors": [{
                    "code": "flow-execution-2181",
                    "errorMessage": "User does not have required capabilities to execute this flow"
                }]
            });
        }

        if (errorInstanceName1 === instanceName) {
            res.status(409).send(JSON.stringify({
                "status": 409,
                "reasonPhrase": "Flow Execution name : InlineError already exists for the Flow with id : com.ericsson.oss.fa.flows.23102018.1300",
                "errors": [{"code": "flow-execution-2101", "errorMessage": "The flow instance name is already in use."}]
            }));
        } else if (errorInstanceName3 === instanceName) {
            res.status(409).send(JSON.stringify({
                "status": 409,
                "reasonPhrase": "You are not allowed to perform this operation on flow id: com.ericsson.oss.fa.internal.flows.houseKeeping",
                "errorDetail": "",
                "errors": [
                    {
                        "code": "flow-execution-2117",
                        "errorMessage": "Operation not allowed."
                    }
                ]
            }));
        } else if (errorInstanceName4 === instanceName) {
            res.status(409).send(JSON.stringify({
                "status": 409,
                "reasonPhrase": "You are not allowed to perform this operation on flow id: com.ericsson.oss.fa.internal.flows.houseKeeping",
                "errorDetail": "",
                "errors": [
                    {
                        "code": "UNKNOWN-CODE",
                        "errorMessage": "Operation not allowed."
                    }
                ]
            }));
        } else if (errorInstanceName2 === instanceName) {
            res.status(500).send({});
        } else {
            res.send(JSON.stringify(req.body));
        }
        var successResponse = {
            "code": 200,
            "description": "success",
            "data": [{name: "mock-setup"}]
        };
        currentUserTaskStep = 1;
        res.send(JSON.stringify(successResponse));
    });

    app.delete('/flowautomation/v1/flows/:flowId/delete', function (req, res) {
        console.log('flow Id = ' + req.params.flowId);
        var deleteFlowIndex;

        for (var i in flows) {
            if (flows[i]['id'] == req.params.flowId) {
                deleteFlowIndex = i;
                break;
            }
        }

        flows.splice(deleteFlowIndex, 1);
        res.end();
    });

    app.get('/flowautomation/v1/executions/usertasks/:id/schema', function (req, res) {
        res.send(JSON.stringify(schema[req.params.id]));
    });

    // --- Access Control --- //
    app.get('/oss/uiaccesscontrol/resources/parametermanagement/actions', function (req, res) {
        //res.status(200).send("{\"resource\":\"parametermanagement\",\"actions\":[\"execute\"]}");
        res.status(200).send("{\"resource\":\"parametermanagement\",\"actions\":[\"execute\",\"update\"]}");
        //res.status(404).send("{}");

    });

    app.get('/oss/uiaccesscontrol/resources/searchExecutor/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"searchExecutor\",\"actions\":[\"read\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/persistentobjectservice/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"persistentobjectservice\",\"actions\":[\"read\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/topologySearchService/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"topologySearchService\",\"actions\":[\"read\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/topologyCollectionsService/actions', function (req, res) {
            res.status(200).send("{\"resource\":\"topologyCollectionsService\",\"actions\":[\"read\"]}");
        });

    app.get('/oss/uiaccesscontrol/resources/Collections_Public/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"Collections_Public\",\"actions\":[\"create\",\"delete\",\"read\",\"update\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/Collections_Private/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"Collections_Private\",\"actions\":[\"create\",\"delete\",\"read\",\"update\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/CollectionsOthers_Public/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"CollectionsOthers_Public\",\"actions\":[\"create\",\"delete\",\"read\",\"update\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/CollectionsOthers_Private/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"CollectionsOthers_Private\",\"actions\":[\"create\",\"delete\",\"read\",\"update\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/SavedSearch_Public/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"SavedSearch_Public\",\"actions\":[\"read\",\"update\",\"delete\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/SavedSearch_Private/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"SavedSearch_Private\",\"actions\":[\"read\",\"update\",\"delete\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/SavedSearchOthers_Public/actions', function (req, res) {
        res.status(200).send("{\"resource\":\"SavedSearchOthers_Public\",\"actions\":[\"read\",\"update\",\"delete\"]}");
    });

    app.get('/oss/uiaccesscontrol/resources/SavedSearchOthers_Private/actions', function (req, res) {
            res.status(200).send("{\"resource\":\"SavedSearchOthers_Private\",\"actions\":[\"read\",\"update\",\"delete\"]}");
        });

    // --- Scoping Panel end-points --- //

    app.get('/persistentObject/network/-1', function (req, res) {
        res.status(200).send({
            "treeNodes": []
        })
    });

    app.get('/oss/uiaccesscontrol/resources', function (req, res) {
        res.status(200).send([{"resource":"link_management","actions":["read","create","update","delete","query"]},{"resource":"SavedSearch_Private","actions":["create","delete","read","update"]},{"resource":"scripting_cli_access_m2m","actions":["execute"]},{"resource":"modelInformationService","actions":["read"]},{"resource":"parametermanagement","actions":["execute","update"]},{"resource":"file-lookup-service","actions":["read"]},{"resource":"sls-credentialmanagement","actions":["delete"]},{"resource":"scripting_anonymizer","actions":["execute"]},{"resource":"nbi_fm_snmp_subscribe","actions":["read","execute"]},{"resource":"sso","actions":["execute","read"]},{"resource":"reparent-service-nbi","actions":["read"]},{"resource":"dhcp_service","actions":["read","create","update","delete","execute"]},{"resource":"acom_configure_use_case","actions":["read"]},{"resource":"healthcheck","actions":["execute"]},{"resource":"acom_toggle_use_case","actions":["read"]},{"resource":"ulsa","actions":["read","execute"]},{"resource":"amos_em_m2m","actions":["read","create","patch","execute"]},{"resource":"dhcp_cli","actions":["execute"]},{"resource":"bo-report-operator-access","actions":["read"]},{"resource":"bo-universe-access","actions":["read"]},{"resource":"topologySearchService","actions":["read"]},{"resource":"https","actions":["execute","read"]},{"resource":"nodecmd_usertype_admin","actions":["create","delete"]},{"resource":"alarm_overview","actions":["query"]},{"resource":"read_profiles","actions":["read"]},{"resource":"node_healthcheck","actions":["execute","create","read","update","delete","query"]},{"resource":"nested_collection","actions":["read","create","delete","update"]},{"resource":"adaptation_fm_nb_integration","actions":["execute"]},{"resource":"AIM","actions":["read","update"]},{"resource":"gim_ecim_user_mgmt","actions":["read","create","update","delete"]},{"resource":"fm_services","actions":["read","query","update","execute"]},{"resource":"cppinventorysynch_service","actions":["create","execute","delete","update"]},{"resource":"adaptation_cm_nb_integration","actions":["execute"]},{"resource":"nodecmd_usertype_operator","actions":["create","read","execute","update"]},{"resource":"ap","actions":["patch","read","execute"]},{"resource":"sis_remove_task","actions":["read"]},{"resource":"SavedSearchOthers_Private","actions":["read","update","delete"]},{"resource":"cm_editor","actions":["read","create","execute","update","delete"]},{"resource":"update_algorithms","actions":["update"]},{"resource":"security_enrollment_download","actions":["execute"]},{"resource":"cm_bulk_rest_nbi","actions":["read","create","delete","execute"]},{"resource":"ipsec","actions":["read","execute","delete"]},{"resource":"adaptation_inventorysynch","actions":["execute"]},{"resource":"ftpes","actions":["execute","read"]},{"resource":"target_group_mgmt","actions":["read","create","patch","delete","query"]},{"resource":"snmpv3","actions":["read","create","update"]},{"resource":"sdg_reset_database","actions":["read"]},{"resource":"logViewer_secpri","actions":["read"]},{"resource":"logViewer_access","actions":["read"]},{"resource":"fcm_base_counter","actions":["read","query"]},{"resource":"sis_schedule_task","actions":["read"]},{"resource":"netan-server-admin-access","actions":["read"]},{"resource":"subscription","actions":["create","update","delete","read","execute"]},{"resource":"cm_config_rest_nbi","actions":["read","create","update","execute","delete"]},{"resource":"node_version_support","actions":["execute","delete","read"]},{"resource":"sis_manage_instances","actions":["read"]},{"resource":"sis_set_mysql","actions":["read"]},{"resource":"capability","actions":["read"]},{"resource":"SavedSearch_Public","actions":["create","delete","read","update"]},{"resource":"logViewer_security","actions":["read"]},{"resource":"target_handlers_manager","actions":["query"]},{"resource":"ciphers","actions":["update","read"]},{"resource":"fmxModuleManagement","actions":["execute","create","delete","update","read","query"]},{"resource":"adaptation_launch_help","actions":["execute"]},{"resource":"sis_set_shared_data_path","actions":["read"]},{"resource":"neconnection_credentials_secureuser","actions":["read"]},{"resource":"nodecli_usertype_view","actions":["execute"]},{"resource":"persistentobjectservice","actions":["read","update"]},{"resource":"cell-management-gui-cell-state","actions":["update"]},{"resource":"adaptation_installer","actions":["execute"]},{"resource":"CollectionsOthers_Private","actions":["read","update","delete"]},{"resource":"fcm_ebs_flex_filter","actions":["read","query"]},{"resource":"winfiol_enm","actions":["execute"]},{"resource":"topologyCollectionsService","actions":["create","delete","read"]},{"resource":"networkviewer","actions":["update","read"]},{"resource":"sdg_configure_flavor","actions":["read"]},{"resource":"laad","actions":["read","execute","delete"]},{"resource":"ntp","actions":["read","create","delete"]},{"resource":"logViewer_audit","actions":["read"]},{"resource":"acom_user","actions":["read"]},{"resource":"acom_manage_instances","actions":["read"]},{"resource":"netan-business-author-access","actions":["read"]},{"resource":"extCA_mgmt","actions":["create","update","delete"]},{"resource":"neconnection_credentials_normaluser","actions":["read"]},{"resource":"sdg_stop_task","actions":["read"]},{"resource":"credm","actions":["read","execute"]},{"resource":"adaptation_healthcheck","actions":["execute"]},{"resource":"profile_mgmt","actions":["create","update","delete"]},{"resource":"sas_start_use_case","actions":["read"]},{"resource":"sdg_set_mysql","actions":["read"]},{"resource":"adaptation_element_manager","actions":["execute"]},{"resource":"node_healthcheck_mm_report","actions":["create","read","delete"]},{"resource":"asr","actions":["read","update","execute"]},{"resource":"Collections_Private","actions":["create","delete","read","update"]},{"resource":"kpi_service","actions":["read"]},{"resource":"sdg_toggle_flavor","actions":["read"]},{"resource":"sdg_start_task","actions":["read"]},{"resource":"sas_manage_instances","actions":["read"]},{"resource":"read_caEntities","actions":["read"]},{"resource":"read_caCerts","actions":["read"]},{"resource":"sdg_repair_database","actions":["read"]},{"resource":"read_extCA","actions":["read"]},{"resource":"ns_app","actions":["execute"]},{"resource":"adaptation_solution_1","actions":["execute"]},{"resource":"ldap","actions":["create","update"]},{"resource":"sshkey","actions":["create","update"]},{"resource":"adaptation_solution_5","actions":["execute"]},{"resource":"bulk_import","actions":["execute"]},{"resource":"adaptation_solution_4","actions":["execute"]},{"resource":"caEntity_mgmt","actions":["create","update","delete"]},{"resource":"adaptation_trouble_ticketing","actions":["execute"]},{"resource":"adaptation_solution_3","actions":["execute"]},{"resource":"adaptation_solution_2","actions":["execute"]},{"resource":"internal_target_group_mgmt","actions":["update"]},{"resource":"adaptation_nodecli","actions":["execute"]},{"resource":"SavedSearchOthers_Public","actions":["read","update","delete"]},{"resource":"fcm_ebs_flex_counter","actions":["read","query","create","update","delete"]},{"resource":"rtsel","actions":["execute"]},{"resource":"ops_enm","actions":["execute"]},{"resource":"ParameterSets_Public","actions":["read","delete","create","update"]},{"resource":"sis_manage_profiles","actions":["read"]},{"resource":"read_crls","actions":["read"]},{"resource":"logViewer_privacy","actions":["read"]},{"resource":"netan-consumer-access","actions":["read"]},{"resource":"esn_schema_registry","actions":["read"]},{"resource":"read_entities","actions":["read"]},{"resource":"cm_bulk_import_ui","actions":["read","create","delete","execute"]},{"resource":"rootAssociations","actions":["read"]},{"resource":"bo-admin-access","actions":["read"]},{"resource":"cm_app_param","actions":["read","update"]},{"resource":"sas_manage_exceptions","actions":["read"]},{"resource":"cm_config","actions":["read","create","execute","update","delete"]},{"resource":"ncm_app","actions":["execute"]},{"resource":"add_node","actions":["write"]},{"resource":"on_demand_crl_download","actions":["execute"]},{"resource":"caEntity_cert_mgmt","actions":["create","update"]},{"resource":"amos_em","actions":["read","create","patch","execute"]},{"resource":"ParameterSetsOthers_Public","actions":["read","delete","update"]},{"resource":"flowautomation","actions":["install","remove","enable","activate","execute","read"]},{"resource":"entity_cert_mgmt","actions":["create","update"]},{"resource":"adaptation_subscription","actions":["execute"]},{"resource":"eea","actions":["read"]},{"resource":"crlcheck","actions":["update","read"]},{"resource":"cell-management-nbi","actions":["create","read","update","delete"]},{"resource":"node_management_state","actions":["update"]},{"resource":"alarm_policies","actions":["create","query","update","delete"]},{"resource":"secgw_cert_mgmt","actions":["create"]},{"resource":"credentials","actions":["create","update","read"]},{"resource":"asr_l_schema","actions":["read"]},{"resource":"adaptation_pm_nb_integration","actions":["execute"]},{"resource":"translationmap_conversionrule","actions":["update","read"]},{"resource":"flowautomation_m2m","actions":["execute","read"]},{"resource":"nodecli_usertype_control","actions":["execute"]},{"resource":"cell-management-gui","actions":["create","read","update","delete"]},{"resource":"manage_regions","actions":["read"]},{"resource":"sas_set_mysql","actions":["read"]},{"resource":"autocellid_services","actions":["create","read","update","delete"]},{"resource":"acom_start_use_case","actions":["read"]},{"resource":"ParameterSets_Private","actions":["read","delete","create","update"]},{"resource":"sdg_manage_instances","actions":["read"]},{"resource":"NodeDiscovery","actions":["create","update","delete","read","execute"]},{"resource":"searchExecutor","actions":["read"]},{"resource":"lcm","actions":["read","create","execute","update","delete","query"]},{"resource":"error_event","actions":["create","read"]},{"resource":"nodecli_usertype_admin","actions":["execute"]},{"resource":"oam","actions":["read","execute","delete"]},{"resource":"session_mgmt","actions":["create"]},{"resource":"asr_l","actions":["read","update","execute"]},{"resource":"sas_toggle_use_case","actions":["read"]},{"resource":"dhcp_monitor","actions":["read","execute","delete"]},{"resource":"read_algorithms","actions":["read"]},{"resource":"cm-events-nbi","actions":["read","create","delete"]},{"resource":"alarms_search","actions":["query"]},{"resource":"netlogService","actions":["query","execute","read","delete"]},{"resource":"vnflcm","actions":["read","execute"]},{"resource":"cm_audit_cli","actions":["read","create","delete"]},{"resource":"element_manager","actions":["read","execute","update","create","delete"]},{"resource":"nhm","actions":["read","execute","update","create","query","delete"]},{"resource":"Collections_Public","actions":["create","delete","read","update"]},{"resource":"alarm_export","actions":["query"]},{"resource":"nodes","actions":["execute","query","update"]},{"resource":"sas_configure_use_case","actions":["read"]},{"resource":"open_alarms","actions":["execute","update","query"]},{"resource":"sas_user","actions":["read"]},{"resource":"netan-business-analyst-access","actions":["read"]},{"resource":"CollectionsOthers_Public","actions":["read","update","delete"]},{"resource":"entity_mgmt","actions":["create","update","delete"]},{"resource":"ParameterSetsOthers_Private","actions":["read","delete","update"]},{"resource":"read_entityCerts","actions":["read"]}])
    });

    app.get('/persistentObject/network/-2', function (req, res) {
        res.status(200).send({
            "treeNodes": [{
                "id": "281474977291873",
                "moName": "SGSN-16A-CP01-V101",
                "moType": "ManagedElement",
                "syncStatus": "SYNCHRONIZED",
                "neType": "SGSN-MME",
                "poId": 281474977291873,
                "noOfChildrens": 1,
                "childrens": null
            },
                {
                    "id": "281474977291874",
                    "moName": "Leinster",
                    "moType": "SubNetwork",
                    "syncStatus": null,
                    "neType": null,
                    "poId": 281474977291874,
                    "noOfChildrens": 1,
                    "childrens": null
                },
                {
                    "id": "281474977281276",
                    "moName": "LTE02ERBS00010",
                    "moType": "MeContext",
                    "syncStatus": "SYNCHRONIZED",
                    "neType": "ERBS",
                    "poId": 281474977281276,
                    "noOfChildrens": 1,
                    "childrens": null
                }]
        })
    });

    app.post('/persistentObject/network/poids', function (req, res) {
        var poids = req.body.poids;
        var returnedNodes = [];
        poids.forEach(function (poid) {
            returnedNodes.push(nodes[poid]);
        });
        res.status(200).send({"treeNodes": returnedNodes});
    });

    var favorites = require("../flow-instances/test/resources/favorites").favorites;
    app.get('/rest/ui/settings/networkexplorer/favorites', function (req, res) {
        res.status(200).send(favorites);
    });

    //collections
    app.post('/object-configuration/collections/search/v4', function (req, res) {
        var response = [{
            "id": "281474979402243",
            "name": "Test1_collection",
            "owner": "administrator",
            "sharing": "private",
            "query": "MeContext",
            "type": "leaf",
            "timeCreated": 1517969626873,
            "timeUpdated": 1517969626873,
            "contentsLastUpdated": 1517969626873,
            "isCustomTopology": false,
            "userPermissions": {
                "deletable": true,
                "updateable": true
            },
            "stereotypes": [],
            "labels": []
        }, {
            "id": "281474979421055",
            "name": "Eutranfdd",
            "owner": "administrator",
            "sharing": "public",
            "query": "MeContext",
            "type": "leaf",
            "timeCreated": 1516766897953,
            "timeUpdated": 1516766897953,
            "contentsLastUpdated": 1516766897953,
            "isCustomTopology": false,
            "userPermissions": {
                "deletable": true,
                "updateable": true
            },
            "stereotypes": [],
            "labels": []
        }, {
            "id": "281474979421035",
            "name": "Empty",
            "owner": "administrator",
            "sharing": "public",
            "query": "MeContext",
            "type": "leaf",
            "timeCreated": 1516766897953,
            "timeUpdated": 1516766897953,
            "contentsLastUpdated": 1516766897953,
            "isCustomTopology": false,
            "userPermissions": {
                "deletable": true,
                "updateable": true
            },
            "stereotypes": [],
            "labels": []
        }];
        res.status(200).send(response);
    });

    app.get('/topologyCollections/savedSearches', function (req, res) {
        var response = [
            {
                "poId": "281475006864317",
                "name": "savedSearch1",
                "searchQuery": "NetworkElement",
                "attributes": {
                    "lastUpdated": 1558957868126,
                    "searchQuery": "NetworkElement",
                    "name": "savedSearch1",
                    "timeCreated": 1558957868126,
                    "category": "Public",
                    "userId": "administrator"
                },
                "deletable": true,
                "update": true,
                "delete": true,
                "type": "SavedSearch"
            },
            {
                "poId": "281475006864358",
                "name": "savedSearch2",
                "searchQuery": "eutrancellfdd",
                "attributes": {
                    "lastUpdated": 1558957896233,
                    "searchQuery": "eutrancellfdd",
                    "name": "savedSearch2",
                    "timeCreated": 1558957896233,
                    "category": "Public",
                    "userId": "administrator"
                },
                "deletable": true,
                "update": true,
                "delete": true,
                "type": "SavedSearch"
            }
        ];

        return res.status(200).send(response);
    });

    app.get('/topologyCollections/savedSearches/:id', function (req, res) {
        var savedSearchPoid = req.params.id;
        var response;
        if (savedSearchPoid === "281475006864317") {
            response = {
                "poId": "281475006864317",
                "name": "savedSearch1",
                "searchQuery": "NetworkElement",
                "attributes": {
                    "lastUpdated": null,
                    "searchQuery": "NetworkElement",
                    "name": "savedSearch1",
                    "timeCreated": null,
                    "category": "Public",
                    "userId": "administrator"
                },
                "deletable": true,
                "update": true,
                "delete": true,
                "type": "SavedSearch"
            };

        } else if (savedSearchPoid === "281475006864358") {
            response = {
                "poId": "281475006864358",
                "name": "savedSearch2",
                "searchQuery": "eutrancellfdd",
                "attributes": {
                    "lastUpdated": null,
                    "searchQuery": "eutrancellfdd",
                    "name": "savedSearch2",
                    "timeCreated": null,
                    "category": "Public",
                    "userId": "administrator"
                },
                "deletable": true,
                "update": true,
                "delete": true,
                "type": "SavedSearch"
            };
        }
        return res.status(200).send(response);
    });

    app.get('/managedObjects/query', function (req, res) {
        var searchQuery = req.query["searchQuery"];
        var response;
        if (searchQuery === "eutrancellfdd") {
            response = [{
                "id": "281474997521420",
                "moName": "LTE02ERBS00002-4",
                "moType": "EUtranCellFDD",
                "poId": "281474997521420",
                "mibRootName": "LTE02ERBS00002",
                "parentRDN": "ENodeBFunction=1",
                "fullMoType": "EUtranCellFDD",
                "managementState": null,
                "attributes": {},
                "fdn": null
            },
                {
                    "id": "281474989854136",
                    "moName": "LTE01dg2ERBS00036-10",
                    "moType": "EUtranCellFDD",
                    "poId": "281474989854136",
                    "mibRootName": "LTE01dg2ERBS00036",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474990333179",
                    "moName": "LTE04dg2ERBS00011-8",
                    "moType": "EUtranCellFDD",
                    "poId": "281474990333179",
                    "mibRootName": "LTE04dg2ERBS00011",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474990498649",
                    "moName": "LTE04dg2ERBS00028-2",
                    "moType": "EUtranCellFDD",
                    "poId": "281474990498649",
                    "mibRootName": "LTE04dg2ERBS00028",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474990814248",
                    "moName": "LTE06dg2ERBS00020-4",
                    "moType": "EUtranCellFDD",
                    "poId": "281474990814248",
                    "mibRootName": "LTE06dg2ERBS00020",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474990375212",
                    "moName": "LTE04dg2ERBS00019-3",
                    "moType": "EUtranCellFDD",
                    "poId": "281474990375212",
                    "mibRootName": "LTE04dg2ERBS00019",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474997530830",
                    "moName": "LTE02ERBS00004-3",
                    "moType": "EUtranCellFDD",
                    "poId": "281474997530830",
                    "mibRootName": "LTE02ERBS00004",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                },
                {
                    "id": "281474990226559",
                    "moName": "LTE04dg2ERBS00010-2",
                    "moType": "EUtranCellFDD",
                    "poId": "281474990226559",
                    "mibRootName": "LTE04dg2ERBS00010",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": null,
                    "attributes": {},
                    "fdn": null
                }
            ];
        } else if (searchQuery === 'NetworkElement') {
            response = [{
                "id": "281474990211627",
                "moName": "LTE04dg2ERBS00022",
                "moType": "NetworkElement",
                "poId": "281474990211627",
                "mibRootName": "LTE04dg2ERBS00022",
                "parentRDN": "",
                "fullMoType": "NetworkElement",
                "managementState": null,
                "attributes": {
                    "neType": "RadioNode"
                },
                "fdn": null
            },
                {
                    "id": "281474990312916",
                    "moName": "LTE105dg2ERBS00001",
                    "moType": "NetworkElement",
                    "poId": "281474990312916",
                    "mibRootName": "LTE105dg2ERBS00001",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989734140",
                    "moName": "LTE04dg2ERBS00003",
                    "moType": "NetworkElement",
                    "poId": "281474989734140",
                    "mibRootName": "LTE04dg2ERBS00003",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990743607",
                    "moName": "LTE26dg2ERBS00002",
                    "moType": "NetworkElement",
                    "poId": "281474990743607",
                    "mibRootName": "LTE26dg2ERBS00002",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990204069",
                    "moName": "LTE04dg2ERBS00009",
                    "moType": "NetworkElement",
                    "poId": "281474990204069",
                    "mibRootName": "LTE04dg2ERBS00009",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989635333",
                    "moName": "LTE01dg2ERBS00022",
                    "moType": "NetworkElement",
                    "poId": "281474989635333",
                    "mibRootName": "LTE01dg2ERBS00022",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990312362",
                    "moName": "LTE04dg2ERBS00030",
                    "moType": "NetworkElement",
                    "poId": "281474990312362",
                    "mibRootName": "LTE04dg2ERBS00030",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989733157",
                    "moName": "LTE01dg2ERBS00030",
                    "moType": "NetworkElement",
                    "poId": "281474989733157",
                    "mibRootName": "LTE01dg2ERBS00030",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990215457",
                    "moName": "LTE04dg2ERBS00028",
                    "moType": "NetworkElement",
                    "poId": "281474990215457",
                    "mibRootName": "LTE04dg2ERBS00028",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990348578",
                    "moName": "LTE105dg2ERBS00006",
                    "moType": "NetworkElement",
                    "poId": "281474990348578",
                    "mibRootName": "LTE105dg2ERBS00006",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990647466",
                    "moName": "LTE06dg2ERBS00021",
                    "moType": "NetworkElement",
                    "poId": "281474990647466",
                    "mibRootName": "LTE06dg2ERBS00021",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989634996",
                    "moName": "LTE01dg2ERBS00015",
                    "moType": "NetworkElement",
                    "poId": "281474989634996",
                    "mibRootName": "LTE01dg2ERBS00015",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990204363",
                    "moName": "LTE04dg2ERBS00011",
                    "moType": "NetworkElement",
                    "poId": "281474990204363",
                    "mibRootName": "LTE04dg2ERBS00011",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990512735",
                    "moName": "LTE06dg2ERBS00017",
                    "moType": "NetworkElement",
                    "poId": "281474990512735",
                    "mibRootName": "LTE06dg2ERBS00017",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990512228",
                    "moName": "LTE06dg2ERBS00015",
                    "moType": "NetworkElement",
                    "poId": "281474990512228",
                    "mibRootName": "LTE06dg2ERBS00015",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990715340",
                    "moName": "LTE06dg2ERBS00035",
                    "moType": "NetworkElement",
                    "poId": "281474990715340",
                    "mibRootName": "LTE06dg2ERBS00035",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990210883",
                    "moName": "LTE04dg2ERBS00015",
                    "moType": "NetworkElement",
                    "poId": "281474990210883",
                    "mibRootName": "LTE04dg2ERBS00015",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989635593",
                    "moName": "LTE01dg2ERBS00026",
                    "moType": "NetworkElement",
                    "poId": "281474989635593",
                    "mibRootName": "LTE01dg2ERBS00026",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990673108",
                    "moName": "LTE06dg2ERBS00026",
                    "moType": "NetworkElement",
                    "poId": "281474990673108",
                    "mibRootName": "LTE06dg2ERBS00026",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990743638",
                    "moName": "LTE26dg2ERBS00003",
                    "moType": "NetworkElement",
                    "poId": "281474990743638",
                    "mibRootName": "LTE26dg2ERBS00003",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990312947",
                    "moName": "LTE105dg2ERBS00002",
                    "moType": "NetworkElement",
                    "poId": "281474990312947",
                    "mibRootName": "LTE105dg2ERBS00002",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474990482000",
                    "moName": "LTE06dg2ERBS00011",
                    "moType": "NetworkElement",
                    "poId": "281474990482000",
                    "mibRootName": "LTE06dg2ERBS00011",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                },
                {
                    "id": "281474989635027",
                    "moName": "LTE01dg2ERBS00016",
                    "moType": "NetworkElement",
                    "poId": "281474989635027",
                    "mibRootName": "LTE01dg2ERBS00016",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": null,
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": null
                }
            ];
        }

        return res.status(200).send(response);
    });

    app.post('/managedObjects/getPosByPoIds', function (req, res) {
        var moType = req.body.attributeMappings.moType;
        var response = [];
        if (moType === "NetworkElement" || moType === "MeContext" || moType === "ManagedElement") {
            response = [
                {
                    "id": "281474989571725",
                    "moName": "LTE01dg2ERBS00001",
                    "moType": "NetworkElement",
                    "poId": "281474989571725",
                    "mibRootName": "LTE01dg2ERBS00001",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00001",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571756",
                    "moName": "LTE01dg2ERBS00002",
                    "moType": "NetworkElement",
                    "poId": "281474989571756",
                    "mibRootName": "LTE01dg2ERBS00002",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00002",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571787",
                    "moName": "LTE01dg2ERBS00003",
                    "moType": "NetworkElement",
                    "poId": "281474989571787",
                    "mibRootName": "LTE01dg2ERBS00003",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00003",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571818",
                    "moName": "LTE01dg2ERBS00004",
                    "moType": "NetworkElement",
                    "poId": "281474989571818",
                    "mibRootName": "LTE01dg2ERBS00004",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00004",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571909",
                    "moName": "LTE01dg2ERBS00005",
                    "moType": "NetworkElement",
                    "poId": "281474989571909",
                    "mibRootName": "LTE01dg2ERBS00005",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00005",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571940",
                    "moName": "LTE01dg2ERBS00006",
                    "moType": "NetworkElement",
                    "poId": "281474989571940",
                    "mibRootName": "LTE01dg2ERBS00006",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00006",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989571971",
                    "moName": "LTE01dg2ERBS00007",
                    "moType": "NetworkElement",
                    "poId": "281474989571971",
                    "mibRootName": "LTE01dg2ERBS00007",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00007",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989572069",
                    "moName": "LTE01dg2ERBS00008",
                    "moType": "NetworkElement",
                    "poId": "281474989572069",
                    "mibRootName": "LTE01dg2ERBS00008",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00008",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989572100",
                    "moName": "LTE01dg2ERBS00009",
                    "moType": "NetworkElement",
                    "poId": "281474989572100",
                    "mibRootName": "LTE01dg2ERBS00009",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00009",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989572131",
                    "moName": "LTE01dg2ERBS00010",
                    "moType": "NetworkElement",
                    "poId": "281474989572131",
                    "mibRootName": "LTE01dg2ERBS00010",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00010",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989572241",
                    "moName": "LTE01dg2ERBS00011",
                    "moType": "NetworkElement",
                    "poId": "281474989572241",
                    "mibRootName": "LTE01dg2ERBS00011",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00011",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989572272",
                    "moName": "LTE01dg2ERBS00012",
                    "moType": "NetworkElement",
                    "poId": "281474989572272",
                    "mibRootName": "LTE01dg2ERBS00012",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00012",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989634830",
                    "moName": "LTE01dg2ERBS00013",
                    "moType": "NetworkElement",
                    "poId": "281474989634830",
                    "mibRootName": "LTE01dg2ERBS00013",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00013",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989634861",
                    "moName": "LTE01dg2ERBS00014",
                    "moType": "NetworkElement",
                    "poId": "281474989634861",
                    "mibRootName": "LTE01dg2ERBS00014",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00014",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989634996",
                    "moName": "LTE01dg2ERBS00015",
                    "moType": "NetworkElement",
                    "poId": "281474989634996",
                    "mibRootName": "LTE01dg2ERBS00015",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00015",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635027",
                    "moName": "LTE01dg2ERBS00016",
                    "moType": "NetworkElement",
                    "poId": "281474989635027",
                    "mibRootName": "LTE01dg2ERBS00016",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00016",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635058",
                    "moName": "LTE01dg2ERBS00017",
                    "moType": "NetworkElement",
                    "poId": "281474989635058",
                    "mibRootName": "LTE01dg2ERBS00017",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00017",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635089",
                    "moName": "LTE01dg2ERBS00018",
                    "moType": "NetworkElement",
                    "poId": "281474989635089",
                    "mibRootName": "LTE01dg2ERBS00018",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00018",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635139",
                    "moName": "LTE01dg2ERBS00019",
                    "moType": "NetworkElement",
                    "poId": "281474989635139",
                    "mibRootName": "LTE01dg2ERBS00019",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00019",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635271",
                    "moName": "LTE01dg2ERBS00020",
                    "moType": "NetworkElement",
                    "poId": "281474989635271",
                    "mibRootName": "LTE01dg2ERBS00020",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00020",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635302",
                    "moName": "LTE01dg2ERBS00021",
                    "moType": "NetworkElement",
                    "poId": "281474989635302",
                    "mibRootName": "LTE01dg2ERBS00021",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00021",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635333",
                    "moName": "LTE01dg2ERBS00022",
                    "moType": "NetworkElement",
                    "poId": "281474989635333",
                    "mibRootName": "LTE01dg2ERBS00022",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00022",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635500",
                    "moName": "LTE01dg2ERBS00023",
                    "moType": "NetworkElement",
                    "poId": "281474989635500",
                    "mibRootName": "LTE01dg2ERBS00023",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00023",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635531",
                    "moName": "LTE01dg2ERBS00024",
                    "moType": "NetworkElement",
                    "poId": "281474989635531",
                    "mibRootName": "LTE01dg2ERBS00024",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00024",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635562",
                    "moName": "LTE01dg2ERBS00025",
                    "moType": "NetworkElement",
                    "poId": "281474989635562",
                    "mibRootName": "LTE01dg2ERBS00025",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00025",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635593",
                    "moName": "LTE01dg2ERBS00026",
                    "moType": "NetworkElement",
                    "poId": "281474989635593",
                    "mibRootName": "LTE01dg2ERBS00026",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00026",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635776",
                    "moName": "LTE01dg2ERBS00027",
                    "moType": "NetworkElement",
                    "poId": "281474989635776",
                    "mibRootName": "LTE01dg2ERBS00027",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00027",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635807",
                    "moName": "LTE01dg2ERBS00028",
                    "moType": "NetworkElement",
                    "poId": "281474989635807",
                    "mibRootName": "LTE01dg2ERBS00028",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00028",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989635838",
                    "moName": "LTE01dg2ERBS00029",
                    "moType": "NetworkElement",
                    "poId": "281474989635838",
                    "mibRootName": "LTE01dg2ERBS00029",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00029",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733157",
                    "moName": "LTE01dg2ERBS00030",
                    "moType": "NetworkElement",
                    "poId": "281474989733157",
                    "mibRootName": "LTE01dg2ERBS00030",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00030",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733356",
                    "moName": "LTE01dg2ERBS00031",
                    "moType": "NetworkElement",
                    "poId": "281474989733356",
                    "mibRootName": "LTE01dg2ERBS00031",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00031",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733387",
                    "moName": "LTE01dg2ERBS00032",
                    "moType": "NetworkElement",
                    "poId": "281474989733387",
                    "mibRootName": "LTE01dg2ERBS00032",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00032",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733418",
                    "moName": "LTE01dg2ERBS00033",
                    "moType": "NetworkElement",
                    "poId": "281474989733418",
                    "mibRootName": "LTE01dg2ERBS00033",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00033",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733484",
                    "moName": "LTE01dg2ERBS00034",
                    "moType": "NetworkElement",
                    "poId": "281474989733484",
                    "mibRootName": "LTE01dg2ERBS00034",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00034",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733651",
                    "moName": "LTE01dg2ERBS00035",
                    "moType": "NetworkElement",
                    "poId": "281474989733651",
                    "mibRootName": "LTE01dg2ERBS00035",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00035",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733682",
                    "moName": "LTE01dg2ERBS00036",
                    "moType": "NetworkElement",
                    "poId": "281474989733682",
                    "mibRootName": "LTE01dg2ERBS00036",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE01dg2ERBS00036",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474990744227",
                    "moName": "LTE02ERBS00001",
                    "moType": "NetworkElement",
                    "poId": "281474990744227",
                    "mibRootName": "LTE02ERBS00001",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "ERBS"
                    },
                    "fdn": "NetworkElement=LTE02ERBS00001",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474997516275",
                    "moName": "LTE02ERBS00002",
                    "moType": "NetworkElement",
                    "poId": "281474997516275",
                    "mibRootName": "LTE02ERBS00002",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "ERBS"
                    },
                    "fdn": "NetworkElement=LTE02ERBS00002",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474997518224",
                    "moName": "LTE02ERBS00003",
                    "moType": "NetworkElement",
                    "poId": "281474997518224",
                    "mibRootName": "LTE02ERBS00003",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "ERBS"
                    },
                    "fdn": "NetworkElement=LTE02ERBS00003",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474997520877",
                    "moName": "LTE02ERBS00004",
                    "moType": "NetworkElement",
                    "poId": "281474997520877",
                    "mibRootName": "LTE02ERBS00004",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "ERBS"
                    },
                    "fdn": "NetworkElement=LTE02ERBS00004",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474997526411",
                    "moName": "LTE02ERBS00005",
                    "moType": "NetworkElement",
                    "poId": "281474997526411",
                    "mibRootName": "LTE02ERBS00005",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "ERBS"
                    },
                    "fdn": "NetworkElement=LTE02ERBS00005",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733896",
                    "moName": "LTE04dg2ERBS00001",
                    "moType": "NetworkElement",
                    "poId": "281474989733896",
                    "mibRootName": "LTE04dg2ERBS00001",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00001",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989733927",
                    "moName": "LTE04dg2ERBS00002",
                    "moType": "NetworkElement",
                    "poId": "281474989733927",
                    "mibRootName": "LTE04dg2ERBS00002",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00002",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989734140",
                    "moName": "LTE04dg2ERBS00003",
                    "moType": "NetworkElement",
                    "poId": "281474989734140",
                    "mibRootName": "LTE04dg2ERBS00003",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00003",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474990203698",
                    "moName": "LTE04dg2ERBS00004",
                    "moType": "NetworkElement",
                    "poId": "281474990203698",
                    "mibRootName": "LTE04dg2ERBS00004",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00004",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474990203729",
                    "moName": "LTE04dg2ERBS00005",
                    "moType": "NetworkElement",
                    "poId": "281474990203729",
                    "mibRootName": "LTE04dg2ERBS00005",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00005",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474990203760",
                    "moName": "LTE04dg2ERBS00006",
                    "moType": "NetworkElement",
                    "poId": "281474990203760",
                    "mibRootName": "LTE04dg2ERBS00006",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00006",
                    "cmSyncStatus": "UNSYNCHRONIZED"
                },
                {
                    "id": "281474990204007",
                    "moName": "LTE04dg2ERBS00007",
                    "moType": "NetworkElement",
                    "poId": "281474990204007",
                    "mibRootName": "LTE04dg2ERBS00007",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00007",
                    "cmSyncStatus": "UNSYNCHRONIZED"
                },
                {
                    "id": "281474990204038",
                    "moName": "LTE04dg2ERBS00008",
                    "moType": "NetworkElement",
                    "poId": "281474990204038",
                    "mibRootName": "LTE04dg2ERBS00008",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00008",
                    "cmSyncStatus": "UNSYNCHRONIZED"
                },
                {
                    "id": "281474990204069",
                    "moName": "LTE04dg2ERBS00009",
                    "moType": "NetworkElement",
                    "poId": "281474990204069",
                    "mibRootName": "LTE04dg2ERBS00009",
                    "parentRDN": "",
                    "fullMoType": "NetworkElement",
                    "managementState": "NORMAL",
                    "attributes": {
                        "neType": "RadioNode"
                    },
                    "fdn": "NetworkElement=LTE04dg2ERBS00009",
                    "cmSyncStatus": "UNSYNCHRONIZED"
                }
            ];

        } else {
            response = [
                {
                    "id": "281474989612086",
                    "moName": "LTE01dg2ERBS00001-1",
                    "moType": "EUtranCellFDD",
                    "poId": "281474989612086",
                    "mibRootName": "LTE01dg2ERBS00001",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": "NORMAL",
                    "attributes": {},
                    "fdn": "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-1",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989610529",
                    "moName": "LTE01dg2ERBS00001-2",
                    "moType": "EUtranCellFDD",
                    "poId": "281474989610529",
                    "mibRootName": "LTE01dg2ERBS00001",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": "NORMAL",
                    "attributes": {neType: null},
                    "fdn": "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-2",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989607533",
                    "moName": "LTE01dg2ERBS00002-1",
                    "moType": "EUtranCellFDD",
                    "poId": "281474989607533",
                    "mibRootName": "LTE01dg2ERBS00002",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": "NORMAL",
                    "attributes": {neType: "ERBS"},
                    "fdn": "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-1",
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989601024",
                    "moName": "Deleted",
                    "moType": "Deleted",
                    "poId": "281474989601024",
                    "mibRootName": null,
                    "parentRDN": null,
                    "fullMoType": null,
                    "managementState": null,
                    "attributes": null,
                    "fdn": null,
                    "cmSyncStatus": "SYNCHRONIZED"
                },
                {
                    "id": "281474989600597",
                    "moName": "LTE01dg2ERBS00003-2",
                    "moType": "EUtranCellFDD",
                    "poId": "281474989600597",
                    "mibRootName": "LTE01dg2ERBS00003",
                    "parentRDN": "ENodeBFunction=1",
                    "fullMoType": "EUtranCellFDD",
                    "managementState": "NORMAL",
                    "attributes": {neType: "RadioNode"},
                    "fdn": "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-2",
                    "cmSyncStatus": "SYNCHRONIZED"
                }
            ];
        }
        res.status(200).send(response);
    });


    app.get('/persistentObject/fdn/:fdn', function (req, res) {
        fdn = req.params.fdn;

        var fdnResponses = [{
            "name": "LTE01dg2ERBS00001-1",
            "type": "EUtranCellFDD",
            "poId": 281474989612086,
            "id": "281474989612086",
            "fdn": "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-1",
            "namespace": "Lrat",
            "namespaceVersion": "2.141.0",
            "neType": "RadioNode",
            "attributes": [
                {
                    "key": "ns05LowBandSchedMode",
                    "value": "ALWAYS_PROHIBIT",
                    "datatype": null
                },
                {
                    "key": "ulInterferenceManagementActive",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "iuaMaxResourcePerCell",
                    "value": 20,
                    "datatype": null
                },
                {
                    "key": "hpueCaSwitchThres",
                    "value": -150,
                    "datatype": null
                },
                {
                    "key": "physicalLayerCellId",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulHarqVolteBlerTarget",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopInitialAdj",
                    "value": -70,
                    "datatype": null
                },
                {
                    "key": "dummyCdmaBandClass",
                    "value": "UNDEFINED_VALUE",
                    "datatype": null
                },
                {
                    "key": "cceDynUeAdmCtrlOverloadThr",
                    "value": 600,
                    "datatype": null
                },
                {
                    "key": "dlDynUeAdmCtrlRetDiffThr",
                    "value": 500,
                    "datatype": null
                },
                {
                    "key": "cellBarred",
                    "value": "NOT_BARRED",
                    "datatype": null
                },
                {
                    "key": "additionalSpectrumEmissionValues",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "preambleInitialReceivedTargetPower",
                    "value": -110,
                    "datatype": null
                },
                {
                    "key": "enableUeAssistedSigReduction",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "dynUeAdmCtrlEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "cellSubscriptionCapacity",
                    "value": 1000,
                    "datatype": null
                },
                {
                    "key": "maxSoftLockBackoffTime",
                    "value": 90,
                    "datatype": null
                },
                {
                    "key": "outOfCoverageThreshold",
                    "value": 20,
                    "datatype": null
                },
                {
                    "key": "freqBand",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "ttiBundlingAfterHo",
                    "value": "NO_TTI_BUNDLING",
                    "datatype": null
                },
                {
                    "key": "ailgAutoRestartEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "cellCapMaxCellSubCap",
                    "value": 1500,
                    "datatype": null
                },
                {
                    "key": "eutranCellCoverage",
                    "value": [
                        {
                            "key": "posCellBearing",
                            "value": -1,
                            "datatype": null
                        },
                        {
                            "key": "posCellOpeningAngle",
                            "value": -1,
                            "datatype": null
                        },
                        {
                            "key": "posCellRadius",
                            "value": 0,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "servOrPrioIFHoSetupBearer",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "elcEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "rtpTimeout",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "uncertSemiMajor",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "uncertSemiMinor",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulImprovedUeSchedLastEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "prsPeriod",
                    "value": "PP160",
                    "datatype": null
                },
                {
                    "key": "lbabBarringPriorityLevel",
                    "value": "PRIORITY0",
                    "datatype": null
                },
                {
                    "key": "operationalState",
                    "value": "DISABLED",
                    "datatype": null
                },
                {
                    "key": "servOrPrioTriggeredErabAction",
                    "value": "REJECT",
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopUpStep",
                    "value": 8,
                    "datatype": null
                },
                {
                    "key": "puschMaxNrOfPrbsPerUe",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "maxValidSubframeDlBr",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "latitude",
                    "value": 53422778,
                    "datatype": null
                },
                {
                    "key": "ssacBarringForMMTELVoice",
                    "value": [
                        {
                            "key": "acBarringFactor",
                            "value": 95,
                            "datatype": null
                        },
                        {
                            "key": "acBarringForSpecialAC",
                            "value": [
                                false,
                                false,
                                false,
                                false,
                                false
                            ],
                            "datatype": null
                        },
                        {
                            "key": "acBarringTime",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "eDrxAllowed",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "covTriggerdBlindHoAllowed",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "acBarringForMoData",
                    "value": [
                        {
                            "key": "acBarringFactor",
                            "value": 95,
                            "datatype": null
                        },
                        {
                            "key": "acBarringForSpecialAC",
                            "value": [
                                false,
                                false,
                                false,
                                false,
                                false
                            ],
                            "datatype": null
                        },
                        {
                            "key": "acBarringTime",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "prsConfigIndex",
                    "value": -1,
                    "datatype": null
                },
                {
                    "key": "additionalPlmnReservedList",
                    "value": [
                        false,
                        false,
                        false,
                        false,
                        false
                    ],
                    "datatype": null
                },
                {
                    "key": "eranUlCompUserSelSinrThr",
                    "value": 150,
                    "datatype": null
                },
                {
                    "key": "cceDynUeAdmCtrlRetDiffThr",
                    "value": 500,
                    "datatype": null
                },
                {
                    "key": "otdoaCheckEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "pdcchTargetBlerPCell",
                    "value": 22,
                    "datatype": null
                },
                {
                    "key": "csiRsConfigType8TxFDD",
                    "value": "NZP_CSIRS",
                    "datatype": null
                },
                {
                    "key": "modificationPeriodCoeff",
                    "value": 2,
                    "datatype": null
                },
                {
                    "key": "beamWeightSet16TrTm9",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "physicalLayerCellIdGroup",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "ulChannelBandwidth",
                    "value": 10000,
                    "datatype": null
                },
                {
                    "key": "additionalMultipleNSPmax",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "deallocThrPucchFormat1",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "timeOfLastModification",
                    "value": "",
                    "datatype": null
                },
                {
                    "key": "highestSupportedCeLevelBr",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "maxSentCrsAssistCells",
                    "value": 8,
                    "datatype": null
                },
                {
                    "key": "uncertAltitude",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulBlerTargetEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "tUeBlockingTimer",
                    "value": 200,
                    "datatype": null
                },
                {
                    "key": "reservedBy",
                    "value": [
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-2,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-3,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-4,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-5,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-6,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-7,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-8,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-9,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-10,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-11,EUtranFreqRelation=1,EUtranCellRelation=1",
                        "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-12,EUtranFreqRelation=1,EUtranCellRelation=1"
                    ],
                    "datatype": null
                },
                {
                    "key": "qciTableRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "mbsfnSubframesForTm9",
                    "value": "DISABLED",
                    "datatype": null
                },
                {
                    "key": "prsMutingPattern",
                    "value": "1",
                    "datatype": null
                },
                {
                    "key": "sectorCarrierRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "qRxLevMinOffset",
                    "value": 1000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary33",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary32",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary31",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary30",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "rateShapingActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "channelSelectionSetSize",
                    "value": 2,
                    "datatype": null
                },
                {
                    "key": "activePlmnList",
                    "value": [
                        [
                            {
                                "key": "mcc",
                                "value": 353,
                                "datatype": null
                            },
                            {
                                "key": "mnc",
                                "value": 57,
                                "datatype": null
                            },
                            {
                                "key": "mncLength",
                                "value": 2,
                                "datatype": null
                            }
                        ]
                    ],
                    "datatype": null
                },
                {
                    "key": "pdcchTargetBlerVolte",
                    "value": 22,
                    "datatype": null
                },
                {
                    "key": "cellRange",
                    "value": 15,
                    "datatype": null
                },
                {
                    "key": "siPeriodicity",
                    "value": [
                        {
                            "key": "siPeriodicitySI1",
                            "value": 8,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI10",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI2",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI3",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI4",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI5",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI6",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI7",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI8",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI9",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "pciConflictCell",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "mappingInfoCe",
                    "value": [
                        {
                            "key": "mappingInfoSIB10",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB11",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB12",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB13",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB15",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB16",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB3",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB4",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB5",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB6",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB7",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB8",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "ailgActive",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "ulInternalChannelBandwidth",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "administrativeState",
                    "value": "UNLOCKED",
                    "datatype": null
                },
                {
                    "key": "lbabThreshTimeHigh",
                    "value": 30,
                    "datatype": null
                },
                {
                    "key": "hoOptAdjThresholdPercQci1",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "advCellSupAction",
                    "value": "NO_ACTION",
                    "datatype": null
                },
                {
                    "key": "siWindowLength",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "siValidityTimeBr",
                    "value": "VALIDITY_TIME_3H",
                    "datatype": null
                },
                {
                    "key": "ulSrsEnable",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "ulDynUeAdmCtrlRetDiffThr",
                    "value": 500,
                    "datatype": null
                },
                {
                    "key": "additionalPlmnList",
                    "value": [
                        [
                            {
                                "key": "mcc",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "mnc",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "mncLength",
                                "value": 2,
                                "datatype": null
                            }
                        ]
                    ],
                    "datatype": null
                },
                {
                    "key": "pdschTypeBGain",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "lbUtranOffloadThreshold",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "deallocTimerPucchFormat1",
                    "value": 6000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary43",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary42",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "ulSCellPriority",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary41",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "cellId",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "enableSinrUplinkClpc",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "srProcessingLevel",
                    "value": "NO_ADDITIONAL_SR_NEEDED",
                    "datatype": null
                },
                {
                    "key": "acBarringInfoPresent",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "tm9Tm4ModeSwitchingEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "lbabThreshRejectRateHigh",
                    "value": 200,
                    "datatype": null
                },
                {
                    "key": "hpueCaSwitchHyst",
                    "value": 20,
                    "datatype": null
                },
                {
                    "key": "interferenceThresholdSinrClpc",
                    "value": -105,
                    "datatype": null
                },
                {
                    "key": "beamWeightSet16Tr",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "primaryPlmnAlarmSuppr",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "liteMcsReduction",
                    "value": "ON",
                    "datatype": null
                },
                {
                    "key": "qQualMin",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "gpsTimeSFN0Seconds",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "userLabel",
                    "value": "LTE01dg2ERBS00001-1",
                    "datatype": null
                },
                {
                    "key": "expectedMaxNoOfUsersInCell",
                    "value": -1,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary17",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary14",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "dlConfigurableFrequencyStart",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "primaryPlmnReserved",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "pucchOverdimensioning",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "cioLowerLimitAdjBySon",
                    "value": -3,
                    "datatype": null
                },
                {
                    "key": "puschPwrOffset64qam",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "noOfPucchCqiUsers",
                    "value": 160,
                    "datatype": null
                },
                {
                    "key": "hoOptStatTime",
                    "value": 24,
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopInitialAdjPCell",
                    "value": -70,
                    "datatype": null
                },
                {
                    "key": "drxActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "cfraEnable",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "dynUeAdmCtrlFilterConst",
                    "value": 3000,
                    "datatype": null
                },
                {
                    "key": "lbEUtranCellOffloadCapacity",
                    "value": 1000,
                    "datatype": null
                },
                {
                    "key": "enableServiceSpecificHARQ",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "acBarringSkipForMmtelVideo",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "srDetectHighThres",
                    "value": 70,
                    "datatype": null
                },
                {
                    "key": "alpha",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "interEnbUlCompUserSelSinrHys",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "catmMbmsDlSubframes",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "gpsTimeSFN0DecimalSecond",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "availabilityStatus",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "validDlBrSubframes",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "hoOptStatNum",
                    "value": 200,
                    "datatype": null
                },
                {
                    "key": "tReorderingAutoConfiguration",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "spifhoSetupBearerAtInitialCtxtSetup",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary29",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "ns05FullBandSchedEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "bcCdma2000SysTimeType",
                    "value": "NONE",
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopUpStepPCell",
                    "value": 6,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary24",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary23",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "primaryPsdOffset",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary22",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary21",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "prsPowerBoosting",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulPsdLoadThresholdSinrClpc",
                    "value": 2,
                    "datatype": null
                },
                {
                    "key": "noOfEnhAdptReTxCand",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "prsMutingPatternLen",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "enableUeAssistedAdaptiveDrx",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "isDlOnly",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "tTimeAlignmentTimer",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "dlInterferenceManagementActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "prsTransmisScheme",
                    "value": "ANTENNA_SWITCHING",
                    "datatype": null
                },
                {
                    "key": "ssacBarringForMMTELVideo",
                    "value": [
                        {
                            "key": "acBarringFactor",
                            "value": 95,
                            "datatype": null
                        },
                        {
                            "key": "acBarringForSpecialAC",
                            "value": [
                                false,
                                false,
                                false,
                                false,
                                false
                            ],
                            "datatype": null
                        },
                        {
                            "key": "acBarringTime",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "lbabMinBarringFactor",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "acBarringForEmergency",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "prioAdditionalFreqBandList",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "emergencyAreaId",
                    "value": [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    "datatype": null
                },
                {
                    "key": "ttiBundlingSwitchThresHyst",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "rxSinrTargetClpc",
                    "value": 25,
                    "datatype": null
                },
                {
                    "key": "dlDynUeAdmCtrlOverloadThr",
                    "value": 600,
                    "datatype": null
                },
                {
                    "key": "threshServingLow",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "dynUlResourceAllocEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "mappingInfo",
                    "value": [
                        {
                            "key": "mappingInfoSIB10",
                            "value": "MAPPED_SI_1",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB11",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB12",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB13",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB15",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB16",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB3",
                            "value": "MAPPED_SI_1",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB4",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB5",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB6",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB7",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        },
                        {
                            "key": "mappingInfoSIB8",
                            "value": "NOT_MAPPED",
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "zzzTemporary79",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "pciConflict",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary78",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary77",
                    "value": "",
                    "datatype": null
                },
                {
                    "key": "zzzTemporary76",
                    "value": "",
                    "datatype": null
                },
                {
                    "key": "networkSignallingValueCa",
                    "value": "CA_NS_31",
                    "datatype": null
                },
                {
                    "key": "zzzTemporary75",
                    "value": "",
                    "datatype": null
                },
                {
                    "key": "zzzTemporary74",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "ns05FullBandUsersInCellThres",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary73",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary72",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "ttiBundlingAfterReest",
                    "value": "TTI_BUNDLING_SOURCE_REEST_ONLY",
                    "datatype": null
                },
                {
                    "key": "zzzTemporary71",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "noOfUlImprovedUe",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary70",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "caPrioThreshold",
                    "value": 300,
                    "datatype": null
                },
                {
                    "key": "cellDownlinkCaCapacity",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "harqOffsetDl",
                    "value": 3,
                    "datatype": null
                },
                {
                    "key": "advCellSupSensitivity",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "puschNcpChannelEstWindowSize",
                    "value": "NORMAL_SIZE",
                    "datatype": null
                },
                {
                    "key": "initialBufferSizeDefault",
                    "value": 86,
                    "datatype": null
                },
                {
                    "key": "lbabMinBarringFactorPrio1",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "lbabMinBarringFactorPrio2",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "noOfPucchFormat3PrbPairs",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "allocThrPucchFormat1",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "acBarringForMoSignalling",
                    "value": [
                        {
                            "key": "acBarringFactor",
                            "value": 95,
                            "datatype": null
                        },
                        {
                            "key": "acBarringForSpecialAC",
                            "value": [
                                false,
                                false,
                                false,
                                false,
                                false
                            ],
                            "datatype": null
                        },
                        {
                            "key": "acBarringTime",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "cellCapMinMaxWriProt",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "lbTpRankThreshMin",
                    "value": -20,
                    "datatype": null
                },
                {
                    "key": "physicalLayerSubCellId",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "lbabIncr",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "harqOffsetUl",
                    "value": 3,
                    "datatype": null
                },
                {
                    "key": "acBarringPresence",
                    "value": [
                        {
                            "key": "acBarringForCsfbPresence",
                            "value": "OFF",
                            "datatype": null
                        },
                        {
                            "key": "acBarringForMmtelVideoPresence",
                            "value": "OFF",
                            "datatype": null
                        },
                        {
                            "key": "acBarringForMmtelVoicePresence",
                            "value": "OFF",
                            "datatype": null
                        },
                        {
                            "key": "acBarringForMoDataPresence",
                            "value": "OFF",
                            "datatype": null
                        },
                        {
                            "key": "acBarringForMoSignPresence",
                            "value": "OFF",
                            "datatype": null
                        },
                        {
                            "key": "acBarringPriorityCsfb",
                            "value": "PRIORITY0",
                            "datatype": null
                        },
                        {
                            "key": "acBarringPriorityMmtelVideo",
                            "value": "PRIORITY0",
                            "datatype": null
                        },
                        {
                            "key": "acBarringPriorityMmtelVoice",
                            "value": "PRIORITY0",
                            "datatype": null
                        },
                        {
                            "key": "acBarringPriorityMoData",
                            "value": "PRIORITY0",
                            "datatype": null
                        },
                        {
                            "key": "acBarringPriorityMoSignaling",
                            "value": "PRIORITY0",
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "sdmActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "ttiBundlingSwitchThres",
                    "value": 90,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary82",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary81",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "pdschMaxNrOfPrbsPerUe",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary80",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "arpPriorityLevelForSPIFHo",
                    "value": [
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false
                    ],
                    "datatype": null
                },
                {
                    "key": "prioHpueCapability",
                    "value": "NO_PRIORITIZATION",
                    "datatype": null
                },
                {
                    "key": "lbabThreshTimeLow",
                    "value": 30,
                    "datatype": null
                },
                {
                    "key": "lbEUtranTriggerOffloadThreshold",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "allocTimerPucchFormat1",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "diffAdmCtrlFilteringProfRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "pdcchCovImproveDtx",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "cioUpperLimitAdjBySon",
                    "value": 4,
                    "datatype": null
                },
                {
                    "key": "pdcchCovImproveSrb",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "activeServiceAreaId",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "estCellCapUsableFraction",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary59",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "hoOptAdjThresholdAbs",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary57",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary56",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "cellCapMinCellSubCap",
                    "value": 500,
                    "datatype": null
                },
                {
                    "key": "additionalPlmnAlarmSupprList",
                    "value": [
                        false,
                        false,
                        false,
                        false,
                        false
                    ],
                    "datatype": null
                },
                {
                    "key": "lbabDecr",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary50",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "pdcchLaGinrMargin",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "outOfCoverageSrTimerPeriodicity",
                    "value": 320,
                    "datatype": null
                },
                {
                    "key": "multipleNSPmaxReqMapping",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "lbabPeriod",
                    "value": 120,
                    "datatype": null
                },
                {
                    "key": "dlBlerTargetEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "pdcchCfiMode",
                    "value": "CFI_STATIC_BY_BW",
                    "datatype": null
                },
                {
                    "key": "otdoaSuplActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "hoOptAdjThresholdAbsQci1",
                    "value": 5,
                    "datatype": null
                },
                {
                    "key": "adaptiveCfiHoProhibit",
                    "value": "NO_HO_PROHIBIT_CFI",
                    "datatype": null
                },
                {
                    "key": "lbabThreshRejectRateLow",
                    "value": 20,
                    "datatype": null
                },
                {
                    "key": "lbEUtranAcceptOffloadThreshold",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "spectrumEmissionReqMapping",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "earfcndl",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary69",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "commonSrPeriodicity",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary68",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "orientMajorAxis",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulDynUeAdmCtrlOverloadThr",
                    "value": 600,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary67",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary66",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "csiRsConfigType",
                    "value": "NZP_CSIRS",
                    "datatype": null
                },
                {
                    "key": "eUtranCellFDDId",
                    "value": "LTE01dg2ERBS00001-1",
                    "datatype": null
                },
                {
                    "key": "zzzTemporary65",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary64",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary63",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "ul64qamEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary62",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "lessPrbUsageThreshold",
                    "value": 90,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary61",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "zzzTemporary60",
                    "value": -2000000000,
                    "datatype": null
                },
                {
                    "key": "includeLcgInMacUeThp",
                    "value": [
                        false,
                        false,
                        true,
                        true
                    ],
                    "datatype": null
                },
                {
                    "key": "eranUlCompUserSelSinrHys",
                    "value": 10,
                    "datatype": null
                },
                {
                    "key": "schedulingInfoSib1BrMod",
                    "value": "OFF",
                    "datatype": null
                },
                {
                    "key": "hostingDigitalUnit",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "initCdma2000SysTimeType",
                    "value": "NONE",
                    "datatype": null
                },
                {
                    "key": "measCellGroupCellRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "earfcnul",
                    "value": 18001,
                    "datatype": null
                },
                {
                    "key": "servOrPrioRedirectEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "dl256QamEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "ailgRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "elcLongDrxCycle",
                    "value": "SF40",
                    "datatype": null
                },
                {
                    "key": "resourcePartitionGroupRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "crsGain",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "measBasedElcControl",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "dlChannelBandwidth",
                    "value": 1400,
                    "datatype": null
                },
                {
                    "key": "pZeroNominalPusch",
                    "value": -103,
                    "datatype": null
                },
                {
                    "key": "acBarringSkipForSms",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "eutranCellPolygon",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "hpueCaSwitchTimeToTrigger",
                    "value": 40,
                    "datatype": null
                },
                {
                    "key": "idleModePrioAtReleaseRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "tac",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "ns05PathlossOffsetThres",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "changeNotification",
                    "value": [
                        {
                            "key": "changeNotificationSIB1",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB13",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB15",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB16",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB2",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB3",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB4",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB5",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB6",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB7",
                            "value": true,
                            "datatype": null
                        },
                        {
                            "key": "changeNotificationSIB8",
                            "value": true,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "minBestCellHoAttempts",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "noConsecutiveSubframes",
                    "value": "SF1",
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopUpStepVolte",
                    "value": 6,
                    "datatype": null
                },
                {
                    "key": "srvccDelayTimer",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "hoOptStatNumQci1",
                    "value": 200,
                    "datatype": null
                },
                {
                    "key": "longitude",
                    "value": -7937222,
                    "datatype": null
                },
                {
                    "key": "clusteredPuschMprFactor",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "lbTpNonQualFraction",
                    "value": 35,
                    "datatype": null
                },
                {
                    "key": "pciDetectingCell",
                    "value": [
                        []
                    ],
                    "datatype": null
                },
                {
                    "key": "frameStartOffset",
                    "value": [
                        {
                            "key": "subFrameOffset",
                            "value": 0,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "siPeriodicityBr",
                    "value": [
                        {
                            "key": "siPeriodicitySI1",
                            "value": 8,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI10",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI2",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI3",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI4",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI5",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI6",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI7",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI8",
                            "value": 64,
                            "datatype": null
                        },
                        {
                            "key": "siPeriodicitySI9",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "pdcchPowerBoostMax",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "prsConfigIndexMapped",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "qQualMinOffset",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "servOrPrioTriggeredIFHo",
                    "value": "QCI",
                    "datatype": null
                },
                {
                    "key": "qQualMinRsrqCe",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "networkSignallingValue",
                    "value": "NS_01",
                    "datatype": null
                },
                {
                    "key": "additionalFreqBandList",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "lastSchedLinkAdaptEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "ulConfigurableFrequencyStart",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "ulFrequencyAllocationProportion",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "highSpeedUEActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "iuaInterval",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "catm1SupportEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "altitude",
                    "value": 30,
                    "datatype": null
                },
                {
                    "key": "measCellGroupUeRef",
                    "value": null,
                    "datatype": null
                },
                {
                    "key": "prescheduling",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "systemInformationBlock7",
                    "value": [
                        {
                            "key": "tReselectionGeran",
                            "value": 2,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionGeranSfHigh",
                            "value": 100,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionGeranSfMedium",
                            "value": 100,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "systemInformationBlock6",
                    "value": [
                        {
                            "key": "tReselectionUtra",
                            "value": 2,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionUtraSfHigh",
                            "value": 100,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionUtraSfMedium",
                            "value": 100,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "enableDrxAwareRlcArq",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "pdcchCovImproveQci1",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "systemInformationBlock3",
                    "value": [
                        {
                            "key": "nCellChangeHigh",
                            "value": 16,
                            "datatype": null
                        },
                        {
                            "key": "nCellChangeMedium",
                            "value": 16,
                            "datatype": null
                        },
                        {
                            "key": "qHyst",
                            "value": 4,
                            "datatype": null
                        },
                        {
                            "key": "qHystSfHigh",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "qHystSfMedium",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "sIntraSearch",
                            "value": 1000,
                            "datatype": null
                        },
                        {
                            "key": "sIntraSearchP",
                            "value": 62,
                            "datatype": null
                        },
                        {
                            "key": "sIntraSearchQ",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "sIntraSearchv920Active",
                            "value": false,
                            "datatype": null
                        },
                        {
                            "key": "sNonIntraSearch",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "sNonIntraSearchP",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "sNonIntraSearchQ",
                            "value": 0,
                            "datatype": null
                        },
                        {
                            "key": "sNonIntraSearchv920Active",
                            "value": false,
                            "datatype": null
                        },
                        {
                            "key": "tEvaluation",
                            "value": 240,
                            "datatype": null
                        },
                        {
                            "key": "tHystNormal",
                            "value": 240,
                            "datatype": null
                        },
                        {
                            "key": "threshServingLowQ",
                            "value": 1000,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "transmissionMode",
                    "value": "TRANSMISSION_MODE_3",
                    "datatype": null
                },
                {
                    "key": "iuaEnabled",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "systemInformationBlock8",
                    "value": [
                        {
                            "key": "searchWindowSizeCdma",
                            "value": 8,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdma1xRtt",
                            "value": 2,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdma1xRttSfHigh",
                            "value": 100,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdma1xRttSfMedium",
                            "value": 100,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdmaHrpd",
                            "value": 2,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdmaHrpdSfHigh",
                            "value": 100,
                            "datatype": null
                        },
                        {
                            "key": "tReselectionCdmaHrpdSfMedium",
                            "value": 100,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "noOfChannelSelectionSets",
                    "value": 4,
                    "datatype": null
                },
                {
                    "key": "useBandPrioritiesInSib1",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "mobCtrlAtPoorCovActive",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "interEnbUlCompUserSelSinrThr",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "ulTxPsdDistrThr",
                    "value": 40,
                    "datatype": null
                },
                {
                    "key": "ulSchedCtrlForOocUesEnabled",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "dlInternalChannelBandwidth",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "qRxLevMin",
                    "value": -140,
                    "datatype": null
                },
                {
                    "key": "acBarringForCsfb",
                    "value": [
                        {
                            "key": "acBarringFactor",
                            "value": 95,
                            "datatype": null
                        },
                        {
                            "key": "acBarringForSpecialAC",
                            "value": [
                                false,
                                false,
                                false,
                                false,
                                false
                            ],
                            "datatype": null
                        },
                        {
                            "key": "acBarringTime",
                            "value": 64,
                            "datatype": null
                        }
                    ],
                    "datatype": null
                },
                {
                    "key": "acBarringSkipForMmtelVoice",
                    "value": false,
                    "datatype": null
                },
                {
                    "key": "loadBasedBarringFactor",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "maxNoClusteredPuschAlloc",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "confidence",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "qRxLevMinCe",
                    "value": -140,
                    "datatype": null
                },
                {
                    "key": "ulTrigActive",
                    "value": true,
                    "datatype": null
                },
                {
                    "key": "hoOptAdjThresholdPerc",
                    "value": 50,
                    "datatype": null
                },
                {
                    "key": "pdcchOuterLoopInitialAdjVolte",
                    "value": -70,
                    "datatype": null
                },
                {
                    "key": "pMaxServingCell",
                    "value": 1000,
                    "datatype": null
                },
                {
                    "key": "dlPowerRampUpRate",
                    "value": 1,
                    "datatype": null
                },
                {
                    "key": "pdcchTargetBler",
                    "value": 24,
                    "datatype": null
                },
                {
                    "key": "bsrThreshold",
                    "value": 0,
                    "datatype": null
                },
                {
                    "key": "iuaMaxPrbsPerUe",
                    "value": 20,
                    "datatype": null
                },
                {
                    "key": "dlPowerRampUpInitialRatio",
                    "value": 100,
                    "datatype": null
                },
                {
                    "key": "noOfPucchSrUsers",
                    "value": 160,
                    "datatype": null
                },
                {
                    "key": "lastModification",
                    "value": "OPERATOR",
                    "datatype": null
                },
                {
                    "key": "pZeroNominalPucch",
                    "value": -117,
                    "datatype": null
                },
                {
                    "key": "rachRootSequence",
                    "value": 386,
                    "datatype": null
                },
                {
                    "key": "dlFrequencyAllocationProportion",
                    "value": 100,
                    "datatype": null
                }
            ],
            "networkDetails": [
                {
                    "key": "syncStatus",
                    "value": "SYNCHRONIZED"
                },
                {
                    "key": "ipAddress",
                    "value": "192.168.102.125"
                },
                {
                    "key": "managementState",
                    "value": "NORMAL"
                }
            ]
        },
            {
                "name": "LTE01dg2ERBS00001-2",
                "type": "EUtranCellFDD",
                "poId": 281474989610529,
                "id": "281474989610529",
                "fdn": "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-2",
                "namespace": "Lrat",
                "namespaceVersion": "2.141.0",
                "neType": "RadioNode",
                "attributes": [
                    {
                        "key": "ns05LowBandSchedMode",
                        "value": "ALWAYS_PROHIBIT",
                        "datatype": null
                    },
                    {
                        "key": "ulInterferenceManagementActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxResourcePerCell",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchThres",
                        "value": -150,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulHarqVolteBlerTarget",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdj",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "dummyCdmaBandClass",
                        "value": "UNDEFINED_VALUE",
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "cellBarred",
                        "value": "NOT_BARRED",
                        "datatype": null
                    },
                    {
                        "key": "additionalSpectrumEmissionValues",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "preambleInitialReceivedTargetPower",
                        "value": -110,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedSigReduction",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellSubscriptionCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "maxSoftLockBackoffTime",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageThreshold",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "freqBand",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterHo",
                        "value": "NO_TTI_BUNDLING",
                        "datatype": null
                    },
                    {
                        "key": "ailgAutoRestartEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMaxCellSubCap",
                        "value": 1500,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellCoverage",
                        "value": [
                            {
                                "key": "posCellBearing",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellOpeningAngle",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellRadius",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioIFHoSetupBearer",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "elcEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "rtpTimeout",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMajor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMinor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulImprovedUeSchedLastEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "prsPeriod",
                        "value": "PP160",
                        "datatype": null
                    },
                    {
                        "key": "lbabBarringPriorityLevel",
                        "value": "PRIORITY0",
                        "datatype": null
                    },
                    {
                        "key": "operationalState",
                        "value": "ENABLED",
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredErabAction",
                        "value": "REJECT",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStep",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "puschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "maxValidSubframeDlBr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "latitude",
                        "value": 53409290,
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVoice",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eDrxAllowed",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "covTriggerdBlindHoAllowed",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoData",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndex",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnReservedList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrThr",
                        "value": 150,
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "otdoaCheckEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerPCell",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType8TxFDD",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "modificationPeriodCoeff",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16TrTm9",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellIdGroup",
                        "value": 49,
                        "datatype": null
                    },
                    {
                        "key": "ulChannelBandwidth",
                        "value": 10000,
                        "datatype": null
                    },
                    {
                        "key": "additionalMultipleNSPmax",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "deallocThrPucchFormat1",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "timeOfLastModification",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "highestSupportedCeLevelBr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxSentCrsAssistCells",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "uncertAltitude",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tUeBlockingTimer",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "reservedBy",
                        "value": [
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-1,EUtranFreqRelation=1,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-3,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-4,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-5,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-6,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-7,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-8,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-9,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-10,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-11,EUtranFreqRelation=1,EUtranCellRelation=2",
                            "ManagedElement=LTE01dg2ERBS00001,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00001-12,EUtranFreqRelation=1,EUtranCellRelation=2"
                        ],
                        "datatype": null
                    },
                    {
                        "key": "qciTableRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "mbsfnSubframesForTm9",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPattern",
                        "value": "1",
                        "datatype": null
                    },
                    {
                        "key": "sectorCarrierRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinOffset",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary33",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary32",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary31",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary30",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "rateShapingActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "channelSelectionSetSize",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "activePlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 353,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 57,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerVolte",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "cellRange",
                        "value": 15,
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicity",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pciConflictCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "mappingInfoCe",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ailgActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "administrativeState",
                        "value": "UNLOCKED",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeHigh",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPercQci1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupAction",
                        "value": "NO_ACTION",
                        "datatype": null
                    },
                    {
                        "key": "siWindowLength",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "siValidityTimeBr",
                        "value": "VALIDITY_TIME_3H",
                        "datatype": null
                    },
                    {
                        "key": "ulSrsEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdschTypeBGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbUtranOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "deallocTimerPucchFormat1",
                        "value": 6000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary43",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary42",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ulSCellPriority",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary41",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellId",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "enableSinrUplinkClpc",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srProcessingLevel",
                        "value": "NO_ADDITIONAL_SR_NEEDED",
                        "datatype": null
                    },
                    {
                        "key": "acBarringInfoPresent",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tm9Tm4ModeSwitchingEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateHigh",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchHyst",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "interferenceThresholdSinrClpc",
                        "value": -105,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16Tr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnAlarmSuppr",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "liteMcsReduction",
                        "value": "ON",
                        "datatype": null
                    },
                    {
                        "key": "qQualMin",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0Seconds",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "userLabel",
                        "value": "LTE01dg2ERBS00001-2",
                        "datatype": null
                    },
                    {
                        "key": "expectedMaxNoOfUsersInCell",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary17",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary14",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "dlConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnReserved",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pucchOverdimensioning",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "cioLowerLimitAdjBySon",
                        "value": -3,
                        "datatype": null
                    },
                    {
                        "key": "puschPwrOffset64qam",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchCqiUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatTime",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjPCell",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "drxActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cfraEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlFilterConst",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranCellOffloadCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "enableServiceSpecificHARQ",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVideo",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srDetectHighThres",
                        "value": 70,
                        "datatype": null
                    },
                    {
                        "key": "alpha",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "catmMbmsDlSubframes",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0DecimalSecond",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "availabilityStatus",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "validDlBrSubframes",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNum",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "tReorderingAutoConfiguration",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "spifhoSetupBearerAtInitialCtxtSetup",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary29",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandSchedEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "bcCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepPCell",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary24",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary23",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "primaryPsdOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary22",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary21",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "prsPowerBoosting",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulPsdLoadThresholdSinrClpc",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "noOfEnhAdptReTxCand",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPatternLen",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedAdaptiveDrx",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "isDlOnly",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tTimeAlignmentTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dlInterferenceManagementActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prsTransmisScheme",
                        "value": "ANTENNA_SWITCHING",
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVideo",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForEmergency",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prioAdditionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "emergencyAreaId",
                        "value": [
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThresHyst",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "rxSinrTargetClpc",
                        "value": 25,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "threshServingLow",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dynUlResourceAllocEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mappingInfo",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary79",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pciConflict",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary78",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary77",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary76",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValueCa",
                        "value": "CA_NS_31",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary75",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary74",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandUsersInCellThres",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary73",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary72",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterReest",
                        "value": "TTI_BUNDLING_SOURCE_REEST_ONLY",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary71",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "noOfUlImprovedUe",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary70",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "caPrioThreshold",
                        "value": 300,
                        "datatype": null
                    },
                    {
                        "key": "cellDownlinkCaCapacity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetDl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupSensitivity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "puschNcpChannelEstWindowSize",
                        "value": "NORMAL_SIZE",
                        "datatype": null
                    },
                    {
                        "key": "initialBufferSizeDefault",
                        "value": 86,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio1",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio2",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchFormat3PrbPairs",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "allocThrPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoSignalling",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinMaxWriProt",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbTpRankThreshMin",
                        "value": -20,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerSubCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabIncr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetUl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "acBarringPresence",
                        "value": [
                            {
                                "key": "acBarringForCsfbPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVideoPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVoicePresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoDataPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoSignPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityCsfb",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVideo",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVoice",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoData",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoSignaling",
                                "value": "PRIORITY0",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "sdmActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThres",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary82",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary81",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary80",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "arpPriorityLevelForSPIFHo",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prioHpueCapability",
                        "value": "NO_PRIORITIZATION",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeLow",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranTriggerOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "allocTimerPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "diffAdmCtrlFilteringProfRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveDtx",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cioUpperLimitAdjBySon",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveSrb",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "activeServiceAreaId",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "estCellCapUsableFraction",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary59",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbs",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary57",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary56",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinCellSubCap",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnAlarmSupprList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabDecr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary50",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdcchLaGinrMargin",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageSrTimerPeriodicity",
                        "value": 320,
                        "datatype": null
                    },
                    {
                        "key": "multipleNSPmaxReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabPeriod",
                        "value": 120,
                        "datatype": null
                    },
                    {
                        "key": "dlBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCfiMode",
                        "value": "CFI_STATIC_BY_BW",
                        "datatype": null
                    },
                    {
                        "key": "otdoaSuplActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbsQci1",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "adaptiveCfiHoProhibit",
                        "value": "NO_HO_PROHIBIT_CFI",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateLow",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranAcceptOffloadThreshold",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "spectrumEmissionReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "earfcndl",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary69",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "commonSrPeriodicity",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary68",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "orientMajorAxis",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary67",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary66",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "eUtranCellFDDId",
                        "value": "LTE01dg2ERBS00001-2",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary65",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary64",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary63",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ul64qamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary62",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "lessPrbUsageThreshold",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary61",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary60",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "includeLcgInMacUeThp",
                        "value": [
                            false,
                            false,
                            true,
                            true
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "schedulingInfoSib1BrMod",
                        "value": "OFF",
                        "datatype": null
                    },
                    {
                        "key": "hostingDigitalUnit",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "initCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupCellRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "earfcnul",
                        "value": 18001,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioRedirectEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dl256QamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ailgRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "elcLongDrxCycle",
                        "value": "SF40",
                        "datatype": null
                    },
                    {
                        "key": "resourcePartitionGroupRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "crsGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "measBasedElcControl",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dlChannelBandwidth",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPusch",
                        "value": -103,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForSms",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellPolygon",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchTimeToTrigger",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "idleModePrioAtReleaseRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "tac",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "ns05PathlossOffsetThres",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "changeNotification",
                        "value": [
                            {
                                "key": "changeNotificationSIB1",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB13",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB15",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB16",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB2",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB3",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB4",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB5",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB6",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB7",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB8",
                                "value": true,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "minBestCellHoAttempts",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "noConsecutiveSubframes",
                        "value": "SF1",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepVolte",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "srvccDelayTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNumQci1",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "longitude",
                        "value": -7937222,
                        "datatype": null
                    },
                    {
                        "key": "clusteredPuschMprFactor",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "lbTpNonQualFraction",
                        "value": 35,
                        "datatype": null
                    },
                    {
                        "key": "pciDetectingCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "frameStartOffset",
                        "value": [
                            {
                                "key": "subFrameOffset",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicityBr",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchPowerBoostMax",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndexMapped",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qQualMinOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredIFHo",
                        "value": "QCI",
                        "datatype": null
                    },
                    {
                        "key": "qQualMinRsrqCe",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValue",
                        "value": "NS_01",
                        "datatype": null
                    },
                    {
                        "key": "additionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "lastSchedLinkAdaptEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "highSpeedUEActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "iuaInterval",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "catm1SupportEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "altitude",
                        "value": 78,
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupUeRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "prescheduling",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock7",
                        "value": [
                            {
                                "key": "tReselectionGeran",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock6",
                        "value": [
                            {
                                "key": "tReselectionUtra",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "enableDrxAwareRlcArq",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveQci1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock3",
                        "value": [
                            {
                                "key": "nCellChangeHigh",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "nCellChangeMedium",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "qHyst",
                                "value": 4,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfHigh",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfMedium",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearch",
                                "value": 1000,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchP",
                                "value": 62,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearch",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchP",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "tEvaluation",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "tHystNormal",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "threshServingLowQ",
                                "value": 1000,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "transmissionMode",
                        "value": "TRANSMISSION_MODE_3",
                        "datatype": null
                    },
                    {
                        "key": "iuaEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock8",
                        "value": [
                            {
                                "key": "searchWindowSizeCdma",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRtt",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfMedium",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpd",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "noOfChannelSelectionSets",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "useBandPrioritiesInSib1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mobCtrlAtPoorCovActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrThr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "ulTxPsdDistrThr",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "ulSchedCtrlForOocUesEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dlInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMin",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForCsfb",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVoice",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "loadBasedBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxNoClusteredPuschAlloc",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "confidence",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinCe",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "ulTrigActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPerc",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjVolte",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "pMaxServingCell",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpRate",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBler",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "bsrThreshold",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxPrbsPerUe",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpInitialRatio",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchSrUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "lastModification",
                        "value": "OPERATOR",
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPucch",
                        "value": -117,
                        "datatype": null
                    },
                    {
                        "key": "rachRootSequence",
                        "value": 386,
                        "datatype": null
                    },
                    {
                        "key": "dlFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    }
                ],
                "networkDetails": [
                    {
                        "key": "syncStatus",
                        "value": "SYNCHRONIZED"
                    },
                    {
                        "key": "ipAddress",
                        "value": "192.168.102.125"
                    },
                    {
                        "key": "managementState",
                        "value": "NORMAL"
                    }
                ]
            },
            {
                "name": "LTE01dg2ERBS00002-1",
                "type": "EUtranCellFDD",
                "poId": 281474989607533,
                "id": "281474989607533",
                "fdn": "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-1",
                "namespace": "Lrat",
                "namespaceVersion": "2.141.0",
                "neType": "RadioNode",
                "attributes": [
                    {
                        "key": "ns05LowBandSchedMode",
                        "value": "ALWAYS_PROHIBIT",
                        "datatype": null
                    },
                    {
                        "key": "ulInterferenceManagementActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxResourcePerCell",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchThres",
                        "value": -150,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulHarqVolteBlerTarget",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdj",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "dummyCdmaBandClass",
                        "value": "UNDEFINED_VALUE",
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "cellBarred",
                        "value": "NOT_BARRED",
                        "datatype": null
                    },
                    {
                        "key": "additionalSpectrumEmissionValues",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "preambleInitialReceivedTargetPower",
                        "value": -110,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedSigReduction",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellSubscriptionCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "maxSoftLockBackoffTime",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageThreshold",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "freqBand",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterHo",
                        "value": "NO_TTI_BUNDLING",
                        "datatype": null
                    },
                    {
                        "key": "ailgAutoRestartEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMaxCellSubCap",
                        "value": 1500,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellCoverage",
                        "value": [
                            {
                                "key": "posCellBearing",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellOpeningAngle",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellRadius",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioIFHoSetupBearer",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "elcEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "rtpTimeout",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMajor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMinor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulImprovedUeSchedLastEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "prsPeriod",
                        "value": "PP160",
                        "datatype": null
                    },
                    {
                        "key": "lbabBarringPriorityLevel",
                        "value": "PRIORITY0",
                        "datatype": null
                    },
                    {
                        "key": "operationalState",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredErabAction",
                        "value": "REJECT",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStep",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "puschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "maxValidSubframeDlBr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "latitude",
                        "value": 53422765,
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVoice",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eDrxAllowed",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "covTriggerdBlindHoAllowed",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoData",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndex",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnReservedList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrThr",
                        "value": 150,
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "otdoaCheckEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerPCell",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType8TxFDD",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "modificationPeriodCoeff",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16TrTm9",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellIdGroup",
                        "value": 7,
                        "datatype": null
                    },
                    {
                        "key": "ulChannelBandwidth",
                        "value": 10000,
                        "datatype": null
                    },
                    {
                        "key": "additionalMultipleNSPmax",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "deallocThrPucchFormat1",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "timeOfLastModification",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "highestSupportedCeLevelBr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxSentCrsAssistCells",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "uncertAltitude",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tUeBlockingTimer",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "reservedBy",
                        "value": [
                            "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-2,EUtranFreqRelation=2,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-3,EUtranFreqRelation=2,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-4,EUtranFreqRelation=2,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-5,EUtranFreqRelation=2,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00002,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00002-6,EUtranFreqRelation=2,EUtranCellRelation=1"
                        ],
                        "datatype": null
                    },
                    {
                        "key": "qciTableRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "mbsfnSubframesForTm9",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPattern",
                        "value": "1",
                        "datatype": null
                    },
                    {
                        "key": "sectorCarrierRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinOffset",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary33",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary32",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary31",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary30",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "rateShapingActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "channelSelectionSetSize",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "activePlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 353,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 57,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerVolte",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "cellRange",
                        "value": 15,
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicity",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pciConflictCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "mappingInfoCe",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ailgActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "administrativeState",
                        "value": "UNLOCKED",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeHigh",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPercQci1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupAction",
                        "value": "NO_ACTION",
                        "datatype": null
                    },
                    {
                        "key": "siWindowLength",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "siValidityTimeBr",
                        "value": "VALIDITY_TIME_3H",
                        "datatype": null
                    },
                    {
                        "key": "ulSrsEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdschTypeBGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbUtranOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "deallocTimerPucchFormat1",
                        "value": 6000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary43",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary42",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ulSCellPriority",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary41",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellId",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableSinrUplinkClpc",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srProcessingLevel",
                        "value": "NO_ADDITIONAL_SR_NEEDED",
                        "datatype": null
                    },
                    {
                        "key": "acBarringInfoPresent",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tm9Tm4ModeSwitchingEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateHigh",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchHyst",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "interferenceThresholdSinrClpc",
                        "value": -105,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16Tr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnAlarmSuppr",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "liteMcsReduction",
                        "value": "ON",
                        "datatype": null
                    },
                    {
                        "key": "qQualMin",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0Seconds",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "userLabel",
                        "value": "LTE01dg2ERBS00002-1",
                        "datatype": null
                    },
                    {
                        "key": "expectedMaxNoOfUsersInCell",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary17",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary14",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "dlConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnReserved",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pucchOverdimensioning",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "cioLowerLimitAdjBySon",
                        "value": -3,
                        "datatype": null
                    },
                    {
                        "key": "puschPwrOffset64qam",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchCqiUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatTime",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjPCell",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "drxActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cfraEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlFilterConst",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranCellOffloadCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "enableServiceSpecificHARQ",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVideo",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srDetectHighThres",
                        "value": 70,
                        "datatype": null
                    },
                    {
                        "key": "alpha",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "catmMbmsDlSubframes",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0DecimalSecond",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "availabilityStatus",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "validDlBrSubframes",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNum",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "tReorderingAutoConfiguration",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "spifhoSetupBearerAtInitialCtxtSetup",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary29",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandSchedEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "bcCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepPCell",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary24",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary23",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "primaryPsdOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary22",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary21",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "prsPowerBoosting",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulPsdLoadThresholdSinrClpc",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "noOfEnhAdptReTxCand",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPatternLen",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedAdaptiveDrx",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "isDlOnly",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tTimeAlignmentTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dlInterferenceManagementActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prsTransmisScheme",
                        "value": "ANTENNA_SWITCHING",
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVideo",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForEmergency",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prioAdditionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "emergencyAreaId",
                        "value": [
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThresHyst",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "rxSinrTargetClpc",
                        "value": 25,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "threshServingLow",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dynUlResourceAllocEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mappingInfo",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary79",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pciConflict",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary78",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary77",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary76",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValueCa",
                        "value": "CA_NS_31",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary75",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary74",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandUsersInCellThres",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary73",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary72",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterReest",
                        "value": "TTI_BUNDLING_SOURCE_REEST_ONLY",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary71",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "noOfUlImprovedUe",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary70",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "caPrioThreshold",
                        "value": 300,
                        "datatype": null
                    },
                    {
                        "key": "cellDownlinkCaCapacity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetDl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupSensitivity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "puschNcpChannelEstWindowSize",
                        "value": "NORMAL_SIZE",
                        "datatype": null
                    },
                    {
                        "key": "initialBufferSizeDefault",
                        "value": 86,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio1",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio2",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchFormat3PrbPairs",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "allocThrPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoSignalling",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinMaxWriProt",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbTpRankThreshMin",
                        "value": -20,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerSubCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabIncr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetUl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "acBarringPresence",
                        "value": [
                            {
                                "key": "acBarringForCsfbPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVideoPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVoicePresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoDataPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoSignPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityCsfb",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVideo",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVoice",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoData",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoSignaling",
                                "value": "PRIORITY0",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "sdmActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThres",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary82",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary81",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary80",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "arpPriorityLevelForSPIFHo",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prioHpueCapability",
                        "value": "NO_PRIORITIZATION",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeLow",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranTriggerOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "allocTimerPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "diffAdmCtrlFilteringProfRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveDtx",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cioUpperLimitAdjBySon",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveSrb",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "activeServiceAreaId",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "estCellCapUsableFraction",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary59",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbs",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary57",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary56",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinCellSubCap",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnAlarmSupprList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabDecr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary50",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdcchLaGinrMargin",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageSrTimerPeriodicity",
                        "value": 320,
                        "datatype": null
                    },
                    {
                        "key": "multipleNSPmaxReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabPeriod",
                        "value": 120,
                        "datatype": null
                    },
                    {
                        "key": "dlBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCfiMode",
                        "value": "CFI_STATIC_BY_BW",
                        "datatype": null
                    },
                    {
                        "key": "otdoaSuplActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbsQci1",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "adaptiveCfiHoProhibit",
                        "value": "NO_HO_PROHIBIT_CFI",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateLow",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranAcceptOffloadThreshold",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "spectrumEmissionReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "earfcndl",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary69",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "commonSrPeriodicity",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary68",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "orientMajorAxis",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary67",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary66",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "eUtranCellFDDId",
                        "value": "LTE01dg2ERBS00002-1",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary65",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary64",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary63",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ul64qamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary62",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "lessPrbUsageThreshold",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary61",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary60",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "includeLcgInMacUeThp",
                        "value": [
                            false,
                            false,
                            true,
                            true
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "schedulingInfoSib1BrMod",
                        "value": "OFF",
                        "datatype": null
                    },
                    {
                        "key": "hostingDigitalUnit",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "initCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupCellRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "earfcnul",
                        "value": 18002,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioRedirectEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dl256QamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ailgRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "elcLongDrxCycle",
                        "value": "SF40",
                        "datatype": null
                    },
                    {
                        "key": "resourcePartitionGroupRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "crsGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "measBasedElcControl",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dlChannelBandwidth",
                        "value": 1400,
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPusch",
                        "value": -103,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForSms",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellPolygon",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchTimeToTrigger",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "idleModePrioAtReleaseRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "tac",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "ns05PathlossOffsetThres",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "changeNotification",
                        "value": [
                            {
                                "key": "changeNotificationSIB1",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB13",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB15",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB16",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB2",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB3",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB4",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB5",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB6",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB7",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB8",
                                "value": true,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "minBestCellHoAttempts",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "noConsecutiveSubframes",
                        "value": "SF1",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepVolte",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "srvccDelayTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNumQci1",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "longitude",
                        "value": -7801372,
                        "datatype": null
                    },
                    {
                        "key": "clusteredPuschMprFactor",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "lbTpNonQualFraction",
                        "value": 35,
                        "datatype": null
                    },
                    {
                        "key": "pciDetectingCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "frameStartOffset",
                        "value": [
                            {
                                "key": "subFrameOffset",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicityBr",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchPowerBoostMax",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndexMapped",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qQualMinOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredIFHo",
                        "value": "QCI",
                        "datatype": null
                    },
                    {
                        "key": "qQualMinRsrqCe",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValue",
                        "value": "NS_01",
                        "datatype": null
                    },
                    {
                        "key": "additionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "lastSchedLinkAdaptEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "highSpeedUEActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "iuaInterval",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "catm1SupportEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "altitude",
                        "value": 36,
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupUeRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "prescheduling",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock7",
                        "value": [
                            {
                                "key": "tReselectionGeran",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock6",
                        "value": [
                            {
                                "key": "tReselectionUtra",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "enableDrxAwareRlcArq",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveQci1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock3",
                        "value": [
                            {
                                "key": "nCellChangeHigh",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "nCellChangeMedium",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "qHyst",
                                "value": 4,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfHigh",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfMedium",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearch",
                                "value": 1000,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchP",
                                "value": 62,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearch",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchP",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "tEvaluation",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "tHystNormal",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "threshServingLowQ",
                                "value": 1000,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "transmissionMode",
                        "value": "TRANSMISSION_MODE_3",
                        "datatype": null
                    },
                    {
                        "key": "iuaEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock8",
                        "value": [
                            {
                                "key": "searchWindowSizeCdma",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRtt",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfMedium",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpd",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "noOfChannelSelectionSets",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "useBandPrioritiesInSib1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mobCtrlAtPoorCovActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrThr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "ulTxPsdDistrThr",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "ulSchedCtrlForOocUesEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dlInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMin",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForCsfb",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVoice",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "loadBasedBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxNoClusteredPuschAlloc",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "confidence",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinCe",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "ulTrigActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPerc",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjVolte",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "pMaxServingCell",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpRate",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBler",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "bsrThreshold",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxPrbsPerUe",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpInitialRatio",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchSrUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "lastModification",
                        "value": "OPERATOR",
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPucch",
                        "value": -117,
                        "datatype": null
                    },
                    {
                        "key": "rachRootSequence",
                        "value": 386,
                        "datatype": null
                    },
                    {
                        "key": "dlFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    }
                ],
                "networkDetails": [
                    {
                        "key": "syncStatus",
                        "value": "SYNCHRONIZED"
                    },
                    {
                        "key": "ipAddress",
                        "value": "192.168.102.126"
                    },
                    {
                        "key": "managementState",
                        "value": "NORMAL"
                    }
                ]
            },

            {
                "name": "LTE01dg2ERBS00003-1",
                "type": "EUtranCellFDD",
                "poId": 281474989601024,
                "id": "281474989601024",
                "fdn": "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-1",
                "namespace": "Lrat",
                "namespaceVersion": "2.141.0",
                "neType": "RadioNode",
                "attributes": [
                    {
                        "key": "ns05LowBandSchedMode",
                        "value": "ALWAYS_PROHIBIT",
                        "datatype": null
                    },
                    {
                        "key": "ulInterferenceManagementActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxResourcePerCell",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchThres",
                        "value": -150,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulHarqVolteBlerTarget",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdj",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "dummyCdmaBandClass",
                        "value": "UNDEFINED_VALUE",
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "cellBarred",
                        "value": "NOT_BARRED",
                        "datatype": null
                    },
                    {
                        "key": "additionalSpectrumEmissionValues",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "preambleInitialReceivedTargetPower",
                        "value": -110,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedSigReduction",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellSubscriptionCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "maxSoftLockBackoffTime",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageThreshold",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "freqBand",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterHo",
                        "value": "NO_TTI_BUNDLING",
                        "datatype": null
                    },
                    {
                        "key": "ailgAutoRestartEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMaxCellSubCap",
                        "value": 1500,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellCoverage",
                        "value": [
                            {
                                "key": "posCellBearing",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellOpeningAngle",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellRadius",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioIFHoSetupBearer",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "elcEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "rtpTimeout",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMajor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMinor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulImprovedUeSchedLastEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "prsPeriod",
                        "value": "PP160",
                        "datatype": null
                    },
                    {
                        "key": "lbabBarringPriorityLevel",
                        "value": "PRIORITY0",
                        "datatype": null
                    },
                    {
                        "key": "operationalState",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredErabAction",
                        "value": "REJECT",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStep",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "puschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "maxValidSubframeDlBr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "latitude",
                        "value": 53422758,
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVoice",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eDrxAllowed",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "covTriggerdBlindHoAllowed",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoData",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndex",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnReservedList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrThr",
                        "value": 150,
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "otdoaCheckEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerPCell",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType8TxFDD",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "modificationPeriodCoeff",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16TrTm9",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellIdGroup",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "ulChannelBandwidth",
                        "value": 10000,
                        "datatype": null
                    },
                    {
                        "key": "additionalMultipleNSPmax",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "deallocThrPucchFormat1",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "timeOfLastModification",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "highestSupportedCeLevelBr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxSentCrsAssistCells",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "uncertAltitude",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tUeBlockingTimer",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "reservedBy",
                        "value": [
                            "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-2,EUtranFreqRelation=3,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-3,EUtranFreqRelation=3,EUtranCellRelation=1"
                        ],
                        "datatype": null
                    },
                    {
                        "key": "qciTableRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "mbsfnSubframesForTm9",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPattern",
                        "value": "1",
                        "datatype": null
                    },
                    {
                        "key": "sectorCarrierRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinOffset",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary33",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary32",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary31",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary30",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "rateShapingActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "channelSelectionSetSize",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "activePlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 353,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 57,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerVolte",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "cellRange",
                        "value": 15,
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicity",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pciConflictCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "mappingInfoCe",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ailgActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "administrativeState",
                        "value": "UNLOCKED",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeHigh",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPercQci1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupAction",
                        "value": "NO_ACTION",
                        "datatype": null
                    },
                    {
                        "key": "siWindowLength",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "siValidityTimeBr",
                        "value": "VALIDITY_TIME_3H",
                        "datatype": null
                    },
                    {
                        "key": "ulSrsEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdschTypeBGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbUtranOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "deallocTimerPucchFormat1",
                        "value": 6000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary43",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary42",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ulSCellPriority",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary41",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellId",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableSinrUplinkClpc",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srProcessingLevel",
                        "value": "NO_ADDITIONAL_SR_NEEDED",
                        "datatype": null
                    },
                    {
                        "key": "acBarringInfoPresent",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tm9Tm4ModeSwitchingEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateHigh",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchHyst",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "interferenceThresholdSinrClpc",
                        "value": -105,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16Tr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnAlarmSuppr",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "liteMcsReduction",
                        "value": "ON",
                        "datatype": null
                    },
                    {
                        "key": "qQualMin",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0Seconds",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "userLabel",
                        "value": "LTE01dg2ERBS00003-1",
                        "datatype": null
                    },
                    {
                        "key": "expectedMaxNoOfUsersInCell",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary17",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary14",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "dlConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnReserved",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pucchOverdimensioning",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "cioLowerLimitAdjBySon",
                        "value": -3,
                        "datatype": null
                    },
                    {
                        "key": "puschPwrOffset64qam",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchCqiUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatTime",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjPCell",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "drxActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cfraEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlFilterConst",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranCellOffloadCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "enableServiceSpecificHARQ",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVideo",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srDetectHighThres",
                        "value": 70,
                        "datatype": null
                    },
                    {
                        "key": "alpha",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "catmMbmsDlSubframes",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0DecimalSecond",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "availabilityStatus",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "validDlBrSubframes",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNum",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "tReorderingAutoConfiguration",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "spifhoSetupBearerAtInitialCtxtSetup",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary29",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandSchedEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "bcCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepPCell",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary24",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary23",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "primaryPsdOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary22",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary21",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "prsPowerBoosting",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulPsdLoadThresholdSinrClpc",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "noOfEnhAdptReTxCand",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPatternLen",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedAdaptiveDrx",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "isDlOnly",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tTimeAlignmentTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dlInterferenceManagementActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prsTransmisScheme",
                        "value": "ANTENNA_SWITCHING",
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVideo",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForEmergency",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prioAdditionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "emergencyAreaId",
                        "value": [
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThresHyst",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "rxSinrTargetClpc",
                        "value": 25,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "threshServingLow",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dynUlResourceAllocEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mappingInfo",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary79",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pciConflict",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary78",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary77",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary76",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValueCa",
                        "value": "CA_NS_31",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary75",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary74",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandUsersInCellThres",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary73",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary72",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterReest",
                        "value": "TTI_BUNDLING_SOURCE_REEST_ONLY",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary71",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "noOfUlImprovedUe",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary70",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "caPrioThreshold",
                        "value": 300,
                        "datatype": null
                    },
                    {
                        "key": "cellDownlinkCaCapacity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetDl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupSensitivity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "puschNcpChannelEstWindowSize",
                        "value": "NORMAL_SIZE",
                        "datatype": null
                    },
                    {
                        "key": "initialBufferSizeDefault",
                        "value": 86,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio1",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio2",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchFormat3PrbPairs",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "allocThrPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoSignalling",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinMaxWriProt",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbTpRankThreshMin",
                        "value": -20,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerSubCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabIncr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetUl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "acBarringPresence",
                        "value": [
                            {
                                "key": "acBarringForCsfbPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVideoPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVoicePresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoDataPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoSignPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityCsfb",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVideo",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVoice",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoData",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoSignaling",
                                "value": "PRIORITY0",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "sdmActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThres",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary82",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary81",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary80",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "arpPriorityLevelForSPIFHo",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prioHpueCapability",
                        "value": "NO_PRIORITIZATION",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeLow",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranTriggerOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "allocTimerPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "diffAdmCtrlFilteringProfRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveDtx",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cioUpperLimitAdjBySon",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveSrb",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "activeServiceAreaId",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "estCellCapUsableFraction",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary59",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbs",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary57",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary56",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinCellSubCap",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnAlarmSupprList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabDecr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary50",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdcchLaGinrMargin",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageSrTimerPeriodicity",
                        "value": 320,
                        "datatype": null
                    },
                    {
                        "key": "multipleNSPmaxReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabPeriod",
                        "value": 120,
                        "datatype": null
                    },
                    {
                        "key": "dlBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCfiMode",
                        "value": "CFI_STATIC_BY_BW",
                        "datatype": null
                    },
                    {
                        "key": "otdoaSuplActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbsQci1",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "adaptiveCfiHoProhibit",
                        "value": "NO_HO_PROHIBIT_CFI",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateLow",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranAcceptOffloadThreshold",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "spectrumEmissionReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "earfcndl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary69",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "commonSrPeriodicity",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary68",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "orientMajorAxis",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary67",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary66",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "eUtranCellFDDId",
                        "value": "LTE01dg2ERBS00003-1",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary65",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary64",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary63",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ul64qamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary62",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "lessPrbUsageThreshold",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary61",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary60",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "includeLcgInMacUeThp",
                        "value": [
                            false,
                            false,
                            true,
                            true
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "schedulingInfoSib1BrMod",
                        "value": "OFF",
                        "datatype": null
                    },
                    {
                        "key": "hostingDigitalUnit",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "initCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupCellRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "earfcnul",
                        "value": 18003,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioRedirectEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dl256QamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ailgRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "elcLongDrxCycle",
                        "value": "SF40",
                        "datatype": null
                    },
                    {
                        "key": "resourcePartitionGroupRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "crsGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "measBasedElcControl",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dlChannelBandwidth",
                        "value": 1400,
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPusch",
                        "value": -103,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForSms",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellPolygon",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchTimeToTrigger",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "idleModePrioAtReleaseRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "tac",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "ns05PathlossOffsetThres",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "changeNotification",
                        "value": [
                            {
                                "key": "changeNotificationSIB1",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB13",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB15",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB16",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB2",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB3",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB4",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB5",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB6",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB7",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB8",
                                "value": true,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "minBestCellHoAttempts",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "noConsecutiveSubframes",
                        "value": "SF1",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepVolte",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "srvccDelayTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNumQci1",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "longitude",
                        "value": -7733447,
                        "datatype": null
                    },
                    {
                        "key": "clusteredPuschMprFactor",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "lbTpNonQualFraction",
                        "value": 35,
                        "datatype": null
                    },
                    {
                        "key": "pciDetectingCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "frameStartOffset",
                        "value": [
                            {
                                "key": "subFrameOffset",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicityBr",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchPowerBoostMax",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndexMapped",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qQualMinOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredIFHo",
                        "value": "QCI",
                        "datatype": null
                    },
                    {
                        "key": "qQualMinRsrqCe",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValue",
                        "value": "NS_01",
                        "datatype": null
                    },
                    {
                        "key": "additionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "lastSchedLinkAdaptEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "highSpeedUEActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "iuaInterval",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "catm1SupportEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "altitude",
                        "value": 39,
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupUeRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "prescheduling",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock7",
                        "value": [
                            {
                                "key": "tReselectionGeran",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock6",
                        "value": [
                            {
                                "key": "tReselectionUtra",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "enableDrxAwareRlcArq",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveQci1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock3",
                        "value": [
                            {
                                "key": "nCellChangeHigh",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "nCellChangeMedium",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "qHyst",
                                "value": 4,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfHigh",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfMedium",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearch",
                                "value": 1000,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchP",
                                "value": 62,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearch",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchP",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "tEvaluation",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "tHystNormal",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "threshServingLowQ",
                                "value": 1000,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "transmissionMode",
                        "value": "TRANSMISSION_MODE_3",
                        "datatype": null
                    },
                    {
                        "key": "iuaEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock8",
                        "value": [
                            {
                                "key": "searchWindowSizeCdma",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRtt",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfMedium",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpd",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "noOfChannelSelectionSets",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "useBandPrioritiesInSib1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mobCtrlAtPoorCovActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrThr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "ulTxPsdDistrThr",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "ulSchedCtrlForOocUesEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dlInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMin",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForCsfb",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVoice",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "loadBasedBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxNoClusteredPuschAlloc",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "confidence",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinCe",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "ulTrigActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPerc",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjVolte",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "pMaxServingCell",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpRate",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBler",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "bsrThreshold",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxPrbsPerUe",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpInitialRatio",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchSrUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "lastModification",
                        "value": "OPERATOR",
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPucch",
                        "value": -117,
                        "datatype": null
                    },
                    {
                        "key": "rachRootSequence",
                        "value": 386,
                        "datatype": null
                    },
                    {
                        "key": "dlFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    }
                ],
                "networkDetails": [
                    {
                        "key": "syncStatus",
                        "value": "SYNCHRONIZED"
                    },
                    {
                        "key": "ipAddress",
                        "value": "192.168.102.127"
                    },
                    {
                        "key": "managementState",
                        "value": "NORMAL"
                    }
                ]
            },

            {
                "name": "LTE01dg2ERBS00003-2",
                "type": "EUtranCellFDD",
                "poId": 281474989600597,
                "id": "281474989600597",
                "fdn": "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-2",
                "namespace": "Lrat",
                "namespaceVersion": "2.141.0",
                "neType": "RadioNode",
                "attributes": [
                    {
                        "key": "ns05LowBandSchedMode",
                        "value": "ALWAYS_PROHIBIT",
                        "datatype": null
                    },
                    {
                        "key": "ulInterferenceManagementActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxResourcePerCell",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchThres",
                        "value": -150,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulHarqVolteBlerTarget",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdj",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "dummyCdmaBandClass",
                        "value": "UNDEFINED_VALUE",
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "cellBarred",
                        "value": "NOT_BARRED",
                        "datatype": null
                    },
                    {
                        "key": "additionalSpectrumEmissionValues",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "preambleInitialReceivedTargetPower",
                        "value": -110,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedSigReduction",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellSubscriptionCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "maxSoftLockBackoffTime",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageThreshold",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "freqBand",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterHo",
                        "value": "NO_TTI_BUNDLING",
                        "datatype": null
                    },
                    {
                        "key": "ailgAutoRestartEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMaxCellSubCap",
                        "value": 1500,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellCoverage",
                        "value": [
                            {
                                "key": "posCellBearing",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellOpeningAngle",
                                "value": -1,
                                "datatype": null
                            },
                            {
                                "key": "posCellRadius",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioIFHoSetupBearer",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "elcEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "rtpTimeout",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMajor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "uncertSemiMinor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulImprovedUeSchedLastEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "prsPeriod",
                        "value": "PP160",
                        "datatype": null
                    },
                    {
                        "key": "lbabBarringPriorityLevel",
                        "value": "PRIORITY0",
                        "datatype": null
                    },
                    {
                        "key": "operationalState",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredErabAction",
                        "value": "REJECT",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStep",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "puschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "maxValidSubframeDlBr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "latitude",
                        "value": 53409271,
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVoice",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eDrxAllowed",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "covTriggerdBlindHoAllowed",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoData",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndex",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnReservedList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrThr",
                        "value": 150,
                        "datatype": null
                    },
                    {
                        "key": "cceDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "otdoaCheckEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerPCell",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType8TxFDD",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "modificationPeriodCoeff",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16TrTm9",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerCellIdGroup",
                        "value": 58,
                        "datatype": null
                    },
                    {
                        "key": "ulChannelBandwidth",
                        "value": 10000,
                        "datatype": null
                    },
                    {
                        "key": "additionalMultipleNSPmax",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "deallocThrPucchFormat1",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "timeOfLastModification",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "highestSupportedCeLevelBr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxSentCrsAssistCells",
                        "value": 8,
                        "datatype": null
                    },
                    {
                        "key": "uncertAltitude",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tUeBlockingTimer",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "reservedBy",
                        "value": [
                            "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-1,EUtranFreqRelation=3,EUtranCellRelation=1",
                            "ManagedElement=LTE01dg2ERBS00003,ENodeBFunction=1,EUtranCellFDD=LTE01dg2ERBS00003-3,EUtranFreqRelation=3,EUtranCellRelation=2"
                        ],
                        "datatype": null
                    },
                    {
                        "key": "qciTableRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "mbsfnSubframesForTm9",
                        "value": "DISABLED",
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPattern",
                        "value": "1",
                        "datatype": null
                    },
                    {
                        "key": "sectorCarrierRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinOffset",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary33",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary32",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary31",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary30",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "rateShapingActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "channelSelectionSetSize",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "activePlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 353,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 57,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBlerVolte",
                        "value": 22,
                        "datatype": null
                    },
                    {
                        "key": "cellRange",
                        "value": 15,
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicity",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pciConflictCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "mappingInfoCe",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ailgActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "administrativeState",
                        "value": "UNLOCKED",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeHigh",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPercQci1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupAction",
                        "value": "NO_ACTION",
                        "datatype": null
                    },
                    {
                        "key": "siWindowLength",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "siValidityTimeBr",
                        "value": "VALIDITY_TIME_3H",
                        "datatype": null
                    },
                    {
                        "key": "ulSrsEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlRetDiffThr",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnList",
                        "value": [
                            [
                                {
                                    "key": "mcc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mnc",
                                    "value": 0,
                                    "datatype": null
                                },
                                {
                                    "key": "mncLength",
                                    "value": 2,
                                    "datatype": null
                                }
                            ]
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdschTypeBGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbUtranOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "deallocTimerPucchFormat1",
                        "value": 6000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary43",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary42",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ulSCellPriority",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary41",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellId",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "enableSinrUplinkClpc",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srProcessingLevel",
                        "value": "NO_ADDITIONAL_SR_NEEDED",
                        "datatype": null
                    },
                    {
                        "key": "acBarringInfoPresent",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tm9Tm4ModeSwitchingEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateHigh",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchHyst",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "interferenceThresholdSinrClpc",
                        "value": -105,
                        "datatype": null
                    },
                    {
                        "key": "beamWeightSet16Tr",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnAlarmSuppr",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "liteMcsReduction",
                        "value": "ON",
                        "datatype": null
                    },
                    {
                        "key": "qQualMin",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0Seconds",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "userLabel",
                        "value": "LTE01dg2ERBS00003-2",
                        "datatype": null
                    },
                    {
                        "key": "expectedMaxNoOfUsersInCell",
                        "value": -1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary17",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary14",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "dlConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "primaryPlmnReserved",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pucchOverdimensioning",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "cioLowerLimitAdjBySon",
                        "value": -3,
                        "datatype": null
                    },
                    {
                        "key": "puschPwrOffset64qam",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchCqiUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatTime",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjPCell",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "drxActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cfraEnable",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dynUeAdmCtrlFilterConst",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranCellOffloadCapacity",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "enableServiceSpecificHARQ",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVideo",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "srDetectHighThres",
                        "value": 70,
                        "datatype": null
                    },
                    {
                        "key": "alpha",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "catmMbmsDlSubframes",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "gpsTimeSFN0DecimalSecond",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "availabilityStatus",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "validDlBrSubframes",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNum",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "tReorderingAutoConfiguration",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "spifhoSetupBearerAtInitialCtxtSetup",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary29",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandSchedEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "bcCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepPCell",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary24",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary23",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "primaryPsdOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary22",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary21",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "prsPowerBoosting",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulPsdLoadThresholdSinrClpc",
                        "value": 2,
                        "datatype": null
                    },
                    {
                        "key": "noOfEnhAdptReTxCand",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsMutingPatternLen",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "enableUeAssistedAdaptiveDrx",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "isDlOnly",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "tTimeAlignmentTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dlInterferenceManagementActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prsTransmisScheme",
                        "value": "ANTENNA_SWITCHING",
                        "datatype": null
                    },
                    {
                        "key": "ssacBarringForMMTELVideo",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForEmergency",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "prioAdditionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "emergencyAreaId",
                        "value": [
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1,
                            -1
                        ],
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThresHyst",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "rxSinrTargetClpc",
                        "value": 25,
                        "datatype": null
                    },
                    {
                        "key": "dlDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "threshServingLow",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "dynUlResourceAllocEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mappingInfo",
                        "value": [
                            {
                                "key": "mappingInfoSIB10",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB11",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB12",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB13",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB15",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB16",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB3",
                                "value": "MAPPED_SI_1",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB4",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB5",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB6",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB7",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            },
                            {
                                "key": "mappingInfoSIB8",
                                "value": "NOT_MAPPED",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary79",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pciConflict",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary78",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary77",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary76",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValueCa",
                        "value": "CA_NS_31",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary75",
                        "value": "",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary74",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ns05FullBandUsersInCellThres",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary73",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary72",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingAfterReest",
                        "value": "TTI_BUNDLING_SOURCE_REEST_ONLY",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary71",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "noOfUlImprovedUe",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary70",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "caPrioThreshold",
                        "value": 300,
                        "datatype": null
                    },
                    {
                        "key": "cellDownlinkCaCapacity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetDl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "advCellSupSensitivity",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "puschNcpChannelEstWindowSize",
                        "value": "NORMAL_SIZE",
                        "datatype": null
                    },
                    {
                        "key": "initialBufferSizeDefault",
                        "value": 86,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio1",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabMinBarringFactorPrio2",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchFormat3PrbPairs",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "allocThrPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForMoSignalling",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinMaxWriProt",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "lbTpRankThreshMin",
                        "value": -20,
                        "datatype": null
                    },
                    {
                        "key": "physicalLayerSubCellId",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "lbabIncr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "harqOffsetUl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "acBarringPresence",
                        "value": [
                            {
                                "key": "acBarringForCsfbPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVideoPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMmtelVoicePresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoDataPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringForMoSignPresence",
                                "value": "OFF",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityCsfb",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVideo",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMmtelVoice",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoData",
                                "value": "PRIORITY0",
                                "datatype": null
                            },
                            {
                                "key": "acBarringPriorityMoSignaling",
                                "value": "PRIORITY0",
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "sdmActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "ttiBundlingSwitchThres",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary82",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary81",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdschMaxNrOfPrbsPerUe",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary80",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "arpPriorityLevelForSPIFHo",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "prioHpueCapability",
                        "value": "NO_PRIORITIZATION",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshTimeLow",
                        "value": 30,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranTriggerOffloadThreshold",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "allocTimerPucchFormat1",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "diffAdmCtrlFilteringProfRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveDtx",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "cioUpperLimitAdjBySon",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveSrb",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "activeServiceAreaId",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "estCellCapUsableFraction",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary59",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbs",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary57",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary56",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "cellCapMinCellSubCap",
                        "value": 500,
                        "datatype": null
                    },
                    {
                        "key": "additionalPlmnAlarmSupprList",
                        "value": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabDecr",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary50",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "pdcchLaGinrMargin",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "outOfCoverageSrTimerPeriodicity",
                        "value": 320,
                        "datatype": null
                    },
                    {
                        "key": "multipleNSPmaxReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "lbabPeriod",
                        "value": 120,
                        "datatype": null
                    },
                    {
                        "key": "dlBlerTargetEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCfiMode",
                        "value": "CFI_STATIC_BY_BW",
                        "datatype": null
                    },
                    {
                        "key": "otdoaSuplActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdAbsQci1",
                        "value": 5,
                        "datatype": null
                    },
                    {
                        "key": "adaptiveCfiHoProhibit",
                        "value": "NO_HO_PROHIBIT_CFI",
                        "datatype": null
                    },
                    {
                        "key": "lbabThreshRejectRateLow",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "lbEUtranAcceptOffloadThreshold",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "spectrumEmissionReqMapping",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "earfcndl",
                        "value": 3,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary69",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "commonSrPeriodicity",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary68",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "orientMajorAxis",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulDynUeAdmCtrlOverloadThr",
                        "value": 600,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary67",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary66",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "csiRsConfigType",
                        "value": "NZP_CSIRS",
                        "datatype": null
                    },
                    {
                        "key": "eUtranCellFDDId",
                        "value": "LTE01dg2ERBS00003-2",
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary65",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary64",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary63",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "ul64qamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary62",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "lessPrbUsageThreshold",
                        "value": 90,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary61",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "zzzTemporary60",
                        "value": -2000000000,
                        "datatype": null
                    },
                    {
                        "key": "includeLcgInMacUeThp",
                        "value": [
                            false,
                            false,
                            true,
                            true
                        ],
                        "datatype": null
                    },
                    {
                        "key": "eranUlCompUserSelSinrHys",
                        "value": 10,
                        "datatype": null
                    },
                    {
                        "key": "schedulingInfoSib1BrMod",
                        "value": "OFF",
                        "datatype": null
                    },
                    {
                        "key": "hostingDigitalUnit",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "initCdma2000SysTimeType",
                        "value": "NONE",
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupCellRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "earfcnul",
                        "value": 18003,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioRedirectEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dl256QamEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ailgRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "elcLongDrxCycle",
                        "value": "SF40",
                        "datatype": null
                    },
                    {
                        "key": "resourcePartitionGroupRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "crsGain",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "measBasedElcControl",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "dlChannelBandwidth",
                        "value": 3000,
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPusch",
                        "value": -103,
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForSms",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "eutranCellPolygon",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "hpueCaSwitchTimeToTrigger",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "idleModePrioAtReleaseRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "tac",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "ns05PathlossOffsetThres",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "changeNotification",
                        "value": [
                            {
                                "key": "changeNotificationSIB1",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB13",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB15",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB16",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB2",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB3",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB4",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB5",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB6",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB7",
                                "value": true,
                                "datatype": null
                            },
                            {
                                "key": "changeNotificationSIB8",
                                "value": true,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "minBestCellHoAttempts",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "noConsecutiveSubframes",
                        "value": "SF1",
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopUpStepVolte",
                        "value": 6,
                        "datatype": null
                    },
                    {
                        "key": "srvccDelayTimer",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "hoOptStatNumQci1",
                        "value": 200,
                        "datatype": null
                    },
                    {
                        "key": "longitude",
                        "value": -7733511,
                        "datatype": null
                    },
                    {
                        "key": "clusteredPuschMprFactor",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "lbTpNonQualFraction",
                        "value": 35,
                        "datatype": null
                    },
                    {
                        "key": "pciDetectingCell",
                        "value": [
                            []
                        ],
                        "datatype": null
                    },
                    {
                        "key": "frameStartOffset",
                        "value": [
                            {
                                "key": "subFrameOffset",
                                "value": 0,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "siPeriodicityBr",
                        "value": [
                            {
                                "key": "siPeriodicitySI1",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI10",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI2",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI3",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI4",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI5",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI6",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI7",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI8",
                                "value": 64,
                                "datatype": null
                            },
                            {
                                "key": "siPeriodicitySI9",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "pdcchPowerBoostMax",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "prsConfigIndexMapped",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qQualMinOffset",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "servOrPrioTriggeredIFHo",
                        "value": "QCI",
                        "datatype": null
                    },
                    {
                        "key": "qQualMinRsrqCe",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "networkSignallingValue",
                        "value": "NS_01",
                        "datatype": null
                    },
                    {
                        "key": "additionalFreqBandList",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "lastSchedLinkAdaptEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "ulConfigurableFrequencyStart",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "ulFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "highSpeedUEActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "iuaInterval",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "catm1SupportEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "altitude",
                        "value": 87,
                        "datatype": null
                    },
                    {
                        "key": "measCellGroupUeRef",
                        "value": null,
                        "datatype": null
                    },
                    {
                        "key": "prescheduling",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock7",
                        "value": [
                            {
                                "key": "tReselectionGeran",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionGeranSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock6",
                        "value": [
                            {
                                "key": "tReselectionUtra",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionUtraSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "enableDrxAwareRlcArq",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "pdcchCovImproveQci1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock3",
                        "value": [
                            {
                                "key": "nCellChangeHigh",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "nCellChangeMedium",
                                "value": 16,
                                "datatype": null
                            },
                            {
                                "key": "qHyst",
                                "value": 4,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfHigh",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "qHystSfMedium",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearch",
                                "value": 1000,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchP",
                                "value": 62,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearch",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchP",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchQ",
                                "value": 0,
                                "datatype": null
                            },
                            {
                                "key": "sNonIntraSearchv920Active",
                                "value": false,
                                "datatype": null
                            },
                            {
                                "key": "tEvaluation",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "tHystNormal",
                                "value": 240,
                                "datatype": null
                            },
                            {
                                "key": "threshServingLowQ",
                                "value": 1000,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "transmissionMode",
                        "value": "TRANSMISSION_MODE_3",
                        "datatype": null
                    },
                    {
                        "key": "iuaEnabled",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "systemInformationBlock8",
                        "value": [
                            {
                                "key": "searchWindowSizeCdma",
                                "value": 8,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRtt",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdma1xRttSfMedium",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpd",
                                "value": 2,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfHigh",
                                "value": 100,
                                "datatype": null
                            },
                            {
                                "key": "tReselectionCdmaHrpdSfMedium",
                                "value": 100,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "noOfChannelSelectionSets",
                        "value": 4,
                        "datatype": null
                    },
                    {
                        "key": "useBandPrioritiesInSib1",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "mobCtrlAtPoorCovActive",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "interEnbUlCompUserSelSinrThr",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "ulTxPsdDistrThr",
                        "value": 40,
                        "datatype": null
                    },
                    {
                        "key": "ulSchedCtrlForOocUesEnabled",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "dlInternalChannelBandwidth",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMin",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "acBarringForCsfb",
                        "value": [
                            {
                                "key": "acBarringFactor",
                                "value": 95,
                                "datatype": null
                            },
                            {
                                "key": "acBarringForSpecialAC",
                                "value": [
                                    false,
                                    false,
                                    false,
                                    false,
                                    false
                                ],
                                "datatype": null
                            },
                            {
                                "key": "acBarringTime",
                                "value": 64,
                                "datatype": null
                            }
                        ],
                        "datatype": null
                    },
                    {
                        "key": "acBarringSkipForMmtelVoice",
                        "value": false,
                        "datatype": null
                    },
                    {
                        "key": "loadBasedBarringFactor",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "maxNoClusteredPuschAlloc",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "confidence",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "qRxLevMinCe",
                        "value": -140,
                        "datatype": null
                    },
                    {
                        "key": "ulTrigActive",
                        "value": true,
                        "datatype": null
                    },
                    {
                        "key": "hoOptAdjThresholdPerc",
                        "value": 50,
                        "datatype": null
                    },
                    {
                        "key": "pdcchOuterLoopInitialAdjVolte",
                        "value": -70,
                        "datatype": null
                    },
                    {
                        "key": "pMaxServingCell",
                        "value": 1000,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpRate",
                        "value": 1,
                        "datatype": null
                    },
                    {
                        "key": "pdcchTargetBler",
                        "value": 24,
                        "datatype": null
                    },
                    {
                        "key": "bsrThreshold",
                        "value": 0,
                        "datatype": null
                    },
                    {
                        "key": "iuaMaxPrbsPerUe",
                        "value": 20,
                        "datatype": null
                    },
                    {
                        "key": "dlPowerRampUpInitialRatio",
                        "value": 100,
                        "datatype": null
                    },
                    {
                        "key": "noOfPucchSrUsers",
                        "value": 160,
                        "datatype": null
                    },
                    {
                        "key": "lastModification",
                        "value": "OPERATOR",
                        "datatype": null
                    },
                    {
                        "key": "pZeroNominalPucch",
                        "value": -117,
                        "datatype": null
                    },
                    {
                        "key": "rachRootSequence",
                        "value": 386,
                        "datatype": null
                    },
                    {
                        "key": "dlFrequencyAllocationProportion",
                        "value": 100,
                        "datatype": null
                    }
                ],
                "networkDetails": [
                    {
                        "key": "syncStatus",
                        "value": "SYNCHRONIZED"
                    },
                    {
                        "key": "ipAddress",
                        "value": "192.168.102.127"
                    },
                    {
                        "key": "managementState",
                        "value": "NORMAL"
                    }
                ]
            }


        ];


        var fdnresponse = fdnResponses.find(function (fdnres) {
            return fdnres.fdn === fdn;
        });

        res.status(200).send(fdnresponse);
    });

    app.get('/object-configuration/collections/v4/:collectionId', function (req, res) {
        var collectionData = {
            281474979402243: {
                "id": "281474979402243",
                "name": "Test1_collection",
                "owner": "administrator",
                "sharing": "public",
                "type": "leaf",
                "timeCreated": 1518161069044,
                "timeUpdated": 1518161069044,
                "contentsLastUpdated": 1518161069044,
                "isCustomTopology": false,
                "userPermissions": {
                    "deletable": true,
                    "updateable": true
                },
                "contents": [{
                    "id": "281474980961442",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN1,MeContext=netsim_LTE02ERBS00001",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00001",
                    "attributes": {}
                }, {
                    "id": "281474980961422",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN2,MeContext=netsim_LTE02ERBS00002",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00002",
                    "attributes": {}
                }, {
                    "id": "281474980961432",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN3,MeContext=netsim_LTE02ERBS00003",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00003",
                    "attributes": {}
                }],
                "stereotypes": [{
                    "type": "PrivateNetwork",
                    "attributes": {
                        "companyName": "MyCompany",
                        "networkName": "MyNetwork",
                        "location": "Ireland"
                    }
                }],
                "labels": [{
                    "id": 1234,
                    "name": "label01"
                }]
            },
            281474979421055: {
                "id": "281474979421055",
                "name": "Eutranfdd",
                "owner": "administrator",
                "sharing": "public",
                "type": "leaf",
                "timeCreated": 1516766897953,
                "timeUpdated": 1516766897953,
                "contentsLastUpdated": 1516766897953,
                "isCustomTopology": false,
                "userPermissions": {
                    "deletable": true,
                    "updateable": true
                },
                "contents": [{
                    "id": "281474979334234",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN1,MeContext=netsim_LTE02ERBS00001",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00001",
                    "attributes": {}
                }, {
                    "id": "281474979335026",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN2,MeContext=netsim_LTE02ERBS00002",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00002",
                    "attributes": {}
                }, {
                    "id": "281474979335814",
                    "type": "NetworkElement",
                    "fdn": "SubNetwork=TestSN3,MeContext=netsim_LTE02ERBS00003",
                    "namespace": "OSS_TOP",
                    "name": "netsim_LTE02ERBS00003",
                    "attributes": {}
                }],
                "stereotypes": [],
                "labels": []
            },
            281474979421035: {
                "id": "281474979421035",
                "name": "Empty",
                "owner": "administrator",
                "sharing": "public",
                "type": "leaf",
                "timeCreated": 1516766897953,
                "timeUpdated": 1516766897953,
                "contentsLastUpdated": 1516766897953,
                "isCustomTopology": false,
                "userPermissions": {
                    "deletable": true,
                    "updateable": true
                },
                "contents": [],
                "stereotypes": [],
                "labels": []
            }
        };
        res.status(200).send(collectionData[req.params.collectionId]);
    });

    app.post('/persistentObject/rootAssociations', function (req, res) {
        var rootAssociations = [
                {
                    "name": "LTE100ERBS00001",
                    "type": "NetworkElement",
                    "poId": 281474979285181,
                    "id": "281474979285181",
                    "fdn": "NetworkElement=LTE100ERBS00001",
                    "namespace": null,
                    "namespaceVersion": null,
                    "neType": null,
                    "attributes": null,
                    "networkDetails": null
                },
                {
                    "name": "LTE100ERBS00002",
                    "type": "NetworkElement",
                    "poId": 281474979285268,
                    "id": "281474979285268",
                    "fdn": "NetworkElement=LTE100ERBS00002",
                    "namespace": null,
                    "namespaceVersion": null,
                    "neType": null,
                    "attributes": null,
                    "networkDetails": null
                }
            ]
        ;
        res.status(200).send(rootAssociations);
    });

    app.get('/managedObjects/search/v2', function (req, res) {
        var searchResponse = {
            "objects": [
                {
                    "id": "281474979430612",
                    "type": "EUtranCellFDD",
                    "targetTypeAttribute": null
                },
                {
                    "id": "281474979430622",
                    "type": "EUtranCellFDD",
                    "targetTypeAttribute": null
                },
                {
                    "id": "281474979430999",
                    "type": "EUtranCellFDD",
                    "targetTypeAttribute": null
                },
                {
                    "id": "281474979431273",
                    "type": "EUtranCellFDD",
                    "targetTypeAttribute": null
                },
                {
                    "id": "281474979285184",
                    "type": "MeContext",
                    "targetTypeAttribute": "ERBS"
                }
            ],
            "attributes": [],
            "attributeMappings": [],
            "metadata": {
                "MAX_UI_CACHE_SIZE": 100000,
                "RESULT_SET_TOTAL_SIZE": 4,
                "INFO_MESSAGE": 0,
                "SORTABLE": true
            }
        }
        res.status(200).send(searchResponse);
    });


    //Saved searches management local responses.
    app.get('/editprofile', function (req, res) {
        res.status(200).send({
            "username": "administrator",
            "password": "********",
            "status": "enabled",
            "name": "security",
            "surname": "admin",
            "email": "security@administrator.com",
            "description": null,
            "previousLogin": "20171027070250+0000",
            "lastLogin": "20171027070804+0000",
            "passwordResetFlag": null,
            "privileges": [],
            "passwordChangeTime": "20171022231340+0000",
            "maxSessionTime": null,
            "maxIdleTime": null,
            "authMode": "local",
            "passwordAgeing": null
        });
    });

    app.get('/oss/idm/usermanagement/users/administrator/privileges', function (req, res) {
        res.status(200).send([
            {
                "user": "administrator",
                "role": "ADMINISTRATOR",
                "targetGroup": "ALL"
            },
            {
                "user": "administrator",
                "role": "SECURITY_ADMIN",
                "targetGroup": "ALL"
            },
            {
                "user": "administrator",
                "role": "LogViewer_Operator",
                "targetGroup": "ALL"
            }
        ]);
    });

    app.get('/flowautomation/v1/flows/:flowId/:flowVersion/process-details', function (req, res) {
        res.set('Content-Type', 'application/json');
        var flowId = req.params.flowId;
        var flowVersion = req.params.flowVersion;
        if (flowId === "com.ericsson.oss.fa.flows.fillNodeData2") {
            res.status(200).send([
                {
                    "processId": "com.ericsson.oss.fa.flows.fillNodeData2.01.00.01",
                    "setupProcessId": "com.ericsson.oss.fa.flows.fillNodeData2.01.00.01.-.setup",
                    "executeProcessId": "com.ericsson.oss.fa.flows.fillNodeData2.01.00.01.-.execute"
                }
            ]);
        } else {
            res.status(404).send();
        }
    });

    app.get('/engine-rest/engine/default/history/process-instance/:processInstanceId', function (req, res) {
        var processInstanceId = req.params.processInstanceId;
        if (processInstanceId.endsWith('9')) {
            res.status(404).send();
        } else {
            res.status(200).send(
                {
                    "id": "1234567890",
                    "businessKey": "some business key",
                    "processDefinitionId": "0987654321",
                    "processDefinitionKey": "some-key",
                    "processDefinitionName": "Some Name",
                    "processDefinitionVersion": 1,
                    "startTime": "2017-02-10T14:33:19.000+0200",
                    "endTime": null,
                    "removalTime": null,
                    "durationInMillis": null,
                    "startUserId": null,
                    "startActivityId": "StartEvent_1",
                    "deleteReason": null,
                    "rootProcessInstanceId": null,
                    "superProcessInstanceId": null,
                    "superCaseInstanceId": null,
                    "caseInstanceId": null,
                    "tenantId": null,
                    "state": "ACTIVE"
                }
            );
        }
    });

    app.get('/engine-rest/engine/default/history/activity-instance', function (req, res) {
        var processInstanceId = req.query["processInstanceId"];
        if (processInstanceId.endsWith('9')) {
            res.status(404).send();
        } else {
            res.status(200).send([]);
        }
    });

    app.post('/engine-rest/engine/default/history/variable-instance', function (req, res) {
        var processInstanceId = req.query["processInstanceId"];
        if (processInstanceId.endsWith('9')) {
            res.status(404).send();
        } else {
            res.status(200).send([]);
        }
    });

    app.get('/engine-rest/engine/default/process-definition/key/:key/xml', function (req, res) {
        var key = req.params.key;

        fs.readFile("../flow-instances/test/resources/wrapper-process.bpmn", "utf8", function (err, data) {
            if (err) throw err;

            res.status(200).send({
                "id": key,
                "bpmn20Xml": data
            });
        });
    });

};