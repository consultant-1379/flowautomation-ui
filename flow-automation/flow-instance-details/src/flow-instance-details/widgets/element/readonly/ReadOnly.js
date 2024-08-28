define([
    'jscore/core',
    './ReadOnlyView',
    'i18n!flow-instance-details/dictionary.json',
    '../../common/info/Info',
    'flow-automation-lib/helper/utils',
    '../../common/info-icon/InfoIcon'
], function (core, View, dictionary, Info, utils, InfoIcon) {
    return core.Widget.extend({
        View: View,

        init: function (options) {
            this.property = options.property;
            this.key = options.key;
            this.hidden = options.hidden;
            this.indentLevel = options.indentLevel;
            this.required = options.required;
        },

        onViewReady: function () {
            var title = this.property.name || this.key;
            this.view.setTitle(utils.concatIfExist(title, this.property.nameExtra));
            if(this.property.format === 'email'){
                var emailsList = this.property.items.default.join(",");
                this.view.setDefaultValue(emailsList);
            }else{
                this.view.setDefaultValue(this.property.default);
            }
            if (this.hidden) {
                this.view.indent(this.indentLevel * 28);
                this.hide();
            }

            if (!!this.property.description) {
                this.infoIcon = new InfoIcon(this.property);
                this.infoIcon.attachTo(this.view.getInfoIcon());
            }

            this._setInfo();
        },

        _setInfo: function(){
            this.info = new Info({text:this.property.info,  indentLevel:  this.indentLevel, hidden: this.hidden});
            this.info.attachTo(this.view.getInfo());
        },

        hide: function () {
            this.view.hide();
            this.error = false;
        },

        reveal: function () {
            this.view.reveal();
        },

        padBottom: function () {
            this.view.padBottom();
        },

        getValue: function () {
            this.property.returnValue = "";
        }
    });

});