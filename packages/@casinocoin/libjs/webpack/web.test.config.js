const path = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const buildCommonConfig = require("./build.common.config");
const pkg = require("../package.json");

module.exports = webpackMerge(buildCommonConfig, {

  entry: [
    path.resolve(__dirname, "../test/rangeset-test.ts"),
    path.resolve(__dirname, "../test/connection-test.ts"),
    path.resolve(__dirname, "../test/api-test.ts"),
    path.resolve(__dirname, "../test/broadcast-api-test.ts"),
    path.resolve(__dirname, "../test/integration/integration-test.ts")
  ],
  externals: [{
    'lodash': '_',
    'casinocoin-api': 'casinocoin',
    'net': 'null'
  }],
  entry: testFileName,
  output: {
      library: match[1].replace(/-/g, '_'),
      path: './test-compiled-for-web/' + (path ? path : ''),
      filename: match[1] + '-test.js'
  }

});