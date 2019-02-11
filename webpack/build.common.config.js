const path = require("path");
const Webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TsLintPlugin = require("tslint-webpack-plugin");

module.exports = {

  mode: "production",
  entry: path.resolve(__dirname, "../src/index.ts"),

  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: [path.resolve(__dirname, "../node_modules")]
  },

  module: {

    rules: [

      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: "/node_modules/"
      }

    ]

  },

  plugins: [
    /* Violations will not stop the build, purely for reporting purposes */
    new TsLintPlugin({
      files: [
        "./src/**/*.ts"
      ],
      config: "./tslint.json",
      silent: false
    })
  ],

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        test: /\.js(\?.*)?$/i,
        include: /\src/,
        exclude: ["_", "CasinocoinError", "CasinocoindError", "UnexpectedError",
          "LedgerVersionError", "ConnectionError", "NotConnectedError",
          "DisconnectedError", "TimeoutError", "ResponseFormatError",
          "ValidationError", "NotFoundError", "MissingLedgerHistoryError",
          "PendingLedgerVersionError"
        ],
        cache: true,
        parallel: true,
        sourceMap: true,
        extractComments: true,
        warningsFilter: (warning, src) => {
          return true;
        },
        uglifyOptions: {
          warnings: true,
          parse: {},
          compress: {},
          mangle: true,
          output: {
            comments: false
          },
          sourceMap: true,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_fnames: false,
        },
      })
    ],
  },

};