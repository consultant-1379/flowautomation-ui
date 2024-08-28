/*global define, describe, before, after, beforeEach, afterEach, it, expect */
define([
    'flow-catalog/FlowCatalog'
], function (FlowCatalog) {
    'use strict';

    describe('FlowCatalog', function () {

        it('Sample BIT test', function () {
            expect(FlowCatalog).not.to.be.undefined;
        });

    });

});
