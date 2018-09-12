const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        standard: "./src/preact/view/standard.js"
    },
    output: {
        path: path.resolve(__dirname, "dist/public/js/view")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    // TODO: Update babel-presets-env
                    presets: ["env"],
                    plugins: [
                        ["transform-react-jsx", { "pragma": "h" }]
                    ]
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: "source-map"
};
