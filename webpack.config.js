const path = require('path');

const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = env => {
    const isDevelopment = env.mode === "development";

    const makeTarget = (target) => ({
        entry: "./src/index.ts",
        devtool: 'source-map',
        output: {
            filename: "polygloat-react." + target + ".js",
            path: path.resolve(__dirname, 'dist'),
            library: 'polygloat-react',
            libraryTarget: target
        },
        resolve: {
            extensions: [".webpack.js", ".web.js", ".ts", ".js", ".tsx"],
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    enforce: 'pre',
                    use: ['source-map-loader']
                },
                {
                    test: /\.tsx?$/,
                    use: [isDevelopment && "ts-loader" || "babel-loader"],
                    exclude: [/node_modules/, /lib/],
                },
            ]
        },
        mode: isDevelopment ? "development" : "production",
        plugins: [
            //new WebpackBundleAnalyzer()
        ],
        externals: {
            react: "react",
            "react-dom": "react-dom",
            "polygloat/ui": "polygloat/ui"
        }
    });

    return [makeTarget("umd"), makeTarget("window")];
};
