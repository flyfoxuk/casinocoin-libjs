const path = require("path");
const webpackMerge = require("webpack-merge");
const DashboardPlugin = require("webpack-dashboard/plugin");
const HotModuleReplacementPlugin = require("webpack/lib/HotModuleReplacementPlugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const devCommonConfig = require("./dev.common.config");

module.exports = webpackMerge(devCommonConfig, {

  entry: path.resolve(__dirname, "../src/index.ts"),
  target: "node",
  output: {
    path: path.resolve(__dirname, "../../../dist/@casinocoin/libjs"),
    filename: "index.js",
    sourceMapFilename: "index.js.map",
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

});
