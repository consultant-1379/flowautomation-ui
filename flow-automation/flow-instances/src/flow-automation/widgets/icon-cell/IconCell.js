define([
    'tablelib/Cell',
    './IconCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        View: View,

        setValue: function (value) {
            this.view.setText((typeof value.text !== 'undefined') ? value.text : '');
            this.view.setIcon((typeof value.ebIconClass !== 'undefined') ? value.ebIconClass : '');
            this.view.setIconBackground();
            this.text = value.text;
            this.ebIconClass = value.ebIconClass;
        }
    });
});
