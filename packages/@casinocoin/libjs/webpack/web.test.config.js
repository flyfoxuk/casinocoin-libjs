const path = require("path");
const Webpack = require("webpack");

module.exports = {

  mode: "none",
  entry: {
    "range-set-test": path.resolve(__dirname, "../test/rangeset-test.ts"),
    "connection-test": path.resolve(__dirname, "../test/connection-test.ts"),
    "api-test": path.resolve(__dirname, "../test/api-test.ts"),
    "broadcast-api-test": path.resolve(__dirname, "../test/broadcast-api-test.ts"),
    "integration-test": path.resolve(__dirname, "../test/integration/integration-test.ts")
  },
  output: {
    library: "[name]",
    path: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/test-compiled-for-web/"),
    filename: "[name].js"
  },
  externals: {
    "lodash": "_",
    "casinocoin-api": "casinocoin",
    "net": "null"
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: [path.resolve(__dirname, "../node_modules")]
  },
  module: {
    rules: [
      {
        test: /jayson/,
        use: 'null',
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: "/node_modules/"
      }
    ]
  },

  plugins: [
    /**
    * Provides `EventEmitter` interface for native browser `WebSocket`,
    * same, as `ws` package provides.
    */
    new Webpack.NormalModuleReplacementPlugin(/^ws$/, path.resolve(__dirname, '../src/common/wswrapper')),
    /**
    * Provides credentials for testing web wallet
    */
    new Webpack.NormalModuleReplacementPlugin(/^\.\/wallet$/, path.resolve(__dirname, '../test/integration/wallet-web')),
    /**
    * Provides the config bootstrapping when testing the api from a web client
    */
    new Webpack.NormalModuleReplacementPlugin(/^.*setup-api$/, path.resolve(__dirname, '../test/setup-api-web'))
  ]

};