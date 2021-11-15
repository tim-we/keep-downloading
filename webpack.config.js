const path = require("path");

module.exports = {
    entry: {
        background: path.join(__dirname, "ts-src", "background.ts"),
        options: path.join(__dirname, "ts-src", "options.tsx"),
    },
    output: {
        path: path.resolve(__dirname, "ext-files"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    onlyCompileBundledFiles: true,
                },
            },
        ],
    },
    mode: "production",
    optimization: {
        minimize: false,
    },
};
