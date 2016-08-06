/*jshint esversion: 6 */

const path = require('path');
const validate = require('webpack-validator');
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const devServer = require('./libs/devServer');
const styleHandlers = require('./libs/styleHandlers');

const PATHS = {
  src: path.join(__dirname, 'src'),
  public: path.join(__dirname, 'public')
};

process.env.BABEL_ENV = process.env.npm_lifecycle_event;

const commonConfig = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    scripts: PATHS.src
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
      }
    ]
  },
  output: {
    path: PATHS.public,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Ropeconin tanssitietokanta'
    })
  ],
  resolve: {
    root: [PATHS.src],
    extensions: ['', '.js', '.jsx', '.sass']
  }
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
case 'build':
  config = merge(
    commonConfig, 
    styleHandlers.extractCSS(PATHS.src)
  );
  break;
default:
  config = merge(
    commonConfig, 
    devServer({
      //host: process.env.HOST,
      port: 3001
    }),
    styleHandlers.inlineCSS(PATHS.src)
  );
}


module.exports = validate(config);
