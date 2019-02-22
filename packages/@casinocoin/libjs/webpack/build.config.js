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
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].[chunkhash:8]-" + pkg.version + ".js",
    sourceMapFilename: "[name].[chunkhash:8]-" + pkg.version + ".map",
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
        {
          from: path.resolve(__dirname, "../HISTORY.md"),
          to: path.resolve(__dirname, "../dist/HISTORY.md")
        }
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