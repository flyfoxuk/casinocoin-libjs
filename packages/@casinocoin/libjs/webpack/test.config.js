const path = require("path");
const webpackMerge = require("webpack-merge");
const devCommonConfig = require("./test.common.config");

module.exports = webpackMerge(devCommonConfig, {
    target: "node",
    output: {
        path: path.resolve(__dirname, "../dist/test"),
        filename: "[name].js",
        sourceMapFilename: "[name].map",
        publicPath: "/"
    },
    plugins: []
});
