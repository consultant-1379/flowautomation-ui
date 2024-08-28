define(function () {

    var EMPTY = '', ZERO = '0', UNDERSCORE = '_', SPACE = " ";

    return {
        isInternalFlow: function (source) {
            return source ? source.toLowerCase() === "internal" : false;
        },

        generateFlowName: function (headerName) {
            var initials = headerName.split(SPACE).map(function (value) {
                return value.substring(0, 1).toUpperCase();
            }).join(EMPTY);

            var dateNow = new Date();
            var hour = dateNow.getHours() + EMPTY;
            var minute = dateNow.getMinutes() + EMPTY;
            var second = dateNow.getSeconds() + EMPTY;
            return initials + UNDERSCORE +
                (hour.length === 1 ? ZERO + hour : hour) +
                (minute.length === 1 ? ZERO + minute : minute) +
                (second.length === 1 ? ZERO + second : second);
        }
    };
});