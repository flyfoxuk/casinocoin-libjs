import * as _ from "lodash";
import * as assert from "assert-diff";
import setupAPI from "./setup-api";
import { responses } from "./fixtures";
import ledgerClosed from "./fixtures/casinocoind/ledger-close";
import CasinocoinAPI from "casinocoin-libjs-api";

const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator;

const TIMEOUT = (typeof window !== undefined) ? 25000 : 10000;

function checkResult(
  expected: any,
  schemaName: string,
  response: any,
) {
  if (expected.txJSON) {
    assert(response.txJSON);
    assert.deepEqual(JSON.parse(response.txJSON), JSON.parse(expected.txJSON));
  }
  assert.deepEqual(_.omit(response, "txJSON"), _.omit(expected, "txJSON"));
  if (schemaName) {
    schemaValidator.schemaValidate(schemaName, response);
  }
  return response;
}

describe("CasinocoinAPIBroadcast", () => {
  this.timeout(TIMEOUT);
  beforeEach(setupAPI.setupBroadcast);
  afterEach(setupAPI.teardown);

  it("base", () => {
    const expected = { request_server_info: 1 };
    if (typeof window === undefined) {
      this.mocks.forEach((mock: any) => mock.expect(_.assign({}, expected)));
    }
    assert(this.api.isConnected());
    return this.api.getServerInfo().then(
      _.partial(checkResult, responses.getServerInfo, "getServerInfo"));
  });

  it("ledger", (done: any) => {
    let gotLedger = 0;
    this.api.on("ledger", () => {
      gotLedger++;
    });
    const ledgerNext = _.assign({}, ledgerClosed);
    ledgerNext.ledger_index++;

    this.api._apis.forEach((api: any) => api.connection._send(JSON.stringify({
      command: "echo",
      data: ledgerNext,
    })));

    setTimeout(() => {
      assert.strictEqual(gotLedger, 1);
      done();
    }, 1250);
  });

  it("error propagation", (done: any) => {
    this.api.once("error", (type: any, info: any) => {
      assert.strictEqual(type, "type");
      assert.strictEqual(info, "info");
      done();
    });
    this.api._apis[1].connection._send(JSON.stringify({
      command: "echo",
      data: { error: "type", error_message: "info" },
    }));
  });

});
