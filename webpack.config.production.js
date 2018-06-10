const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const devConfig = require('./webpack.config');

module.exports = merge(devConfig, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Title',
      template: path.join(__dirname, 'src', 'index.html')
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'node_modules', 'recorderjs', 'recorderWorker.js'), to: path.join(__dirname, 'dist', 'recorderWorker.js') },
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new UglifyJSPlugin({
      sourceMap: true
    })
  ]
});