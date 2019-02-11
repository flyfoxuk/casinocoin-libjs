import * as _ from "lodash";
import { EventEmitter } from "events";
import * as common from "./common/index";
import * as server from "./server/server";
import getTransaction from "./ledger/transaction";
import getTransactions from "./ledger/transactions";
import getTrustlines from "./ledger/trustlines";
import getBalances from "./ledger/balances";
import getBalanceSheet from "./ledger/balance-sheet";
import getPaths from "./ledger/pathfind";
import getOrders from "./ledger/orders";
import getOrderbook from "./ledger/orderbook";
import getSettings from "./ledger/settings";
import getAccountInfo from "./ledger/accountinfo";
import getPaymentChannel from "./ledger/payment-channel";
import preparePayment from "./transaction/payment";
import prepareTrustline from "./transaction/trustline";
import prepareOrder from "./transaction/order";
import prepareOrderCancellation from "./transaction/ordercancellation";
import prepareEscrowCreation from "./transaction/escrow-creation";
import prepareEscrowExecution from "./transaction/escrow-execution";
import prepareEscrowCancellation from "./transaction/escrow-cancellation";
import preparePaymentChannelCreate from "./transaction/payment-channel-create";
import preparePaymentChannelFund from "./transaction/payment-channel-fund";
import preparePaymentChannelClaim from "./transaction/payment-channel-claim";
import prepareSettings from "./transaction/settings";
import sign from "./transaction/sign";
import combine from "./transaction/combine";
import submit from "./transaction/submit";
import { generateAddressAPI } from "./offline/generate-address";
import computeLedgerHash from "./offline/ledgerhash";
import signPaymentChannelClaim from "./offline/sign-payment-channel-claim";
import verifyPaymentChannelClaim from "./offline/verify-payment-channel-claim";
import getLedger from "./ledger/ledger";
import signMessage from "./offline/sign-message";
import verifyMessage from "./offline/verify-message";
import prepareKYCSet from "./transaction/kyc";
import getKYCInfo from "./ledger/kycinfo";
import { LedgerVersionError } from "./common/errors";
import Connection from "./common/connection";

const connect = server.connect;
const disconnect = server.disconnect;
const getServerInfo = server.getServerInfo;
const getFee = server.getFee;
const isConnected = server.isConnected;
const getLedgerVersion = server.getLedgerVersion;
const errors = common.errors;
const generateAddress = generateAddressAPI;

type APIOptions = {
  server?: string,
  feeCushion?: number,
  trace?: boolean,
  proxy?: string,
  timeout?: number,
};

// prevent access to non-validated ledger versions
// TODO: Ask Andre what was happening with original 'extends common.Connection'
class RestrictedConnection extends Connection {

  // TODO: This is a guess. Ask Andre how this is set
  // (no public interface or datatype binding)
  // private ledgerVersion: number;

  public request(request: any, timeout?: number): Promise<LedgerVersionError> {
    const ledger_index = request.ledger_index;
    // TODO: See above TODO
    let ledgerVersion: number = 0;
    this.getLedgerVersion().then((ledgerVer: number) => {
      ledgerVersion = ledgerVer;
    });
    if (ledger_index !== undefined && ledger_index !== "validated") {
      if (!_.isNumber(ledger_index) || ledger_index > ledgerVersion) {
        return Promise.reject(new errors.LedgerVersionError(
          `ledgerVersion ${ledger_index} is greater than server\"s ` +
          `most recent validated ledger: ${ledgerVersion}`));
      }
    }
    return super.request(request, timeout);
  }
}

class CasinocoinAPI extends EventEmitter {

  public combine = combine;
  public computeLedgerHash = computeLedgerHash;
  public connect = connect;
  public disconnect = disconnect;
  public errors = errors;
  public generateAddress = generateAddress;
  public getAccountInfo = getAccountInfo;
  public getBalanceSheet = getBalanceSheet;
  public getBalances = getBalances;
  public getFee = getFee;
  public KYCInfo = getKYCInfo;
  public getLedger = getLedger;
  public getLedgerVersion = getLedgerVersion;
  public getOrderbook = getOrderbook;
  public getOrders = getOrders;
  public getPaths = getPaths;
  public getPaymentChannels = getPaymentChannel;
  public getServerInfo = getServerInfo;
  public getSettings = getSettings;
  public getTransaction = getTransaction;
  public getTransactions = getTransactions;
  public getTrustlines = getTrustlines;
  public isConnected = isConnected;
  public prepareEscrowCancellation = prepareEscrowCancellation;
  public prepareEscrowCreation = prepareEscrowCreation;
  public prepareEscrowExecution = prepareEscrowExecution;
  public prepareKYCSet = prepareKYCSet;
  public prepareOrder = prepareOrder;
  public prepareOrderCancellation = prepareOrderCancellation;
  public preparePayment = preparePayment;
  public preparePaymentChannelClaim = preparePaymentChannelClaim;
  public preparePaymentChannelCreate = preparePaymentChannelCreate;
  public preparePaymentChannelFund = preparePaymentChannelFund;
  public prepareSettings = prepareSettings;
  public prepareTrustline = prepareTrustline;
  public sign = sign;
  public signMessage = signMessage;
  public signPaymentChannelClaim = signPaymentChannelClaim;
  public submit = submit;
  public verifyMessage = verifyMessage;
  public verifyPaymentChannelClaim = verifyPaymentChannelClaim;

  public private = {
    RangeSet: require("./common/rangeset").RangeSet,
    ledgerUtils: require("./ledger/utils"),
    schemaValidator: require("./common/schema-validator"),
    validate: common.validate,
  };

  private feeCushion: number;
  private connection: RestrictedConnection;

  constructor(options: APIOptions = {}) {
    super();
    common.validate.apiOptions(options);
    this.feeCushion = options.feeCushion || 1.2;
    const serverURL = options.server;
    if (serverURL !== undefined) {
      this.connection = new RestrictedConnection(serverURL, options);
      this.connection.on("ledgerClosed", (message: string) => {
        this.emit("ledger", server.formatLedgerClose(message));
      });
      this.connection.on("error", (errorCode: any, errorMessage: any, data: any) => {
        this.emit("error", errorCode, errorMessage, data);
      });
      this.connection.on("connected", () => {
        this.emit("connected");
      });
      this.connection.on("disconnected", (code: any) => {
        this.emit("disconnected", code);
      });
    } else {
      // use null object pattern to provide better error message if user
      // tries to call a method that requires a connection
      // TODO: Ask Andre about constructor
      this.connection = new RestrictedConnection(null, options);
    }
  }
}

export {
  CasinocoinAPI,
};
