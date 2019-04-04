const path = require("path");
const webpackMerge = require("webpack-merge");

const buildCommonConfig = require("./build.common.config");

module.exports = webpackMerge(buildCommonConfig, {

    entry: path.resolve(__dirname, "../src/index.ts"),
    target: "node",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "index.js",
        library: "casinocoin-libjs",
        libraryTarget: "umd",
        publicPath: "/"
    },
    plugins: [ ]
});
