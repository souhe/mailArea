var webpack = require("webpack");


module.exports = {
    resolve: {
        modulesDirectories: ['node_modules', 'bower_components'],
    },
    devtool: "inline-source-map",
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};