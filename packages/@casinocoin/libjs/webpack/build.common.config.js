const path = require("path");
const Webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {

  mode: "production",
  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: [path.resolve(__dirname, "../node_modules")]
  },

  externals: [
    /node_modules/,
    'lodash',
    'bufferutil',
    'utf-8-validate'
  ],

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

  plugins: [],

  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        // include: /\src/,
        exclude: ["_", "CasinocoinError", "CasinocoindError", "UnexpectedError",
          "LedgerVersionError", "ConnectionError", "NotConnectedError",
          "DisconnectedError", "TimeoutError", "ResponseFormatError",
          "ValidationError", "NotFoundError", "MissingLedgerHistoryError",
          "PendingLedgerVersionError"
        ],
        cache: false,
        parallel: true,
        sourceMap: true,
        extractComments: true,
        // terserOptions: {
        //   warnings: true,
        //   parse: {},
        //   compress: {},
        //   mangle: true,
        //   output: {
        //     comments: false
        //   },
        //   toplevel: false,
        //   nameCache: null,
        //   keep_classnames: undefined,
        //   keep_fnames: false,
        // },
      })
    ],
  },

};