const path = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const buildCommonConfig = require("./build.common.config");
const pkg = require("../package.json");

module.exports = webpackMerge(buildCommonConfig, {

  target: "node",
  output: {
    path: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs"),
    filename: "casinocoin-libjs-" + pkg.version + ".min.js",
    sourceMapFilename: "casinocoin-libjs-" + pkg.version + ".map",
    // libraryTarget: "umd",
    publicPath: "/"
  },

  plugins: [
    // copy static assets
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, "../README.md"),
          to: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/README.md")
        },
        {
          from: path.resolve(__dirname, "../LICENSE.md"),
          to: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/LICENSE.md")
        },
        {
          from: path.resolve(__dirname, "../CHANGELOG.md"),
          to: path.resolve(__dirname, "../../../../dist/@casinocoin/libjs/CHANGELOG.md")
        }
      ]
    ),

    // new BundleAnalyzerPlugin({
    //   analyzerMode: "server",
    //   analyzerHost: "0.0.0.0",
    //   analyzerPort: 3001,
    //   reportFilename: "bundle-report.html",
    //   defaultSizes: "parsed",
    //   openAnalyzer: false,
    //   generateStatsFile: false,
    //   statsFilename: "bundle-stats.json",
    //   statsOptions: null,
    //   logLevel: "info"
    // })
  ]

});