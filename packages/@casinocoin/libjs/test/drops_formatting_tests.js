/* eslint-disable max-nested-callbacks */
'use strict'; // eslint-disable-line
const _ = require('lodash');
const assert = require('assert-diff');
const setupAPI = require('./setup-api');
const CasinocoinAPI = require('../dist/npm/api').CasinocoinAPI;
const validate = CasinocoinAPI._PRIVATE.validate;
const fixtures = require('./fixtures');
const requests = fixtures.requests;
const responses = fixtures.responses;
const addresses = require('./fixtures/addresses');
const hashes = require('./fixtures/hashes');
const address = addresses.ACCOUNT;
const testAccount = addresses.TEST_ACCOUNT;
const utils = CasinocoinAPI._PRIVATE.ledgerUtils;
const ledgerClosed = require('./fixtures/casinocoind/ledger-close-newer');
const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator;
const binary = require('casinocoin-libjs-binary-codec');
assert.options.strict = true;

// how long before each test case times out
const TIMEOUT = process.browser ? 25000 : 10000;

function unused() {
}

function closeLedger(connection) {
    connection._ws.emit('message', JSON.stringify(ledgerClosed));
}

function checkResult(expected, schemaName, response) {
    if (expected.txJSON) {
        assert(response.txJSON);
        assert.deepEqual(JSON.parse(response.txJSON), JSON.parse(expected.txJSON));
    }
    assert.deepEqual(_.omit(response, 'txJSON'), _.omit(expected, 'txJSON'));
    if (schemaName) {
        schemaValidator.schemaValidate(schemaName, response);
    }
    return response;
}


function checkTestResult(expected, schemaName, response) {
    if (expected.txJSON) {
        assert(response.txJSON);
        assert.deepEqual(JSON.parse(response.txJSON), JSON.parse(expected.txJSON));
    }
    assert.deepEqual(_.omit(response, 'txJSON'), _.omit(expected, 'txJSON'));
    if (schemaName) {
        schemaValidator.schemaValidate(schemaName, response);
    }
    return response;
}


describe('CasinocoinAPI', function () {
    this.timeout(TIMEOUT);
    const instructions = {maxLedgerVersionOffset: 100};
    beforeEach(setupAPI.setup);
    afterEach(setupAPI.teardown);



    it('prepareTrustline - simple', function () {
        return this.api.prepareTrustline(
            address, requests.prepareTrustline.simple, instructions).then(
            _.partial(checkResult, responses.prepareTrustline.simple, 'prepare'));
    });



    it('prepareTrustline - frozen', function () {
        return this.api.prepareTrustline(
            address, requests.prepareTrustline.frozen).then(
            _.partial(checkResult, responses.prepareTrustline.frozen, 'prepare'));
    });

    it('prepareTrustline - complex', function () {
        return this.api.prepareTrustline(
            address, requests.prepareTrustline.complex, instructions).then(
            _.partial(checkResult, responses.prepareTrustline.complex, 'prepare'));
    });

    it('prepareSettings', function () {
        return this.api.prepareSettings(
            address, requests.prepareSettings.domain, instructions).then(
            _.partial(checkResult, responses.prepareSettings.flags, 'prepare'));
    });

    it('prepareSettings - no maxLedgerVersion', function () {
        return this.api.prepareSettings(
            address, requests.prepareSettings.domain, {maxLedgerVersion: null}).then(
            _.partial(checkResult, responses.prepareSettings.noMaxLedgerVersion,
                'prepare'));
    });

    it('prepareSettings - no instructions', function () {
        return this.api.prepareSettings(
            address, requests.prepareSettings.domain).then(
            _.partial(
                checkResult,
                responses.prepareSettings.noInstructions,
                'prepare'));
    });

    it('prepareSettings - regularKey', function () {
        const regularKey = {regularKey: 'cQw6KZ7CyvNmdBtjfdj15puULG3rCBXXvV'};
        return this.api.prepareSettings(address, regularKey, instructions).then(
            _.partial(checkResult, responses.prepareSettings.regularKey, 'prepare'));
    });

});
