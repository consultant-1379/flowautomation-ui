/*global define, describe, before, after, beforeEach, afterEach, it, expect */
define([
    'flow-automation/FlowAutomation'
], function (FlowAutomation) {
    'use strict';

    describe('FlowAutomation', function () {

        it('Sample BIT test', function () {
            expect(FlowAutomation).not.to.be.undefined;
        });

    });

});
