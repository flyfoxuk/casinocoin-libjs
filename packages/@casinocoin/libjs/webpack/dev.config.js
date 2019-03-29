const path = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const HotModuleReplacementPlugin = require("webpack/lib/HotModuleReplacementPlugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const devCommonConfig = require("./dev.common.config");

module.exports = webpackMerge(devCommonConfig, {

  entry: path.resolve(__dirname, "../src/index.ts"),
  target: "node",
  output: {
    path: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs"),
    // filename: "index.js",
    // sourceMapFilename: "index.js.map",
    filename: "casinocoin-libjs.js",
    sourceMapFilename: "casinocoin-libjs.map",
    library: "casinocoin-libjs",
    libraryTarget: "umd",
    publicPath: "/"
  },

  plugins: [
    new DashboardPlugin(),
    new HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: "server",
      analyzerHost: "0.0.0.0",
      analyzerPort: 3001,
      reportFilename: "bundle-report.html",
      defaultSizes: "parsed",
      openAnalyzer: false,
      generateStatsFile: false,
      statsFilename: "bundle-stats.json",
      statsOptions: null,
      logLevel: "info"
    })
  ]

  // devServer: {
  //   host: "localhost",
  //   port: 3000,
  //   contentBase: path.resolve(__dirname, "../dist"),
  //   watchContentBase: true,
  //   compress: true,
  //   hot: true,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  //     "Access-Control-Allow-Headers": "*"
  //   },
  //   historyApiFallback: {
  //     disableDotRule: true
  //   },
  //   watchOptions: {
  //     ignored: /node_modules/
  //   },
  //   overlay: {
  //     warnings: true,
  //     errors: true
  //   }
  // }

});
