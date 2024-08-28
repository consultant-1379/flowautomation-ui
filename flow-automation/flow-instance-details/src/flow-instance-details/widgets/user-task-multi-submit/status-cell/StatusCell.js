define([
    'tablelib/Cell',
    './StatusCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        View: View,

        setValue: function (status) {
            this.view.setStatus(status);
        }
    });
});
