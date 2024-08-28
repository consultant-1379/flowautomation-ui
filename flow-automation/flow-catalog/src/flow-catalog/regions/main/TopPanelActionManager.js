define([

], function () {
    var getNameFilteredFlows = function (filterText, flows) {
        var filteredFlows = [];

        if (filterText === '') {
            filteredFlows = flows;
        } else {

            for (var index = 0; index < flows.length; index++) {
                // case independent match
                if (flows[index].name.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
                    filteredFlows.push(flows[index]);
                }
            }
        }
        return filteredFlows;
    };

    return {
        HandleStateChange: function (topPanelState, flows) {
            return getNameFilteredFlows(topPanelState.nameFilter, flows);
        }
    };
});