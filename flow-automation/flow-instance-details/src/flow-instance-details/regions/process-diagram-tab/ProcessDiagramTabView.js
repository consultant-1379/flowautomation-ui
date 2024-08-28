define([
    'jscore/core',
    'template!./_processDiagramTab.hbs',
    'styles!./_processDiagramTab.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.eaFlowInstanceDetails-rProcessDiagramTab-';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },
        
        getActivityButton: function() {
            return this.getElement().find(parentEl + 'actions-activity');
        },
        
        getDefinitionButton: function() {
            return this.getElement().find(parentEl + 'actions-definition');
        },
        
        checkActivityButton: function() {
            this.getActivityButton().trigger('click');
        },
        
        getDiagram : function() {
            return this.getElement().find(parentEl + 'diagram');
        },
        
        hideActionsAndDiagramSection: function() {
            this.getElement().find(parentEl + 'actions').setModifier('hidden');
            this.getElement().find(parentEl + 'diagram').setModifier('hidden');
        },

        showActionsAndDiagramSection: function() {
            this.getElement().find(parentEl + 'actions').removeModifier('hidden');
            this.getElement().find(parentEl + 'diagram').removeModifier('hidden');
        },

        getErrorSection : function() {
            return this.getElement().find(parentEl + 'errorsection');
        },
        
        hideErrorSection : function() {
            this.getErrorSection().setModifier('hidden');
        },

        showErrorSection : function() {
            this.getErrorSection().removeModifier('hidden');
        }

    });
});