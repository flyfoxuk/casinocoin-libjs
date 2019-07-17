const path = require("path");
const Webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const buildCommonConfig = require("./build.common.config");

var pkg = require('../package.json');

module.exports = webpackMerge(buildCommonConfig, {
  mode: "production",
  target: "web",
  entry: path.resolve(__dirname, "../src/index.ts"),
  output: {
    path: path.resolve(__dirname, "../../../dist/@casinocoin/libjs"),
    // generated filename: remove @ and other unwanted chars from project name, split on slash then join with hyphen, append pkg version number and make it a .js file
    // end result: @casinocoin/libjs => casinocoin-libjs-2.0.1.js
    filename: pkg.name.replace(/([^a-z0-9\/]+)/gi, '').split('/').concat([pkg.version]).join('-') + '.js',  
    library: "casinocoin"
  },
  cache: true,
  externals: [{
      'lodash': '_'
  }],
  plugins: [
    // browser replacements
    new Webpack.NormalModuleReplacementPlugin(/^\.\/wswrapper$/, path.resolve(__dirname, '../src/common/wswrapper-native')),
    new Webpack.NormalModuleReplacementPlugin(/^\.\/wallet$/, './wallet-web'),
    new Webpack.NormalModuleReplacementPlugin(/^.*setup-api$/, './setup-api-web'),
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
