const path = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const buildCommonConfig = require("./build.common.config");
const pkg = require("../package.json");

module.exports = webpackMerge(buildCommonConfig, {

  target: "node",
  output: {
    path: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs"),
    filename: pkg.name + "-" + pkg.version + ".js",
    sourceMapFilename: pkg.name + "-" + pkg.version + ".map",
    publicPath: "/"
  },

  plugins: [
    new DefinePlugin({
      "process.env": {
        NODE_ENV: "'production'"
      }
    }),

    // copy static assets
    new CopyWebpackPlugin(
      [
        // {
        //   from: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/HISTORY.md"),
        //   to: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/HISTORY.md")
        // }
      ]
    ),

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