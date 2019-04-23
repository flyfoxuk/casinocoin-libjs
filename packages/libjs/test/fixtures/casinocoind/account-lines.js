'use strict';
const _ = require('lodash');
const BASE_LEDGER_INDEX = 8819951;

module.exports.normal = function(request, options = {}) {
  _.defaults(options, {
    ledger: BASE_LEDGER_INDEX
  });

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: request.account,
      marker: options.marker,
      limit: request.limit,
      ledger_index: options.ledger,
      lines: _.filter([{
        account: 'cLBCrCrUjQsS7ikPKpAxhyhJFrwYrLwwQW',
        balance: '0',
        currency: 'ASP',
        limit: '0',
        limit_peer: '10',
        quality_in: 1000000000,
        quality_out: 0
      },
      {
        account: 'cLBCrCrUjQsS7ikPKpAxhyhJFrwYrLwwQW',
        balance: '0',
        currency: 'XAU',
        limit: '0',
        limit_peer: '0',
        no_casinocoin: true,
        no_casinocoin_peer: true,
        quality_in: 0,
        quality_out: 0,
        freeze: true
      },
      {
        account: 'cDEDNoEfjywwdyGNgPXXsQ679iYoA8Lm6G',
        balance: '2.497605752725159',
        currency: 'USD',
        limit: '5',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0,
        freeze: true
      },
      {
        account: 'cfCUs78SKWoe4W7ThZ4LLG65SR4gyhT9ib',
        balance: '481.992867407479',
        currency: 'MXN',
        limit: '1000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cEt8uwuBZJJNiSxbcK6sTHNadZUzUswa8k',
        balance: '0.793598266778297',
        currency: 'EUR',
        limit: '1',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c35n94SkL3HJVKCSXmnDFoLcFMPCUAwMvS',
        balance: '0',
        currency: 'CNY',
        limit: '3',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c3WHSLPbenT2UJwWB6j4hUzCzAqo33ewFh',
        balance: '1.294889190631542',
        currency: 'DYM',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '0.3488146605801446',
        currency: 'CHF',
        limit: '0',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '2.114103174931847',
        currency: 'BTC',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '0',
        currency: 'USD',
        limit: '5000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c4D8RPYNxohiSgtmDwj1JebW9xzWaRsSBd',
        balance: '-0.00111',
        currency: 'BTC',
        limit: '0',
        limit_peer: '10',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cMYaEjWCr13cdS8kekM1r6VqX5LcVb2ZJo',
        balance: '-0.1010780000080207',
        currency: 'BTC',
        limit: '0',
        limit_peer: '10',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cEt8uwuBZJJNiSxbcK6sTHNadZUzUswa8k',
        balance: '1',
        currency: 'USD',
        limit: '1',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'ciXjUfQWu2ZS5fKTHUZqL5HNqAVE86ZjQ',
        balance: '8.07619790068559',
        currency: 'CNY',
        limit: '100',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '7.292695098901099',
        currency: 'JPY',
        limit: '0',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cLBCrCrUjQsS7ikPKpAxhyhJFrwYrLwwQW',
        balance: '0',
        currency: 'AUX',
        limit: '0',
        limit_peer: '0',
        no_casinocoin: true,
        no_casinocoin_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cKLQcYKPwoNBqu85UGSN38tcMuDK5UjjiQ',
        balance: '0',
        currency: 'USD',
        limit: '1',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '12.41688780720394',
        currency: 'EUR',
        limit: '100',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cEAndYQ8LQ8zZ9qncNLnL3jrNjCyfhrKim',
        balance: '35',
        currency: 'USD',
        limit: '500',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c3sC4sUHGHY6E6rftFxWVBGbGoqtTP6RnX',
        balance: '-5',
        currency: 'JOE',
        limit: '0',
        limit_peer: '50',
        no_casinocoin_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c4Ra1ZXmj437mqkrwPXqw5BpBEVb9qqBn5',
        balance: '0',
        currency: 'USD',
        limit: '0',
        limit_peer: '100',
        no_casinocoin_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c4Ra1ZXmj437mqkrwPXqw5BpBEVb9qqBn5',
        balance: '0',
        currency: 'JOE',
        limit: '0',
        limit_peer: '100',
        no_casinocoin_peer: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cauGAPTc6b4zqnYg3MaH2iQSWvf74nub2S',
        balance: '0',
        currency: '015841551A748AD2C1F76FF6ECB0CCCD00000000',
        limit: '10.01037626125837',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'c9vqAaCmaUSAehUrpAnnbBQtLfWo8ZgF8L',
        balance: '0',
        currency: 'USD',
        limit: '0',
        limit_peer: '1',
        quality_in: 0,
        quality_out: 0,
        freeze: true
      }
      ], item => !request.peer || item.account === request.peer)
    }
  });
};

module.exports.counterparty = function(request, options = {}) {
  _.defaults(options, {
    ledger: BASE_LEDGER_INDEX
  });

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: request.account,
      marker: options.marker,
      limit: request.limit,
      ledger_index: options.ledger,
      lines: [{
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '0.3488146605801446',
        currency: 'CHF',
        limit: '0',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '2.114103174931847',
        currency: 'BTC',
        limit: '3',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '0',
        currency: 'USD',
        limit: '5000',
        limit_peer: '0',
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '7.292695098901099',
        currency: 'JPY',
        limit: '0',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      },
      {
        account: 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs',
        balance: '12.41688780720394',
        currency: 'EUR',
        limit: '100',
        limit_peer: '0',
        no_casinocoin: true,
        quality_in: 0,
        quality_out: 0
      }
      ]
    }
  });
};
