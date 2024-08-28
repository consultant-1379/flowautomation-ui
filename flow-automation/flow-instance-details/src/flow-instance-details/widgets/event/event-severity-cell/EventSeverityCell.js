define([
    'tablelib/Cell',
    './EventSeverityCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        View: View,

        setValue: function (value) {
            this.ebIconClass = "ebIcon_error";
            if (value === "INFO") {
                this.ebIconClass = "ebIcon_infoMsgIndicator";
            } else if (value === "WARNING") {
                this.ebIconClass = "ebIcon_warning";
            }
            this.view.setText(value);
            this.view.setIcon(this.ebIconClass);
            this.text = value.text;
        }
    });
});
