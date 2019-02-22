# casinocoin-libjs

A JavaScript API for interacting with Casinocoin in Node.js

[![Circle CI](https://circleci.com/gh/casinocoin/casinocoin-libjs/tree/develop.svg?style=svg)](https://circleci.com/gh/casinocoin/casinocoin-libjs/tree/develop) [![Coverage Status](https://coveralls.io/repos/casinocoin/casinocoin-libjs/badge.png?branch=develop)](https://coveralls.io/r/casinocoin/casinocoin-libjs?branch=develop)

[![NPM](https://nodei.co/npm/casinocoin-libjs.png)](https://www.npmjs.org/package/casinocoin-libjs)

### Features

+ Connect to a casinocoind server in Node.js
+ Issue [casinocoind API](https://casinocoin.org/build/casinocoind-apis/) requests
+ Listen to events on the Casinocoin network (transaction, ledger, etc.)
+ Sign and submit transactions to the Casinocoin network

## Getting Started

Install `casinocoin-libjs` using npm:
```
  $ npm install casinocoin-libjs
```

Then see the [documentation](https://github.com/casinocoin/casinocoin-libjs/blob/develop/docs/index.md) and [code samples](https://github.com/casinocoin/casinocoin-libjs/tree/develop/docs/samples)

## Running tests

1. Clone the repository
2. `cd` into the repository and install dependencies with `npm install`
3. `npm test` or `npm test --coverage` (`istanbul` will create coverage reports in coverage/lcov-report/`)

## Generating Documentation

The continuous integration tests require that the documentation stays up-to-date. If you make changes to the JSON schemas, fixtures, or documentation sources, you must update the documentation by running `npm run docgen`.

## More Information

+ [Casinocoin Dev Portal](https://casinocoin.org/build/)
