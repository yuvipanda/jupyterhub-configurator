const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/i,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              import: true,
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
                auto: (resourcePath) => !resourcePath.endsWith(".global.css"),
              },
            },
          },
          { loader: "postcss-loader" },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: /\.css$/,
        use: {
          loader: "svg-url-loader",
          options: { encoding: "none", limit: 10000 },
        },
      },
    ],
  },
  entry: { index: path.resolve(__dirname, "src", "index.js") },
  output: {
    path: path.resolve(__dirname, "../jupyterhub_configurator/static"),
    hashFunction: "xxhash64"
  },
  devServer: {
    hot: true,
  },
};
