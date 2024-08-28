define([
    'i18n!flow-instance-details/dictionary.json',
    './Rest',
    '../utils/UriInfo',
    'flow-automation-lib/helper/execution'
    ], function (dictionary, Rest, UriInfo, execution) {
    return {
        getAction: function (request) {

            if(execution.isInIntermediateState(UriInfo.getState()) || execution.isInFinalState(UriInfo.getState()) || request.isConfirmAndReview){
                var executionName = UriInfo.getExecutionName();
                var flowId = UriInfo.getFlowId();
                return {
                    type:'dropdown',
                    options:{
                        caption: dictionary.actions.export,
                        items: [
                            {name: dictionary.actions.downloadFlowInput, action :  function(){download("flowinput");}},
                            {name: dictionary.actions.downloadAll, action :  function(){download("all");}}
                        ],
                        icon: 'export'
                    }
                };
            }
            else{
                return {};
            }

            function download(resource) {
                Rest.download(executionName, resource, flowId);
            }
        }
    };
});

