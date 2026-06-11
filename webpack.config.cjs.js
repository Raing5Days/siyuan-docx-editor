const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "index.js",
        library: { type: "commonjs2" },
    },
    externals: { siyuan: "commonjs siyuan" },
    resolve: {
        extensions: [".js", ".jsx"],
        fallback: { stream: false, path: false },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules(?![\\/]@eigenpal)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            ["@babel/preset-react", { runtime: "automatic" }],
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    target: "web",
    optimization: { minimize: true, splitChunks: false, runtimeChunk: false },
    plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
};
