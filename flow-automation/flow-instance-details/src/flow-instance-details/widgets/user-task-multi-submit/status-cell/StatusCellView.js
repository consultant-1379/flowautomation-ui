/*global define*/
define([
    'jscore/core',
    'template!./_statusCell.hbs',
    'styles!./_statusCell.less'
], function (core, template, styles) {
    'use strict';

    var CLASS_PREFIX = 'eaFlowInstanceDetails-wUsertaskSubmitStatusCell';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setText: function (text) {
            this.getElement().find('.' + CLASS_PREFIX + '-text').setText(text);
        },

        setStatus: function (status) {
            var iconHolder = this.getElement().find('.' + CLASS_PREFIX + '-icon');
            if (status === 'progress') {
                iconHolder.setAttribute('class', 'ebLoader-Dots ' + CLASS_PREFIX + '-icon');
            } else if (status === 'success') {
                iconHolder.setAttribute('class', 'ebIcon ebIcon_tick ' + CLASS_PREFIX + '-icon');
                this.setText('Submitted');
            } else if (status === 'error') {
                iconHolder.setAttribute('class', 'ebIcon ebIcon_error ' + CLASS_PREFIX + '-icon');
                this.setText('Failed Submission');
            }
        }

    });
});
