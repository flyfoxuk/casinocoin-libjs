import * as _ from "lodash";
import assert from "assert-diff";
import setupAPI from "./setup-api";
import { CasinocoinAPI } from "casinocoin-libjs-api";
import fixtures from "./fixtures";
import addresses from "./fixtures/addresses";
import hashes from "./fixtures/hashes";
import ledgerClosed from "./fixtures/casinocoind/ledger-close-newer";
import binary from "casinocoin-libjs-binary-codec";

assert.options.strict = true;

const validate = CasinocoinAPI._PRIVATE.validate;
const utils = CasinocoinAPI._PRIVATE.ledgerUtils;
const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator;
const requests = fixtures.requests;
const responses = fixtures.responses;
const address = addresses.ACCOUNT;

// how long before each test case times out
const TIMEOUT = (typeof window !== undefined) ? 25000 : 10000;
/* tslint:disable-next-line:no-empty */
const unused = () => { };

function closeLedger(connection: any) {
  connection._ws.emit("message", JSON.stringify(ledgerClosed));
}

function checkResult(
  expected: any,
  schemaName: string,
  response: any) {
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

describe("CasinocoinAPI", () => {
  this.timeout(TIMEOUT);
  const instructions = { maxLedgerVersionOffset: 100 };
  beforeEach(setupAPI.setup);
  afterEach(setupAPI.teardown);

  it("error inspect", () => {
    const error = new this.api.errors.CasinocoinError("mess", { data: 1 });
    assert.strictEqual(error.inspect(), "[CasinocoinError(mess, { data: 1 })]");
  });

  describe("preparePayment", () => {

    it("normal", () => {
      const localInstructions = _.defaults({
        maxFee: "0.000012",
      }, instructions);
      return this.api.preparePayment(
        address, requests.preparePayment.normal, localInstructions).then(
          _.partial(checkResult, responses.preparePayment.normal, "prepare"));
    });

    it("preparePayment - min amount csc", () => {
      const localInstructions = _.defaults({
        maxFee: "0.000012",
      }, instructions);
      return this.api.preparePayment(
        address, requests.preparePayment.minAmountCSC, localInstructions).then(
          _.partial(checkResult,
            responses.preparePayment.minAmountCSC, "prepare"));
    });

    it("preparePayment - min amount csc2csc", () => {
      return this.api.preparePayment(
        address, requests.preparePayment.minAmount, instructions).then(
          _.partial(checkResult,
            responses.preparePayment.minAmountCSCCSC, "prepare"));
    });

    it("preparePayment - CSC to CSC no partial", () => {
      assert.throws(() => {
        this.api.preparePayment(address, requests.preparePayment.wrongPartial);
      }, /CSC to CSC payments cannot be partial payments/);
    });

    it("preparePayment - address must match payment.source.address", () => {
      assert.throws(() => {
        this.api.preparePayment(address, requests.preparePayment.wrongAddress);
      }, /address must match payment.source.address/);
    });

    it("preparePayment - wrong amount", () => {
      assert.throws(() => {
        this.api.preparePayment(address, requests.preparePayment.wrongAmount);
      }, this.api.errors.ValidationError);
    });

    it("preparePayment with all options specified", () => {
      return this.api.getLedgerVersion().then((ver: any) => {
        const localInstructions = {
          maxLedgerVersion: ver + 100,
          fee: "0.000012",
        };
        return this.api.preparePayment(
          address, requests.preparePayment.allOptions, localInstructions).then(
            _.partial(checkResult,
              responses.preparePayment.allOptions, "prepare"));
      });
    });

    it("preparePayment without counterparty set", () => {
      const localInstructions = _.defaults({ sequence: 23 }, instructions);
      return this.api.preparePayment(
        address, requests.preparePayment.noCounterparty, localInstructions)
        .then(_.partial(checkResult, responses.preparePayment.noCounterparty,
          "prepare"));
    });

    it("preparePayment - destination.minAmount", () => {
      return this.api.preparePayment(address, responses.getPaths.sendAll[0],
        instructions).then(_.partial(checkResult,
          responses.preparePayment.minAmount, "prepare"));
    });
  });

  it("prepareOrder - buy order", () => {
    const request = requests.prepareOrder.buy;
    return this.api.prepareOrder(address, request)
      .then(_.partial(checkResult, responses.prepareOrder.buy, "prepare"));
  });

  it("prepareOrder - buy order with expiration", () => {
    const request = requests.prepareOrder.expiration;
    const response = responses.prepareOrder.expiration;
    return this.api.prepareOrder(address, request, instructions)
      .then(_.partial(checkResult, response, "prepare"));
  });

  it("prepareOrder - sell order", () => {
    const request = requests.prepareOrder.sell;
    return this.api.prepareOrder(address, request, instructions).then(
      _.partial(checkResult, responses.prepareOrder.sell, "prepare"));
  });

  it("prepareOrderCancellation", () => {
    const request = requests.prepareOrderCancellation.simple;
    return this.api.prepareOrderCancellation(address, request, instructions)
      .then(_.partial(checkResult, responses.prepareOrderCancellation.normal,
        "prepare"));
  });

  it("prepareOrderCancellation - no instructions", () => {
    const request = requests.prepareOrderCancellation.simple;
    return this.api.prepareOrderCancellation(address, request)
      .then(_.partial(checkResult,
        responses.prepareOrderCancellation.noInstructions,
        "prepare"));
  });

  it("prepareOrderCancellation - with memos", () => {
    const request = requests.prepareOrderCancellation.withMemos;
    return this.api.prepareOrderCancellation(address, request)
      .then(_.partial(checkResult,
        responses.prepareOrderCancellation.withMemos,
        "prepare"));
  });

  it("prepareTrustline - simple", () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.simple, instructions).then(
        _.partial(checkResult, responses.prepareTrustline.simple, "prepare"));
  });

  it("prepareTrustline - frozen", () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.frozen).then(
        _.partial(checkResult, responses.prepareTrustline.frozen, "prepare"));
  });

  it("prepareTrustline - complex", () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.complex, instructions).then(
        _.partial(checkResult, responses.prepareTrustline.complex, "prepare"));
  });

  it("prepareSettings", () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, instructions).then(
        _.partial(checkResult, responses.prepareSettings.flags, "prepare"));
  });

  it("prepareSettings - no maxLedgerVersion", () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, { maxLedgerVersion: null }).then(
        _.partial(checkResult, responses.prepareSettings.noMaxLedgerVersion,
          "prepare"));
  });

  it("prepareSettings - no instructions", () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain).then(
        _.partial(
          checkResult,
          responses.prepareSettings.noInstructions,
          "prepare"));
  });

  it("prepareSettings - regularKey", () => {
    const regularKey = { regularKey: "rAR8rR8sUkBoCZFawhkWzY4Y5YoyuznwD" };
    return this.api.prepareSettings(address, regularKey, instructions).then(
      _.partial(checkResult, responses.prepareSettings.regularKey, "prepare"));
  });

  it("prepareSettings - remove regularKey", () => {
    const regularKey = { regularKey: null };
    return this.api.prepareSettings(address, regularKey, instructions).then(
      _.partial(checkResult, responses.prepareSettings.removeRegularKey,
        "prepare"));
  });

  it("prepareSettings - flag set", () => {
    const settings = { requireDestinationTag: true };
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flagSet, "prepare"));
  });

  it("prepareSettings - flag clear", () => {
    const settings = { requireDestinationTag: false };
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flagClear, "prepare"));
  });

  it("prepareSettings - integer field clear", () => {
    const settings = { transferRate: null };
    return this.api.prepareSettings(address, settings, instructions)
      .then((data: any) => {
        assert(data);
        assert.strictEqual(JSON.parse(data.txJSON).TransferRate, 0);
      });
  });

  it("prepareSettings - set transferRate", () => {
    const settings = { transferRate: 1 };
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.setTransferRate,
        "prepare"));
  });

  it("prepareSettings - set signers", () => {
    const settings = requests.prepareSettings.signers;
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.signers,
        "prepare"));
  });

  it("prepareSettings - fee for multisign", () => {
    const localInstructions = _.defaults({
      signersCount: 4,
    }, instructions);
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, localInstructions).then(
        _.partial(checkResult, responses.prepareSettings.flagsMultisign,
          "prepare"));
  });

  it("prepareEscrowCreation", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.prepareEscrowCreation(
      address, requests.prepareEscrowCreation.normal,
      localInstructions).then(
        _.partial(checkResult, responses.prepareEscrowCreation.normal,
          "prepare"));
  });

  it("prepareEscrowCreation full", () => {
    return this.api.prepareEscrowCreation(
      address, requests.prepareEscrowCreation.full).then(
        _.partial(checkResult, responses.prepareEscrowCreation.full,
          "prepare"));
  });

  it("prepareEscrowExecution", () => {
    return this.api.prepareEscrowExecution(
      address,
      requests.prepareEscrowExecution.normal, instructions).then(
        _.partial(checkResult,
          responses.prepareEscrowExecution.normal,
          "prepare"));
  });

  it("prepareEscrowExecution - simple", () => {
    return this.api.prepareEscrowExecution(
      address,
      requests.prepareEscrowExecution.simple).then(
        _.partial(checkResult,
          responses.prepareEscrowExecution.simple,
          "prepare"));
  });

  it("prepareEscrowCancellation", () => {
    return this.api.prepareEscrowCancellation(
      address,
      requests.prepareEscrowCancellation.normal, instructions).then(
        _.partial(checkResult,
          responses.prepareEscrowCancellation.normal,
          "prepare"));
  });

  it("prepareEscrowCancellation with memos", () => {
    return this.api.prepareEscrowCancellation(
      address,
      requests.prepareEscrowCancellation.memos).then(
        _.partial(checkResult,
          responses.prepareEscrowCancellation.memos,
          "prepare"));
  });

  it("preparePaymentChannelCreate", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.preparePaymentChannelCreate(
      address, requests.preparePaymentChannelCreate.normal,
      localInstructions).then(
        _.partial(checkResult, responses.preparePaymentChannelCreate.normal,
          "prepare"));
  });

  it("preparePaymentChannelCreate full", () => {
    return this.api.preparePaymentChannelCreate(
      address, requests.preparePaymentChannelCreate.full).then(
        _.partial(checkResult, responses.preparePaymentChannelCreate.full,
          "prepare"));
  });

  it("preparePaymentChannelFund", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.preparePaymentChannelFund(
      address, requests.preparePaymentChannelFund.normal,
      localInstructions).then(
        _.partial(checkResult, responses.preparePaymentChannelFund.normal,
          "prepare"));
  });

  it("preparePaymentChannelFund full", () => {
    return this.api.preparePaymentChannelFund(
      address, requests.preparePaymentChannelFund.full).then(
        _.partial(checkResult, responses.preparePaymentChannelFund.full,
          "prepare"));
  });

  it("preparePaymentChannelClaim", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.preparePaymentChannelClaim(
      address, requests.preparePaymentChannelClaim.normal,
      localInstructions).then(
        _.partial(checkResult, responses.preparePaymentChannelClaim.normal,
          "prepare"));
  });

  it("preparePaymentChannelClaim with renew", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.preparePaymentChannelClaim(
      address, requests.preparePaymentChannelClaim.renew,
      localInstructions).then(
        _.partial(checkResult, responses.preparePaymentChannelClaim.renew,
          "prepare"));
  });

  it("preparePaymentChannelClaim with close", () => {
    const localInstructions = _.defaults({
      maxFee: "0.000012",
    }, instructions);
    return this.api.preparePaymentChannelClaim(
      address, requests.preparePaymentChannelClaim.close,
      localInstructions).then(
        _.partial(checkResult, responses.preparePaymentChannelClaim.close,
          "prepare"));
  });

  it("throws on preparePaymentChannelClaim with renew and close", () => {
    assert.throws(() => {
      this.api.preparePaymentChannelClaim(
        address, requests.preparePaymentChannelClaim.full).then(
          _.partial(checkResult, responses.preparePaymentChannelClaim.full,
            "prepare"));
    }, this.api.errors.ValidationError);
  });

  it("throws on preparePaymentChannelClaim with no signature", () => {
    assert.throws(() => {
      this.api.preparePaymentChannelClaim(
        address, requests.preparePaymentChannelClaim.noSignature).then(
          _.partial(checkResult, responses.preparePaymentChannelClaim.noSignature,
            "prepare"));
    }, this.api.errors.ValidationError);
  });

  it("sign", () => {
    const secret = "shsWGZcmZz6YsWWmcnpfr6fLTdtFV";
    const result = this.api.sign(requests.sign.normal.txJSON, secret);
    assert.deepEqual(result, responses.sign.normal);
    schemaValidator.schemaValidate("sign", result);
  });

  it("sign - already signed", () => {
    const secret = "shsWGZcmZz6YsWWmcnpfr6fLTdtFV";
    const result = this.api.sign(requests.sign.normal.txJSON, secret);
    assert.throws(() => {
      const tx = JSON.stringify(binary.decode(result.signedTransaction));
      this.api.sign(tx, secret);
    }, /txJSON must not contain "TxnSignature" or "Signers" properties/);
  });

  it("sign - EscrowExecution", () => {
    const secret = "snoPBrXtMeMyMHUVTgbuqAfg1SUTb";
    const result = this.api.sign(requests.sign.escrow.txJSON, secret);
    assert.deepEqual(result, responses.sign.escrow);
    schemaValidator.schemaValidate("sign", result);
  });

  it("sign - signAs", () => {
    const txJSON = requests.sign.signAs;
    const secret = "snoPBrXtMeMyMHUVTgbuqAfg1SUTb";
    const signature = this.api.sign(JSON.stringify(txJSON), secret, { signAs: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh" });
    assert.deepEqual(signature, responses.sign.signAs);
  });

  it("submit", () => {
    return this.api.submit(responses.sign.normal.signedTransaction).then(
      _.partial(checkResult, responses.submit, "submit"));
  });

  it("submit - failure", () => {
    return this.api.submit("BAD").then(() => {
      assert(false, "Should throw CasinocoindError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.CasinocoindError);
      assert.strictEqual(error.data.resultCode, "temBAD_FEE");
    });
  });

  it("signPaymentChannelClaim", () => {
    const privateKey =
      "ACCD3309DB14D1A4FC9B1DAE608031F4408C85C73EE05E035B7DC8B25840107A";
    const result = this.api.signPaymentChannelClaim(
      requests.signPaymentChannelClaim.channel,
      requests.signPaymentChannelClaim.amount, privateKey);
    checkResult(responses.signPaymentChannelClaim,
      "signPaymentChannelClaim", result);
  });

  it("verifyPaymentChannelClaim", () => {
    const publicKey =
      "02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8";
    const result = this.api.verifyPaymentChannelClaim(
      requests.signPaymentChannelClaim.channel,
      requests.signPaymentChannelClaim.amount,
      responses.signPaymentChannelClaim, publicKey);
    checkResult(true, "verifyPaymentChannelClaim", result);
  });

  it("verifyPaymentChannelClaim - invalid", () => {
    const publicKey =
      "03A6523FE4281DA48A6FD77FAF3CB77F5C7001ABA0B32BCEDE0369AC009758D7D9";
    const result = this.api.verifyPaymentChannelClaim(
      requests.signPaymentChannelClaim.channel,
      requests.signPaymentChannelClaim.amount,
      responses.signPaymentChannelClaim, publicKey);
    checkResult(false,
      "verifyPaymentChannelClaim", result);
  });

  it("combine", () => {
    const combined = this.api.combine(requests.combine.setDomain);
    checkResult(responses.combine.single, "sign", combined);
  });

  it("combine - different transactions", () => {
    const request = [requests.combine.setDomain[0]];
    const tx = binary.decode(requests.combine.setDomain[0]);
    tx.Flags = 0;
    request.push(binary.encode(tx));
    assert.throws(() => {
      this.api.combine(request);
    }, /txJSON is not the same for all signedTransactions/);
  });

  describe("CasinocoinAPI", () => {

    it("getBalances", () => {
      return this.api.getBalances(address).then(
        _.partial(checkResult, responses.getBalances, "getBalances"));
    });

    it("getBalances - limit", () => {
      const options = {
        limit: 3,
        ledgerVersion: 123456,
      };
      const expectedResponse = responses.getBalances.slice(0, 3);
      return this.api.getBalances(address, options).then(
        _.partial(checkResult, expectedResponse, "getBalances"));
    });

    it("getBalances - limit & currency", () => {
      const options = {
        currency: "USD",
        limit: 3,
      };
      const expectedResponse = _.filter(responses.getBalances,
        (item: any) => item.currency === "USD").slice(0, 3);
      return this.api.getBalances(address, options).then(
        _.partial(checkResult, expectedResponse, "getBalances"));
    });

    it("getBalances - limit & currency & issuer", () => {
      const options = {
        currency: "USD",
        counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        limit: 3,
      };
      const expectedResponse = _.filter(responses.getBalances,
        (item: any) => item.currency === "USD" &&
          item.counterparty === "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B").slice(0, 3);
      return this.api.getBalances(address, options).then(
        _.partial(checkResult, expectedResponse, "getBalances"));
    });
  });

  it("getBalanceSheet", () => {
    return this.api.getBalanceSheet(address).then(
      _.partial(checkResult, responses.getBalanceSheet, "getBalanceSheet"));
  });

  it("getBalanceSheet - invalid options", () => {
    assert.throws(() => {
      this.api.getBalanceSheet(address, { invalid: "options" });
    }, this.api.errors.ValidationError);
  });

  it("getBalanceSheet - empty", () => {
    const options = { ledgerVersion: 123456 };
    return this.api.getBalanceSheet(address, options).then(
      _.partial(checkResult, {}, "getBalanceSheet"));
  });

  describe("getTransaction", () => {
    it("getTransaction - payment", () => {
      return this.api.getTransaction(hashes.VALID_TRANSACTION_HASH).then(
        _.partial(checkResult, responses.getTransaction.payment,
          "getTransaction"));
    });

    it("getTransaction - settings", () => {
      const hash =
        "4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA1B";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.settings,
          "getTransaction"));
    });

    it("getTransaction - order", () => {
      const hash =
        "10A6FB4A66EE80BED46AAE4815D7DC43B97E944984CCD5B93BCF3F8538CABC51";
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.order,
          "getTransaction"));
    });

    it("getTransaction - sell order", () => {
      const hash =
        "458101D51051230B1D56E9ACAFAA34451BF65FA000F95DF6F0FF5B3A62D83FC2";
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.orderSell,
          "getTransaction"));
    });

    it("getTransaction - order cancellation", () => {
      const hash =
        "809335DD3B0B333865096217AA2F55A4DF168E0198080B3A090D12D88880FF0E";
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.orderCancellation,
          "getTransaction"));
    });

    it("getTransaction - order with expiration cancellation", () => {
      const hash =
        "097B9491CC76B64831F1FEA82EAA93BCD728106D90B65A072C933888E946C40B";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.orderWithExpirationCancellation,
          "getTransaction"));
    });

    it("getTransaction - trustline set", () => {
      const hash =
        "635A0769BD94710A1F6A76CDE65A3BC661B20B798807D1BBBDADCEA26420538D";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.trustline,
          "getTransaction"));
    });

    it("getTransaction - trustline frozen off", () => {
      const hash =
        "FE72FAD0FA7CA904FB6C633A1666EDF0B9C73B2F5A4555D37EEF2739A78A531B";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.trustlineFrozenOff,
          "getTransaction"));
    });

    it("getTransaction - trustline no quality", () => {
      const hash =
        "BAF1C678323C37CCB7735550C379287667D8288C30F83148AD3C1CB019FC9002";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.trustlineNoQuality,
          "getTransaction"));
    });

    it("getTransaction - not validated", () => {
      const hash =
        "4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA10";
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw NotFoundError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.NotFoundError);
      });
    });

    it("getTransaction - tracking on", () => {
      const hash =
        "8925FC8844A1E930E2CC76AD0A15E7665AFCC5425376D548BB1413F484C31B8C";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.trackingOn,
          "getTransaction"));
    });

    it("getTransaction - tracking off", () => {
      const hash =
        "C8C5E20DFB1BF533D0D81A2ED23F0A3CBD1EF2EE8A902A1D760500473CC9C582";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.trackingOff,
          "getTransaction"));
    });

    it("getTransaction - set regular key", () => {
      const hash =
        "278E6687C1C60C6873996210A6523564B63F2844FB1019576C157353B1813E60";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult, responses.getTransaction.setRegularKey,
          "getTransaction"));
    });

    it("getTransaction - not found in range", () => {
      const hash =
        "809335DD3B0B333865096217AA2F55A4DF168E0198080B3A090D12D88880FF0E";
      const options = {
        minLedgerVersion: 32570,
        maxLedgerVersion: 32571,
      };
      return this.api.getTransaction(hash, options).then(() => {
        assert(false, "Should throw NotFoundError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.NotFoundError);
      });
    });

    it("getTransaction - not found by hash", () => {
      const hash = hashes.NOTFOUND_TRANSACTION_HASH;
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw NotFoundError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.NotFoundError);
      });
    });

    it("getTransaction - missing ledger history", () => {
      const hash = hashes.NOTFOUND_TRANSACTION_HASH;
      // make gaps in history
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw MissingLedgerHistoryError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.MissingLedgerHistoryError);
      });
    });

    it("getTransaction - missing ledger history with ledger range", () => {
      const hash = hashes.NOTFOUND_TRANSACTION_HASH;
      const options = {
        minLedgerVersion: 32569,
        maxLedgerVersion: 32571,
      };
      return this.api.getTransaction(hash, options).then(() => {
        assert(false, "Should throw MissingLedgerHistoryError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.MissingLedgerHistoryError);
      });
    });

    it("getTransaction - not found - future maxLedgerVersion", () => {
      const hash = hashes.NOTFOUND_TRANSACTION_HASH;
      const options = {
        maxLedgerVersion: 99999999999,
      };
      return this.api.getTransaction(hash, options).then(() => {
        assert(false, "Should throw PendingLedgerVersionError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.PendingLedgerVersionError);
      });
    });

    it("getTransaction - ledger_index not found", () => {
      const hash =
        "4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA11";
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw NotFoundError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.NotFoundError);
        assert(error.message.indexOf("ledger_index") !== -1);
      });
    });

    it("getTransaction - transaction ledger not found", () => {
      const hash =
        "4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA12";
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw NotFoundError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.NotFoundError);
        assert(error.message.indexOf("ledger not found") !== -1);
      });
    });

    it("getTransaction - ledger missing close time", () => {
      const hash =
        "0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A04";
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Should throw UnexpectedError");
      }).catch((error: any) => {
        assert(error instanceof this.api.errors.UnexpectedError);
      });
    });

    it("getTransaction - EscrowCreation", () => {
      const hash =
        "144F272380BDB4F1BD92329A2178BABB70C20F59042C495E10BF72EBFB408EE1";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.escrowCreation,
          "getTransaction"));
    });

    it("getTransaction - EscrowCancellation", () => {
      const hash =
        "F346E542FFB7A8398C30A87B952668DAB48B7D421094F8B71776DA19775A3B22";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.escrowCancellation,
          "getTransaction"));
    });

    it("getTransaction - EscrowExecution", () => {
      const options = {
        minLedgerVersion: 10,
        maxLedgerVersion: 15,
      };
      const hash =
        "CC5277137B3F25EE8B86259C83CB0EAADE818505E4E9BCBF19B1AC6FD136993B";
      return this.api.getTransaction(hash, options).then(
        _.partial(checkResult,
          responses.getTransaction.escrowExecution,
          "getTransaction"));
    });

    it("getTransaction - EscrowExecution simple", () => {
      const hash =
        "CC5277137B3F25EE8B86259C83CB0EAADE818505E4E9BCBF19B1AC6FD1369931";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.escrowExecutionSimple,
          "getTransaction"));
    });

    it("getTransaction - PaymentChannelCreate", () => {
      const hash =
        "0E9CA3AB1053FC0C1CBAA75F636FE1EC92F118C7056BBEF5D63E4C116458A16D";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.paymentChannelCreate,
          "getTransaction"));
    });

    it("getTransaction - PaymentChannelFund", () => {
      const hash =
        "CD053D8867007A6A4ACB7A432605FE476D088DCB515AFFC886CF2B4EB6D2AE8B";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.paymentChannelFund,
          "getTransaction"));
    });

    it("getTransaction - PaymentChannelClaim", () => {
      const hash =
        "81B9ECAE7195EB6E8034AEDF44D8415A7A803E14513FDBB34FA984AB37D59563";
      return this.api.getTransaction(hash).then(
        _.partial(checkResult,
          responses.getTransaction.paymentChannelClaim,
          "getTransaction"));
    });

    it("getTransaction - no Meta", () => {
      const hash =
        "AFB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA1B";
      return this.api.getTransaction(hash).then((result: any) => {
        assert.deepEqual(result, responses.getTransaction.noMeta);
      });
    });

    it("getTransaction - Unrecognized transaction type", () => {
      const hash =
        "AFB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA11";
      closeLedger(this.api.connection);
      return this.api.getTransaction(hash).then(() => {
        assert(false, "Unrecognized transaction type");
      }).catch((error: any) => {
        assert.strictEqual(error.message, "Unrecognized transaction type");
      });
    });

    it("getTransaction - amendment", () => {
      const hash =
        "A971B83ABED51D83749B73F3C1AAA627CD965AFF74BE8CD98299512D6FB0658F";
      return this.api.getTransaction(hash).then((result: any) => {
        assert.deepEqual(result, responses.getTransaction.amendment);
      });
    });

    it("getTransaction - feeUpdate", () => {
      const hash =
        "C6A40F56127436DCD830B1B35FF939FD05B5747D30D6542572B7A835239817AF";
      return this.api.getTransaction(hash).then((result: any) => {
        assert.deepEqual(result, responses.getTransaction.feeUpdate);
      });
    });
  });

  it("getTransactions", () => {
    const options = { types: ["payment", "order"], initiated: true, limit: 2 };
    return this.api.getTransactions(address, options).then(
      _.partial(checkResult, responses.getTransactions.normal,
        "getTransactions"));
  });

  it("getTransactions - earliest first", () => {
    const options = {
      types: ["payment", "order"],
      initiated: true,
      limit: 2,
      earliestFirst: true,
    };
    const expected = _.cloneDeep(responses.getTransactions.normal)
      .sort(utils.compareTransactions);
    return this.api.getTransactions(address, options).then(
      _.partial(checkResult, expected, "getTransactions"));
  });

  it("getTransactions - earliest first with start option", () => {
    const options = {
      types: ["payment", "order"],
      initiated: true,
      limit: 2,
      start: hashes.VALID_TRANSACTION_HASH,
      earliestFirst: true,
    };
    return this.api.getTransactions(address, options).then((data: any) => {
      assert.strictEqual(data.length, 0);
    });
  });

  it("getTransactions - gap", () => {
    const options = {
      types: ["payment", "order"],
      initiated: true,
      limit: 2,
      maxLedgerVersion: 348858000,
    };
    return this.api.getTransactions(address, options).then(() => {
      assert(false, "Should throw MissingLedgerHistoryError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.MissingLedgerHistoryError);
    });
  });

  it("getTransactions - tx not found", () => {
    const options = {
      types: ["payment", "order"],
      initiated: true,
      limit: 2,
      start: hashes.NOTFOUND_TRANSACTION_HASH,
      counterparty: address,
    };
    return this.api.getTransactions(address, options).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getTransactions - filters", () => {
    const options = {
      types: ["payment", "order"],
      initiated: true,
      limit: 10,
      excludeFailures: true,
      counterparty: addresses.ISSUER,
    };
    return this.api.getTransactions(address, options).then((data: any) => {
      assert.strictEqual(data.length, 10);
      assert(_.every(data, (t: any) => t.type === "payment" || t.type === "order"));
      assert(_.every(data, (t: any) => t.outcome.result === "tesSUCCESS"));
    });
  });

  it("getTransactions - filters for incoming", () => {
    const options = {
      types: ["payment", "order"],
      initiated: false,
      limit: 10,
      excludeFailures: true,
      counterparty: addresses.ISSUER,
    };
    return this.api.getTransactions(address, options).then((data: any) => {
      assert.strictEqual(data.length, 10);
      assert(_.every(data, (t: any) => t.type === "payment" || t.type === "order"));
      assert(_.every(data, (t: any) => t.outcome.result === "tesSUCCESS"));
    });
  });

  // this is the case where core.CasinocoinError just falls
  // through the api to the user
  it("getTransactions - error", () => {
    const options = { types: ["payment", "order"], initiated: true, limit: 13 };
    return this.api.getTransactions(address, options).then(() => {
      assert(false, "Should throw CasinocoinError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.CasinocoinError);
    });
  });

  // TODO: this doesn"t test much, just that it doesn"t crash
  it("getTransactions with start option", () => {
    const options = {
      start: hashes.VALID_TRANSACTION_HASH,
      earliestFirst: false,
      limit: 2,
    };
    return this.api.getTransactions(address, options).then(
      _.partial(checkResult, responses.getTransactions.normal,
        "getTransactions"));
  });

  it("getTransactions - start transaction with zero ledger version", () => {
    const options = {
      start: "4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA13",
      limit: 1,
    };
    return this.api.getTransactions(address, options).then(
      _.partial(checkResult, [], "getTransactions"));
  });

  it("getTransactions - no options", () => {
    return this.api.getTransactions(addresses.OTHER_ACCOUNT).then(
      _.partial(checkResult, responses.getTransactions.one, "getTransactions"));
  });

  it("getTrustlines - filtered", () => {
    const options = { currency: "USD" };
    return this.api.getTrustlines(address, options).then(
      _.partial(checkResult,
        responses.getTrustlines.filtered, "getTrustlines"));
  });

  it("getTrustlines - no options", () => {
    return this.api.getTrustlines(address).then(
      _.partial(checkResult, responses.getTrustlines.all, "getTrustlines"));
  });

  it("generateAddress", () => {
    function random() {
      return _.fill(Array(16), 0);
    }
    assert.deepEqual(this.api.generateAddress({ entropy: random() }),
      responses.generateAddress);
  });

  it("generateAddress invalid", () => {
    assert.throws(() => {
      function random() {
        return _.fill(Array(1), 0);
      }
      this.api.generateAddress({ entropy: random() });
    }, this.api.errors.UnexpectedError);
  });

  it("getSettings", () => {
    return this.api.getSettings(address).then(
      _.partial(checkResult, responses.getSettings, "getSettings"));
  });

  it("getSettings - options undefined", () => {
    return this.api.getSettings(address, undefined).then(
      _.partial(checkResult, responses.getSettings, "getSettings"));
  });

  it("getSettings - invalid options", () => {
    assert.throws(() => {
      this.api.getSettings(address, { invalid: "options" });
    }, this.api.errors.ValidationError);
  });

  it("getAccountInfo", () => {
    return this.api.getAccountInfo(address).then(
      _.partial(checkResult, responses.getAccountInfo, "getAccountInfo"));
  });

  it("getAccountInfo - options undefined", () => {
    return this.api.getAccountInfo(address, undefined).then(
      _.partial(checkResult, responses.getAccountInfo, "getAccountInfo"));
  });

  it("getAccountInfo - invalid options", () => {
    assert.throws(() => {
      this.api.getAccountInfo(address, { invalid: "options" });
    }, this.api.errors.ValidationError);
  });

  it("getOrders", () => {
    return this.api.getOrders(address).then(
      _.partial(checkResult, responses.getOrders, "getOrders"));
  });

  it("getOrders", () => {
    return this.api.getOrders(address, undefined).then(
      _.partial(checkResult, responses.getOrders, "getOrders"));
  });

  it("getOrders - invalid options", () => {
    assert.throws(() => {
      this.api.getOrders(address, { invalid: "options" });
    }, this.api.errors.ValidationError);
  });

  describe("getOrderbook", () => {

    it("normal", () => {
      return this.api.getOrderbook(address,
        requests.getOrderbook.normal, undefined).then(
          _.partial(checkResult,
            responses.getOrderbook.normal, "getOrderbook"));
    });

    it("invalid options", () => {
      assert.throws(() => {
        this.api.getOrderbook(address, requests.getOrderbook.normal, { invalid: "options" });
      }, this.api.errors.ValidationError);
    });

    it("with CSC", () => {
      return this.api.getOrderbook(address, requests.getOrderbook.withCSC).then(
        _.partial(checkResult, responses.getOrderbook.withCSC, "getOrderbook"));
    });

    it("sorted so that best deals come first", () => {
      return this.api.getOrderbook(address, requests.getOrderbook.normal)
        .then((data: any) => {
          const bidRates = data.bids.map((bid: any) => bid.properties.makerExchangeRate);
          const askRates = data.asks.map((ask: any) => ask.properties.makerExchangeRate);
          // makerExchangeRate = quality = takerPays.value/takerGets.value
          // so the best deal for the taker is the lowest makerExchangeRate
          // bids and asks should be sorted so that the best deals come first
          assert.deepEqual(_.sortBy(bidRates, (x: any) => Number(x)), bidRates);
          assert.deepEqual(_.sortBy(askRates, (x: any) => Number(x)), askRates);
        });
    });

    it("currency & counterparty are correct", () => {
      return this.api.getOrderbook(address, requests.getOrderbook.normal)
        .then((data: any) => {
          const orders = _.flatten([data.bids, data.asks]);
          _.forEach(orders, (order: any) => {
            const quantity = order.specification.quantity;
            const totalPrice = order.specification.totalPrice;
            const { base, counter } = requests.getOrderbook.normal;
            assert.strictEqual(quantity.currency, base.currency);
            assert.strictEqual(quantity.counterparty, base.counterparty);
            assert.strictEqual(totalPrice.currency, counter.currency);
            assert.strictEqual(totalPrice.counterparty, counter.counterparty);
          });
        });
    });

    it("direction is correct for bids and asks", () => {
      return this.api.getOrderbook(address, requests.getOrderbook.normal)
        .then((data: any) => {
          assert(
            _.every(data.bids, (bid: any) => bid.specification.direction === "buy"));
          assert(
            _.every(data.asks, (ask: any) => ask.specification.direction === "sell"));
        });
    });

  });

  it("getPaymentChannel", () => {
    const channelId =
      "E30E709CF009A1F26E0E5C48F7AA1BFB79393764F15FB108BDC6E06D3CBD8415";
    return this.api.getPaymentChannel(channelId).then(
      _.partial(checkResult, responses.getPaymentChannel.normal,
        "getPaymentChannel"));
  });

  it("getPaymentChannel - full", () => {
    const channelId =
      "D77CD4713AA08195E6B6D0E5BC023DA11B052EBFF0B5B22EDA8AE85345BCF661";
    return this.api.getPaymentChannel(channelId).then(
      _.partial(checkResult, responses.getPaymentChannel.full,
        "getPaymentChannel"));
  });

  it("getPaymentChannel - not found", () => {
    const channelId =
      "DFA557EA3497585BFE83F0F97CC8E4530BBB99967736BB95225C7F0C13ACE708";
    return this.api.getPaymentChannel(channelId).then(() => {
      assert(false, "Should throw entryNotFound");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.CasinocoindError);
      assert(_.includes(error.message, "entryNotFound"));
    });
  });

  it("getPaymentChannel - wrong type", () => {
    const channelId =
      "8EF9CCB9D85458C8D020B3452848BBB42EAFDDDB69A93DD9D1223741A4CA562B";
    return this.api.getPaymentChannel(channelId).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(_.includes(error.message,
        "Payment channel ledger entry not found"));
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getServerInfo", () => {
    return this.api.getServerInfo().then(
      _.partial(checkResult, responses.getServerInfo, "getServerInfo"));
  });

  it("getServerInfo - error", () => {
    this.api.connection._send(JSON.stringify({
      command: "config",
      data: { returnErrorOnServerInfo: true },
    }));

    return this.api.getServerInfo().then(() => {
      assert(false, "Should throw NetworkError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.CasinocoindError);
      assert(_.includes(error.message, "slowDown"));
    });
  });

  it("getServerInfo - no validated ledger", () => {
    this.api.connection._send(JSON.stringify({
      command: "config",
      data: { serverInfoWithoutValidated: true },
    }));

    return this.api.getServerInfo().then((info: any) => {
      assert.strictEqual(info.networkLedger, "waiting");
    }).catch((error: any) => {
      assert(false, "Should not throw Error, got " + String(error));
    });
  });

  it("getFee", () => {
    return this.api.getFee().then((fee: any) => {
      assert.strictEqual(fee, "0.000012");
    });
  });

  it("getFee default", () => {
    this.api._feeCushion = undefined;
    return this.api.getFee().then((fee: any) => {
      assert.strictEqual(fee, "0.000012");
    });
  });

  it("disconnect & isConnected", () => {
    assert.strictEqual(this.api.isConnected(), true);
    return this.api.disconnect().then(() => {
      assert.strictEqual(this.api.isConnected(), false);
    });
  });

  it("getPaths", () => {
    return this.api.getPaths(requests.getPaths.normal).then(
      _.partial(checkResult, responses.getPaths.CscToUsd, "getPaths"));
  });

  it("getPaths - queuing", () => {
    return Promise.all([
      this.api.getPaths(requests.getPaths.normal),
      this.api.getPaths(requests.getPaths.UsdToUsd),
      this.api.getPaths(requests.getPaths.CscToCsc),
    ]).then((results: any) => {
      checkResult(responses.getPaths.CscToUsd, "getPaths", results[0]);
      checkResult(responses.getPaths.UsdToUsd, "getPaths", results[1]);
      checkResult(responses.getPaths.CscToCsc, "getPaths", results[2]);
    });
  });

  // @TODO
  // need decide what to do with currencies/CSC:
  // if add "CSC" in currencies, then there will be exception in
  // cscToDrops function (called from toCasinocoindAmount)
  it("getPaths USD 2 USD", () => {
    return this.api.getPaths(requests.getPaths.UsdToUsd).then(
      _.partial(checkResult, responses.getPaths.UsdToUsd, "getPaths"));
  });

  it("getPaths CSC 2 CSC", () => {
    return this.api.getPaths(requests.getPaths.CscToCsc).then(
      _.partial(checkResult, responses.getPaths.CscToCsc, "getPaths"));
  });

  it("getPaths - source with issuer", () => {
    return this.api.getPaths(requests.getPaths.issuer).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - CSC 2 CSC - not enough", () => {
    return this.api.getPaths(requests.getPaths.CscToCscNotEnough).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - invalid PathFind", () => {
    assert.throws(() => {
      this.api.getPaths(requests.getPaths.invalid);
    }, /Cannot specify both source.amount/);
  });

  it("getPaths - does not accept currency", () => {
    return this.api.getPaths(requests.getPaths.NotAcceptCurrency).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - no paths", () => {
    return this.api.getPaths(requests.getPaths.NoPaths).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - no paths source amount", () => {
    return this.api.getPaths(requests.getPaths.NoPathsSource).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - no paths with source currencies", () => {
    const pathfind = requests.getPaths.NoPathsWithCurrencies;
    return this.api.getPaths(pathfind).then(() => {
      assert(false, "Should throw NotFoundError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.NotFoundError);
    });
  });

  it("getPaths - error: srcActNotFound", () => {
    const pathfind = _.assign({}, requests.getPaths.normal, { source: { address: addresses.NOTFOUND } });
    return this.api.getPaths(pathfind).catch((error: any) => {
      assert(error instanceof this.api.errors.CasinocoinError);
    });
  });

  it("getPaths - send all", () => {
    return this.api.getPaths(requests.getPaths.sendAll).then(
      _.partial(checkResult, responses.getPaths.sendAll, "getPaths"));
  });

  it("getLedgerVersion", (done: any) => {
    this.api.getLedgerVersion().then((ver: any) => {
      assert.strictEqual(ver, 8819951);
      done();
    }, done);
  });

  it("getFeeBase", (done: any) => {
    this.api.connection.getFeeBase().then((fee: any) => {
      assert.strictEqual(fee, 10);
      done();
    }, done);
  });

  it("getFeeRef", (done: any) => {
    this.api.connection.getFeeRef().then((fee: any) => {
      assert.strictEqual(fee, 10);
      done();
    }, done);
  });

  it("getLedger", () => {
    return this.api.getLedger().then(
      _.partial(checkResult, responses.getLedger.header, "getLedger"));
  });

  it("getLedger - future ledger version", () => {
    return this.api.getLedger({ ledgerVersion: 14661789 }).then(() => {
      assert(false, "Should throw LedgerVersionError");
    }).catch((error: any) => {
      assert(error instanceof this.api.errors.LedgerVersionError);
    });
  });

  it("getLedger - with state as hashes", () => {
    const request = {
      includeTransactions: true,
      includeAllData: false,
      includeState: true,
      ledgerVersion: 6,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult, responses.getLedger.withStateAsHashes,
        "getLedger"));
  });

  it("getLedger - with settings transaction", () => {
    const request = {
      includeTransactions: true,
      includeAllData: true,
      ledgerVersion: 4181996,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult, responses.getLedger.withSettingsTx, "getLedger"));
  });

  it("getLedger - with partial payment", () => {
    const request = {
      includeTransactions: true,
      includeAllData: true,
      ledgerVersion: 100000,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult, responses.getLedger.withPartial, "getLedger"));
  });

  it("getLedger - pre 2014 with partial payment", () => {
    const request = {
      includeTransactions: true,
      includeAllData: true,
      ledgerVersion: 100001,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult,
        responses.getLedger.pre2014withPartial,
        "getLedger"));
  });

  it("getLedger - full, then computeLedgerHash", () => {
    const request = {
      includeTransactions: true,
      includeState: true,
      includeAllData: true,
      ledgerVersion: 38129,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult, responses.getLedger.full, "getLedger"))
      .then((response: any) => {
        const ledger = _.assign({}, response, { parentCloseTime: response.closeTime });
        const hash = this.api.computeLedgerHash(ledger);
        assert.strictEqual(hash,
          "E6DB7365949BF9814D76BCC730B01818EB9136A89DB224F3F9F5AAE4569D758E");
      });
  });

  it("computeLedgerHash - wrong hash", () => {
    const request = {
      includeTransactions: true,
      includeState: true,
      includeAllData: true,
      ledgerVersion: 38129,
    };
    return this.api.getLedger(request).then(
      _.partial(checkResult, responses.getLedger.full, "getLedger"))
      .then((response: any) => {
        const ledger = _.assign({}, response, {
          parentCloseTime: response.closeTime,
          stateHash: "D9ABF622DA26EEEE48203085D4BC23B0F77DC6F8724AC33D975DA3CA492D2E44",
        });
        assert.throws(() => {
          const hash = this.api.computeLedgerHash(ledger);
          // TODO: commented out, needed?
          // unused(hash);
        }, /does not match computed hash of state/);
      });
  });

  it("CasinocoinError with data", () => {
    const error = new this.api.errors.CasinocoinError("_message_", "_data_");
    assert.strictEqual(error.toString(),
      "[CasinocoinError(_message_, \"_data_\")]");
  });

  it("NotFoundError default message", () => {
    const error = new this.api.errors.NotFoundError();
    assert.strictEqual(error.toString(),
      "[NotFoundError(Not found)]");
  });

  it("common utils - toCasinocoindAmount", () => {
    const amount = { issuer: "is", currency: "c", value: "v" };

    assert.deepEqual(utils.common.toCasinocoindAmount(amount), {
      issuer: "is",
      currency: "c",
      value: "v",
    });
  });

  it("ledger utils - renameCounterpartyToIssuerInOrder", () => {
    const order = { taker_gets: { issuer: "1" } };
    const expected = { taker_gets: { issuer: "1" } };

    assert.deepEqual(utils.renameCounterpartyToIssuerInOrder(order), expected);
  });

  it("ledger utils - compareTransactions", () => {
    assert.strictEqual(utils.compareTransactions({}, {}), 0);
    let first = { outcome: { ledgerVersion: 1, indexInLedger: 100 } };
    let second = { outcome: { ledgerVersion: 1, indexInLedger: 200 } };

    assert.strictEqual(utils.compareTransactions(first, second), -1);

    first = { outcome: { ledgerVersion: 1, indexInLedger: 100 } };
    second = { outcome: { ledgerVersion: 1, indexInLedger: 100 } };

    assert.strictEqual(utils.compareTransactions(first, second), 0);

    first = { outcome: { ledgerVersion: 1, indexInLedger: 200 } };
    second = { outcome: { ledgerVersion: 1, indexInLedger: 100 } };

    assert.strictEqual(utils.compareTransactions(first, second), 1);
  });

  it("ledger utils - getRecursive", () => {
    function getter(marker: any, limit: any) {
      return new Promise((resolve, reject) => {
        if (marker === undefined) {
          resolve({ marker: "A", limit, results: [1] });
        } else {
          reject(new Error());
        }
      });
    }
    return utils.getRecursive(getter, 10).then(() => {
      assert(false, "Should throw Error");
    }).catch((error: any) => {
      assert(error instanceof Error);
    });
  });

  describe("schema-validator", () => {
    it("valid", () => {
      assert.doesNotThrow(() => {
        schemaValidator.schemaValidate("hash256",
          "0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F");
      });
    });

    it("invalid", () => {
      assert.throws(() => {
        schemaValidator.schemaValidate("hash256", "invalid");
      }, this.api.errors.ValidationError);
    });

    it("invalid - empty value", () => {
      assert.throws(() => {
        schemaValidator.schemaValidate("hash256", "");
      }, this.api.errors.ValidationError);
    });

    it("schema not found error", () => {
      assert.throws(() => {
        schemaValidator.schemaValidate("unexisting", "anything");
      }, /no schema/);
    });

  });

  describe("validator", () => {

    it("validateLedgerRange", () => {
      const options = {
        minLedgerVersion: 20000,
        maxLedgerVersion: 10000,
      };
      const thunk = _.partial(validate.getTransactions, { address, options });
      assert.throws(thunk, this.api.errors.ValidationError);
      assert.throws(thunk,
        /minLedgerVersion must not be greater than maxLedgerVersion/);
    });

    it("secret", () => {
      function validateSecret(secret: any) {
        validate.sign({ txJSON: "", secret });
      }
      assert.doesNotThrow(_.partial(validateSecret,
        "shzjfakiK79YQdMjy4h8cGGfQSV6u"));
      assert.throws(_.partial(validateSecret,
        "shzjfakiK79YQdMjy4h8cGGfQSV6v"), this.api.errors.ValidationError);
      assert.throws(_.partial(validateSecret, 1),
        this.api.errors.ValidationError);
      assert.throws(_.partial(validateSecret, ""),
        this.api.errors.ValidationError);
      assert.throws(_.partial(validateSecret, "s!!!"),
        this.api.errors.ValidationError);
      assert.throws(_.partial(validateSecret, "passphrase"),
        this.api.errors.ValidationError);
      // 32 0s is a valid hex repr of seed bytes
      const hex = new Array(33).join("0");
      assert.throws(_.partial(validateSecret, hex),
        this.api.errors.ValidationError);
    });

  });

  it("ledger event", (done: any) => {
    this.api.on("ledger", (message: any) => {
      checkResult(responses.ledgerEvent, "ledgerEvent", message);
      done();
    });
    closeLedger(this.api.connection);
  });
});

describe("CasinocoinAPI - offline", () => {
  it("prepareSettings and sign", () => {
    const api = new CasinocoinAPI();
    const secret = "shsWGZcmZz6YsWWmcnpfr6fLTdtFV";
    const settings = requests.prepareSettings.domain;
    const instructions = {
      sequence: 23,
      maxLedgerVersion: 8820051,
      fee: "0.000012",
    };
    return api.prepareSettings(address, settings, instructions).then((data: any) => {
      checkResult(responses.prepareSettings.flags, "prepare", data);
      assert.deepEqual(api.sign(data.txJSON, secret),
        responses.prepareSettings.signed);
    });
  });

  it("getServerInfo - offline", () => {
    const api = new CasinocoinAPI();
    return api.getServerInfo().then(() => {
      assert(false, "Should throw error");
    }).catch((error: any) => {
      assert(error instanceof api.errors.NotConnectedError);
    });
  });

  it("computeLedgerHash", () => {
    const api = new CasinocoinAPI();
    const header = requests.computeLedgerHash.header;
    const ledgerHash = api.computeLedgerHash(header);
    assert.strictEqual(ledgerHash,
      "F4D865D83EB88C1A1911B9E90641919A1314F36E1B099F8E95FE3B7C77BE3349");
  });

  it("computeLedgerHash - with transactions", () => {
    const api = new CasinocoinAPI();
    const header = _.omit(requests.computeLedgerHash.header,
      "transactionHash");
    header.rawTransactions = JSON.stringify(
      requests.computeLedgerHash.transactions);
    const ledgerHash = api.computeLedgerHash(header);
    assert.strictEqual(ledgerHash,
      "F4D865D83EB88C1A1911B9E90641919A1314F36E1B099F8E95FE3B7C77BE3349");
  });

  it("computeLedgerHash - incorrent transaction_hash", () => {
    const api = new CasinocoinAPI();
    const header = _.assign({}, requests.computeLedgerHash.header, {
      transactionHash: "325EACC5271322539EEEC2D6A5292471EF1B3E72AE7180533EFC3B8F0AD435C9",
    });
    header.rawTransactions = JSON.stringify(
      requests.computeLedgerHash.transactions);
    assert.throws(() => api.computeLedgerHash(header));
  });

  /* eslint-disable no-unused-vars */
  it("CasinocoinAPI - implicit server port", () => {
    const api = new CasinocoinAPI({ server: "wss://s1.casinocoin.com" });
  });
  /* eslint-enable no-unused-vars */
  it("CasinocoinAPI invalid options", () => {
    assert.throws(() => new CasinocoinAPI({ invalid: true }));
  });

  it("CasinocoinAPI valid options", () => {
    const api = new CasinocoinAPI({ server: "wss://s:1" });
    assert.deepEqual(api.connection._url, "wss://s:1");
  });

  it("CasinocoinAPI invalid server uri", () => {
    assert.throws(() => new CasinocoinAPI({ server: "wss//s:1" }));
  });

});
