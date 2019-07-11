const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /jayson/,
        use: 'null',
      },
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              composite: false,
              declaration: false,
              declarationMap: false
            }
          },
        }]
      }
    ]
  },

  plugins: [ ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        cache: false,
        parallel: true,
        sourceMap: true,
        extractComments: true,
        terserOptions: {
          keep_classnames: true
        }
      })
    ],
  },

};
