define([
    'i18n!flow-instance-details/dictionary.json',
    /*    IDUN- 2976 UI – Remove scoping panel   */
    //'../../nodeTask-widgets/NodeTaskDialog',
    '../popup-table/table/PopupTable',
    'widgets/Dialog',
    '../listBox/ListBox'
], function (dictionary, PopupTable, Dialog, ListBox) {

    function linkClick(content, isHeader) {
        var dialogOptions = {
            content: content,
            buttons: [{
                caption: dictionary.get("reviewConfirmDialog.close"),
                action: function () {
                    dialog.destroy();
                }
            }]
        };
        if (!!isHeader) {
            dialogOptions.header = dictionary.get("reviewConfirmDialog.title");
        } else {
            dialogOptions.fullContent = true;
        }
        var dialog = new Dialog(dialogOptions);
        dialog.show();
    }

    return {
        /* IDUN- 2976 UI – Remove scoping panel
        onViewLinkClick: function (options) {
            linkClick(new NodeTaskDialogWidget(options), true);
        },*/

        onTableLinkClick: function (options) {
            linkClick(new PopupTable(options), false);
        },

        onListLinkClick: function (options) {
            linkClick(new ListBox(options), false);
        }
    };

});