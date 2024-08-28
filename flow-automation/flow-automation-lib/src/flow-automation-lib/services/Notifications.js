define([
    'widgets/Notification'
], function (Notification) {

    var notification;

    return {
        success: function (label) {
            if (notification) {
                notification.destroy();
            }
            notification = new Notification({
                label: label,
                icon: 'tick',
                color: 'green',
                showCloseButton: true,
                showAsToast: true
            });
            return notification;
        },

        warning: function (label) {
            if (notification) {
                notification.destroy();
            }

            notification = new Notification({
                label: label,
                icon: 'warning',
                color: 'yellow',
                showCloseButton: true,
                autoDismiss: true,
                showAsToast: true
            });

            return notification;
        },

        error: function (label) {
            if (notification) {
                notification.destroy();
            }

            notification = new Notification({
                label: label,
                icon: 'error',
                color: 'red',
                showCloseButton: true,
                autoDismiss: true,
                showAsToast: true
            });

            return notification;
        }
    };
});