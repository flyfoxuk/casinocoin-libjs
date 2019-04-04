const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {

  mode: "production",
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
        exclude: ["_", "CasinocoinError", "CasinocoindError", "UnexpectedError",
          "LedgerVersionError", "ConnectionError", "NotConnectedError",
          "DisconnectedError", "TimeoutError", "ResponseFormatError",
          "ValidationError", "NotFoundError", "MissingLedgerHistoryError",
          "PendingLedgerVersionError"
        ],
        cache: false,
        parallel: true,
        sourceMap: false,
        extractComments: true,
      })
    ],
  },

};
