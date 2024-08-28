define([
    'tablelib/Cell',
    './LinkCellView',
    'widgets/Tooltip',
    'i18n!flow-instance-details/dictionary.json'
], function (Cell, View, Tooltip, Dictionary) {
    'use strict';

    return Cell.extend({

        view: function () {
            return new View({
                view: Dictionary.links.view,
                notSupplied: Dictionary.genericValues.noValueSupplied
            });
        },

        setValue: function (value) {
            if (value.linkNotSupplied) {
                this.view.hideLink();
                return;
            }
            this.view.hideNotSupplied();
            this.view.setLinkValue(this.getLinkText(value.linkFormat), (typeof value.text !== 'undefined') ? value.text : '');
            if (value.tooltip) {
                var toolTip = new Tooltip({
                    parent: this.view.getElement(),
                    content: value.tooltip,
                    width: 200
                });
                toolTip.enable();
            }
        },

        getLinkText: function (linkFormat) {
            return linkFormat === 'download-link' ? Dictionary.links.download : Dictionary.links.view;
        }
    });
});
