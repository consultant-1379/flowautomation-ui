define(['container/api'], function (container) {
    return {
        show: function () {
            container.getEventBus().publish('container:loader');
        },

        hide: function () {
            container.getEventBus().publish('container:loader-hide');
        }
    };
});