const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV,
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "build.js",
    },
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".css"],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],
    devServer: {
        historyApiFallback: true,
    },
};