define(function () {
    var intermediateStates = ["executing", "incident", "stop", "stopping"];
    var finalStates = ["completed", "executed", "stopped", "cancelled", "suspended", "failed", "failed_setup", "failed_execute"];
    var setupPhaseStates = ["started", "setting_up", "confirm_execute", "setup", "setup failed"];

    return {
        isInIntermediateState: function (state) {
            return state ? intermediateStates.includes(state.toLowerCase()) : false;
        },

        isInFinalState: function (state) {
            return state ? finalStates.includes(state.toLowerCase()) : false;
        },

        isInSetupPhase: function (state) {
            return state ? setupPhaseStates.includes(state.toLowerCase()) : false;
        },

        isInSetupFailedState: function(state){
          return state ? state.toLowerCase() === "failed_setup" : false;
        },

        isInExecutingState: function (state) {
            return state ? state.toLowerCase() === "executing" : false;
        },

        isInternalFlowInstance: function (source) {
            return source ? source.toLowerCase() === "internal" : false;
        }
    };
});