const path = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const buildCommonConfig = require("./build.common.config");

module.exports = webpackMerge(buildCommonConfig, {

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
    // copy static assets
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, "../README.md"),
          to: path.resolve(__dirname, "../../../dist/@casinocoin/libjs/README.md")
        },
        {
          from: path.resolve(__dirname, "../LICENSE"),
          to: path.resolve(__dirname, "../../../dist/@casinocoin/libjs")
        },
        {
          from: path.resolve(__dirname, "../CHANGELOG.md"),
          to: path.resolve(__dirname, "../../../dist/@casinocoin/libjs/CHANGELOG.md")
        },
        {
          from: path.resolve(__dirname, "../package.json"),
          to: path.resolve(__dirname, "../../../dist/@casinocoin/libjs/package.json")
        }
      ]
    ),

    /**
     * uncomment to see what constitutes the production bundle; use http://localhost:3001.
    */
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