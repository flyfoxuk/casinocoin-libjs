# casinocoin-libjs

A JavaScript API for interacting with casinocoind using a Node or browser client.

[![Circle CI](https://circleci.com/gh/casinocoin/casinocoin-libjs/tree/develop.svg?style=svg)](https://circleci.com/gh/casinocoin/casinocoin-libjs/tree/develop) [![Coverage Status](https://coveralls.io/repos/casinocoin/casinocoin-libjs/badge.png?branch=develop)](https://coveralls.io/r/casinocoin/casinocoin-libjs?branch=develop)

[![NPM](https://nodei.co/npm/casinocoin-libjs.png)](https://www.npmjs.org/package/casinocoin-libjs)

## Features

+ Connect to a casinocoind server in Node.js
+ Issue [casinocoind API](https://casinocoin.org/build/casinocoind-apis/) requests
+ Listen to events on the Casinocoin network (transaction, ledger, etc.)
+ Sign and submit transactions to the Casinocoin network

## Installation

```bash
$ npm i @casinocoin/libjs --save
```

### Node.js

If libjs is utilized in Node.js server-side solution, please install the following required peer dependencies:

```bash
$ npm i bufferutil utf-8-validate --save
```

## For Project Contributors

### Directory Structure

```bash
|- docs
|- scripts
|- src
|   |- common
|   |- ledger
|   |- offline
|   |- server
|   |- transaction
|- test
|- webpack
```

This project is driven by 3 Webpack configurations:

* dev
  * Webpack dashboard + bundle analyzer (port 3001) + directory src/ file watcher
* build
  * generates production bundle in repo root directory dist/@casinocoin/libjs
* test
  * functional but full coverage is a WIP

### Key CLI Commands

```bash
# starts Webpack development console and watches packages/libjs/src directory
$ npm run dev

# builds package in top-level dist/@casinocoin/libjs directory
$ npm run build

# test (server)
npm run test:server

# test (client)
$ npm run test:client
```

Then see the [documentation](https://github.com/casinocoin/casinocoin-libjs/blob/develop/docs/index.md) and [code samples](https://github.com/casinocoin/casinocoin-libjs/tree/develop/docs/samples)

## Running tests

1. Clone the repository
2. `cd` into the repository and install dependencies with `npm install`
3. `npm test` or `npm test --coverage` (`istanbul` will create coverage reports in coverage/lcov-report/`)

## Generating Documentation

The continuous integration tests require that the documentation stays up-to-date. If you make changes to the JSON schemas, fixtures, or documentation sources, you must update the documentation by running `npm run docgen`.

## Related Documents

+ [LICENSE](./LICENSE)
+ [CHANGELOG](./CHANGELOG.md)

## More Information

+ [Casinocoin Dev Portal](https://casinocoin.org/build/)
