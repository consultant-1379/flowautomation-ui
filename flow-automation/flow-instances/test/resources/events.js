var events = {
    "0taski": {
        "numberOfRecords": 32,
        "records": [{
            "eventTime": "2019-08-22 15:13:33",
            "severity": "INFO",
            "target": null,
            "message": "https://localhost:8585/#flow-automation Initializing multi instance flow execution https://localhost:8585/#flow-automation",
            "eventData": "{configuration={numElements=10, loadControlPoolSize=4, instanceSleepSeconds=10, generateIncidents=false}}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "WARNING",
            "target": null,
            "message": "Multiinstance https://localhost:8585/#flow-automation/flowcatalog might impact http://localhost:8585/#flow-automation/flowcatalog physical resources..",
            "eventData": "{configuration={numElements=10, loadControlPoolSize=4, instanceSleepSeconds=10, generateIncidents=false}}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "INFO",
            "target": "nodeelement1",
            "message": "Package http://localhost:8585/#flow-automation/flowcatalog upgrade started, http://localhost:8585/#flow-automation upgrade.",
            "eventData": "{key - nodeelement1=value - nodeelement1, key 1=value 1}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "WARNING",
            "target": "nodeelement1",
            "message": "Package http://localhost:8585/#flow-automation upgrade failed, http://localhost:8585/#flow-automation retrying...",
            "eventData": "{key - nodeelement1=value - nodeelement1, key 1=value 1}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "INFO",
            "target": "nodeelement2",
            "message": "Package upgrade started. https://localhost:8585/#flow-automation",
            "eventData": "{key 1=value 1, key - nodeelement2=value - nodeelement2}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "WARNING",
            "target": "nodeelement2",
            "message": "https://localhost:8585/#flow-automation Package upgrade failed, retrying... https://localhost:8585/#flow-automation",
            "eventData": "{key 1=value 1, key - nodeelement2=value - nodeelement2}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "ERROR",
            "target": "nodeelement1",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key - nodeelement1=value - nodeelement1, key 1=value 1}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "ERROR",
            "target": "nodeelement2",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement2=value - nodeelement2}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "INFO",
            "target": "nodeelement0",
            "message": "Package upgrade started. https://localhost:8585/#flow-automation2",
            "eventData": "{key 1=value 1, key - nodeelement0=value - nodeelement0}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "WARNING",
            "target": "nodeelement0",
            "message": "Package upgrade failed, retrying..."

        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "ERROR",
            "target": "nodeelement0",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement0=value - nodeelement0}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "INFO",
            "target": "nodeelement3",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement3=value - nodeelement3}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "WARNING",
            "target": "nodeelement3",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement3=value - nodeelement3}"
        }, {
            "eventTime": "2019-08-22 15:13:33",
            "severity": "ERROR",
            "target": "nodeelement3",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement3=value - nodeelement3}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "INFO",
            "target": "nodeelement4",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement4=value - nodeelement4}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "WARNING",
            "target": "nodeelement4",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement4=value - nodeelement4}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "ERROR",
            "target": "nodeelement4",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement4=value - nodeelement4}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "INFO",
            "target": "nodeelement5",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement5=value - nodeelement5}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "WARNING",
            "target": "nodeelement5",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement5=value - nodeelement5}"
        }, {
            "eventTime": "2019-08-22 15:13:44",
            "severity": "ERROR",
            "target": "nodeelement5",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement5=value - nodeelement5}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "INFO",
            "target": "nodeelement6",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement6=value - nodeelement6}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "WARNING",
            "target": "nodeelement6",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement6=value - nodeelement6}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "ERROR",
            "target": "nodeelement6",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement6=value - nodeelement6}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "INFO",
            "target": "nodeelement7",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement7=value - nodeelement7}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "WARNING",
            "target": "nodeelement7",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement7=value - nodeelement7}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "ERROR",
            "target": "nodeelement7",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement7=value - nodeelement7}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "INFO",
            "target": "nodeelement8",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement8=value - nodeelement8}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "WARNING",
            "target": "nodeelement8",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement8=value - nodeelement8}"
        }, {
            "eventTime": "2019-08-22 15:13:59",
            "severity": "ERROR",
            "target": "nodeelement8",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement8=value - nodeelement8}"
        }, {
            "eventTime": "2019-08-22 15:14:04",
            "severity": "INFO",
            "target": "nodeelement9",
            "message": "Package upgrade started.",
            "eventData": "{key 1=value 1, key - nodeelement9=value - nodeelement9}"
        }, {
            "eventTime": "2019-08-22 15:14:04",
            "severity": "WARNING",
            "target": "nodeelement9",
            "message": "Package upgrade failed, retrying...",
            "eventData": "{key 1=value 1, key - nodeelement9=value - nodeelement9}"
        }, {
            "eventTime": "2019-08-22 15:14:04",
            "severity": "ERROR",
            "target": "nodeelement9",
            "message": "Failed to upgrade after retries...",
            "eventData": "{key 1=value 1, key - nodeelement9=value - nodeelement9}"
        }]
    }
};
module.exports = {
    events: events
};