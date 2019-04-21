const path = require("path");

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, "../test/api-test.js"),
    resolve: {
        extensions: [".ts", ".js", ".json"],
        modules: [path.resolve(__dirname, "../node_modules")]
    },
    externals: [
        /node_modules/,
        'bufferutil',
        'utf-8-validate'
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: "/node_modules/"
            }
        ]
    },
    plugins: [],
    optimization: {},
};
