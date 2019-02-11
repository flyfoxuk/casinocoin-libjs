const masterAccount = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";
const masterSecret = "snoPBrXtMeMyMHUVTgbuqAfg1SUTb";

function ledgerAccept(api: any) {
  const request = { command: "ledger_accept" };
  return api.connection.request(request);
}

function pay(
  api: any,
  from: string,
  to: string,
  amount: any,
  secret: any,
  currency: string = "CSC",
  counterParty: any,
) {
  const paymentSpecification = {
    source: {
      address: from,
      maxAmount: {
        value: amount,
        currency,
      },
    },
    destination: {
      address: to,
      amount: {
        value: amount,
        currency,
      },
    },
  };

  if (counterParty !== undefined) {
    // paymentSpecification.source.maxAmount.counterparty = counterParty;
    // paymentSpecification.destination.amount.counterparty = counterParty;
    paymentSpecification.source.maxAmount.currency = counterParty;
    paymentSpecification.destination.amount.currency = counterParty;
  }

  let id: any = null;
  return api.preparePayment(from, paymentSpecification, {})
    .then((data: any) => api.sign(data.txJSON, secret))
    .then((signed: any) => {
      id = signed.id;
      return api.submit(signed.signedTransaction);
    })
    .then(() => ledgerAccept(api))
    .then(() => id);
}

function payTo(
  api: any,
  to: string,
  amount: any = "4003218",
  currency: string = "CSC",
  counterParty: any,
) {
  return pay(
    api,
    masterAccount,
    to,
    amount,
    masterSecret,
    currency,
    counterParty,
  );
}

export {
  pay,
  payTo,
  ledgerAccept,
};
