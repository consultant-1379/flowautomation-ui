// ids are incrementally generated for all objects

function IdGenerator(options) {
    options = options || {};
    this.id = options.id || 0;

    this.generate = function () {
        this.id++;
        return this.id;
    };

    this.getCurrent = function () {
        return this.id;
    };
}

var idGen = new IdGenerator();
var flows = [];
flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.fillNodeData',
    "name": "Fill Node Data",
    "status": "disabled",
    "source": "EXTERNAL",
    "flowVersions": [{
        "version": "1.0.1",
        "description": "BBB_ Fill the node data if you don't want to restart the node. but it should be very quick 1",
        "active": false,
        "createdBy": "administrator",
        "importedDate": "2018-08-29 11:14:29.0",
        "setupPhaseRequired": true
    },
        {
            "version": "1.0.2",
            "description": "Fill the node data if you don't want to restart the node. but it should be very quick 2",
            "active": true,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }, {
            "version": "1.0.3",
            "description": "Fill the node data if you don't want to restart the node. but it should be very quick 3",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }
    ],
};

flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.collectPMCounters',
    "name": "Collect PM Counters, Activate KPI",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [{
        "version": "1.1.1",
        "description": "Once a KPI become active, auto collect the required PM counters 1",
        "active": true,
        "createdBy": "administrator",
        "importedDate": "2018-08-29 11:14:29.0",
        "setupPhaseRequired": false
    },
        {
            "version": "1.1.2",
            "description": "Once a KPI become active, auto collect the required PM counters 2",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        }, {
            "version": "1.1.3",
            "description": "Once a KPI become active, auto collect the required PM counters 3",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        }
    ],
};

flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.autoSoftwareRollout',
    "name": "Auto Software Rollout",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [{
        "version": "2.0",
        "description": "Auto software rollout.s 1",
        "active": true,
        "createdBy": "administrator",
        "importedDate": "2018-08-29 11:14:29.0",
        "setupPhaseRequired": true
    },
        {
            "version": "2.1",
            "description": "Auto software rollout. 2",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }, {
            "version": "2.2",
            "description": "Auto software rollout. 3",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }
    ],
};

flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.currentBtsNodeUpgrade',
    "name": "Current BTS Nodes Upgrade",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [{
        "version": "3.0.1",
        "description": "All towers need upgrade from current version to the latest version. No shutdown 1",
        "active": true,
        "createdBy": "administrator",
        "importedDate": "2018-08-29 11:14:29.0",
        "setupPhaseRequired": false
    },
        {
            "version": "3.0.2",
            "description": "All towers need upgrade from current version to the latest version. No shutdown 2",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        },
        {
            "version": "3.0.3",
            "description": "All towers need upgrade from current version to the latest version. No shutdown 3",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        }
    ],
};

flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.radioNodesFireAlarmIssue',
    "name": "Radio Nodes Fire Alarm Issue",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [{
        "version": "4.1",
        "description": "Radio nodes caught fire and need to be recovered 1",
        "active": false,
        "createdBy": "administrator",
        "importedDate": "2018-08-29 11:14:29.0",
        "setupPhaseRequired": false
    },
        {
            "version": "4.2",
            "description": "Radio nodes caught fire and need to be recovered 2",
            "active": true,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        }, {
            "version": "4.3",
            "description": "Radio nodes caught fire and need to be recovered 3",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": false
        }
    ],

};

flows[idGen.generate()] = {
    "id": 'com.ericsson.oss.fa.flows.physicalServers',
    "name": "Physical Servers",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [
        {
            "version": "5.0.1",
            "description": "Physical serves upgrade 1",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        },
        {
            "version": "5.0.2",
            "description": "Physical serves upgrade 2",
            "active": false,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }, {
            "version": "5.0.3",
            "description": "Physical serves upgrade 3",
            "active": true,
            "createdBy": "administrator",
            "importedDate": "2018-08-29 11:14:29.0",
            "setupPhaseRequired": true
        }
    ],
};

flows[idGen.generate()] = {
    "id": "com.ericsson.oss.fa.flows.usertaskShowcase.i18n",
    "name": "Usertask Showcase with i18n",
    "status": "enabled",
    "source": "EXTERNAL",
    "flowVersions": [
        {
            "version": "1.0.6",
            "description": "Usertask Showcase with i18n",
            "active": true,
            "createdBy": "faadmin",
            "createdDate": "2019-08-06 13:18:53.0",
            "setupPhaseRequired": true
        }
    ]
};


module.exports = {
    flows: flows
};
