'use strict';

const masterAccount = 'ch6BULZAU4qrQaWQccJSwcFgEYhz2Ysz4a';
const masterSecret = 'shPfF1bJQwMZngxuBPkQAjPNeAwCV';

function ledgerAccept(api) {
  const request = {command: 'ledger_accept'};
  return api.connection.request(request);
}

function pay(api, from, to, amount, secret, currency = 'CSC', counterparty) {
  const paymentSpecification = {
    source: {
      address: from,
      maxAmount: {
        value: amount,
        currency: currency
      }
    },
    destination: {
      address: to,
      amount: {
        value: amount,
        currency: currency
      }
    }
  };

  if (counterparty !== undefined) {
    paymentSpecification.source.maxAmount.counterparty = counterparty;
    paymentSpecification.destination.amount.counterparty = counterparty;
  }

  let id = null;
  return api.preparePayment(from, paymentSpecification, {})
    .then(data => api.sign(data.txJSON, secret))
    .then(signed => {
      id = signed.id;
      return api.submit(signed.signedTransaction);
    })
    .then(() => ledgerAccept(api))
    .then(() => id);
}


function payTo(api, to, amount = '4003218', currency = 'CSC', counterparty) {
  return pay(api, masterAccount, to, amount, masterSecret, currency,
    counterparty);
}


module.exports = {
  pay,
  payTo,
  ledgerAccept
};
