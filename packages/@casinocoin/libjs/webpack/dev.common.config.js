const path = require("path");
const TsLintPlugin = require("tslint-webpack-plugin");
const Webpack = require("webpack");

module.exports = {

  mode: "development",

  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: [path.resolve(__dirname, "../node_modules")]
  },

  externals: [
    /node_modules/,
    'bufferutil',
    'utf-8-validate'
  ],

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
    // new TsLintPlugin({
    //   files: [
    //     "./src/**/*.ts"
    //   ],
    //   config: "./tslint.json",
    //   silent: false
    // })
  ],

  optimization: {
  },

};