define([
    'jscore/core',
    'template!./_processActivityDiagram.hbs',
    'styles!./_processActivityDiagram.less'

], function (core, template, styles) {
    'use strict';

    var parentEl = '.elFlowAutomationLib-wProcessActivityDiagram-diagram-';
    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getBreadcrumbs : function() {
            return this.getElement().find(parentEl + 'breadcrumbs');
        },
        
        getZoomInButton : function() {
            return this.getElement().find(parentEl + 'zoomIn');
        },
       
        getZoomOutButton : function() {
            return this.getElement().find(parentEl + 'zoomOut');
        },
       
        getZoomResetButton : function() {
            return this.getElement().find(parentEl + 'zoomReset');
        },
       
        getStatus : function() {
            return this.getElement().find(parentEl + 'status');
        },

        getDiagramSection : function() {
            return this.getElement().find(parentEl + 'section');
        },
        
        hideDiagramSection : function() {
            this.getDiagramSection().setModifier('hidden');
        },

        showDiagramSection : function() {
            this.getDiagramSection().removeModifier('hidden');
        },

        getDiagramContent : function() {
            return this.getElement().find(parentEl + 'diagramContent');
        },

        getDraggableContent : function() {
            return this.getElement().find(parentEl + 'draggableContent');
        },
        
        getNotificationSection : function() {
            return this.getElement().find(parentEl + 'section');
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