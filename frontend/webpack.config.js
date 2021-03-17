const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },

            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                issuer: /\.css$/,
                use: {
                    loader: 'svg-url-loader',
                    options: { encoding: 'none', limit: 10000 }
                }
            }
        ]
    },
    entry: { index: path.resolve(__dirname, "src", "index.js") },
    output: {
        path: path.resolve(__dirname, "../jupyterhub_configurator/static")
    },
    watch: true
};
