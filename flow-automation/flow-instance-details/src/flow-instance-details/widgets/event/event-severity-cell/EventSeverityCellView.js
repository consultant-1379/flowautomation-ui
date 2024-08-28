/*global define*/
define([
    'jscore/core',
    'template!./_eventSeverityCell.hbs',
    "styles!./_eventSeverityCell.less"
], function (core, template, style) {
    'use strict';

    var CLASS_PREFIX = 'eaFlowInstanceDetails-wEventSeverityCell';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return style;
        },

        setText: function (text) {
            this.getElement().find('.' + CLASS_PREFIX + '-text').setText(text);
        },

        setIcon: function (ebIconClass) {
            if (ebIconClass) {
                this.getElement().find('.' + CLASS_PREFIX + '-icon').setAttribute('class', ebIconClass + ' ebIcon ' + CLASS_PREFIX + '-icon');
            } else {
                this.getElement().find('.' + CLASS_PREFIX + '-icon').setAttribute('class', CLASS_PREFIX + '-no-icon ' + CLASS_PREFIX + '-icon'); // If no icon is specified, then un-set ebIcon class to remove "width: 16px" style from <i>
            }
        }

    });
});
