define([
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/Selection',
    'tablelib/plugins/NoHeader',
    'tablelib/plugins/RowEvents',
    'jscore/ext/net',
    'flow-automation-lib/helper/promisify',
], function (Table, ResizableHeader, Selection, NoHeader, RowEvents, net, promisify) {

    var flowList = new Table({
        plugins: [
            new NoHeader(),
            new Selection({
                selectableRows: true,
            }),
            new ResizableHeader(),
            new RowEvents({
                events: ['contextmenu']
            }),
        ],
        columns: [
            {title: 'Flow Name', attribute: 'name', sortable: true, resizable: true},
            {title: 'Flow Id', attribute: 'flowId', visible: false}
        ]
    });

    function getSelectedRow() {
        if (this.flowList.getSelectedRows().length > 0) {
            return this.flowList.getSelectedRows();
        } else {
            return [];
        }
    }

    function selectRowWithFlowId(flowId) {
            this.flowList.selectRows(function (row) {
                return (row.getData().flowId === flowId);
            }.bind(this));
    }

    function fetchFlows(successCallBack, errorCallBack) {
        net.ajax({
            url: '/flowautomation/v1/flows',
            type: 'GET',
            dataType: 'json',
            success: successCallBack,
            error: errorCallBack
        });
    }

    function getUserPermissions(flowId) {
        return promisify.ajax({
            url: '/flowautomation/v1/flows/' + flowId + '/user-permissions',
            type: 'GET',
            dataType: 'json',
        }).then(function (response) {
            return response.data;
        }).catch(function (response) {
            throw response;
        });
    }

    var defaultSortColumn = "name",
        defaultSortOrder = "asc";

    function sortTableAlphabetically() {
        flowList.setData(getSortedData(defaultSortOrder, defaultSortColumn, flowList.getData()));
    }

    function getSortedData(mode, attribute, flow) {
        var sortOrder = mode === 'asc' ? 1 : -1;

        return flow.sort(function (flow1, flow2) {
            return flow1[attribute].localeCompare(flow2[attribute]) * sortOrder;
        });
    }


    return {
        flowList: flowList,
        fetchFlows: fetchFlows,
        getSelectedRow: getSelectedRow,
        selectRowWithFlowId: selectRowWithFlowId,
        sortTableAlphabetically: sortTableAlphabetically,
        getUserPermissions: getUserPermissions
    };
});