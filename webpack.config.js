const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
     entry: ['babel-polyfill', './src/js/index.js'],
     output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'js/bundle.js'
     },
     devServer: {
         contentBase: './dist'
     },
     plugins: [
         new HtmlWebpackPlugin({
            filename: 'index.html', 
            template: './src/index.html' //source
         })
     ],
     module: {
         rules: [
             {
                 test: /\.js$/,    //look for all files and test if they end with '.JS' 
                 exclude: /node_modules/,
                 use: {
                     loader: 'babel-loader'
                 }
             }
         ]
     }
};