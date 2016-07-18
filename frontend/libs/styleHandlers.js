/*jshint esversion: 6 */
const merge = require('webpack-merge');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const commonConfig = {
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ],
};

const sassLoaders = function(srcPath) {
  return [
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]',
    'postcss-loader',
    'sass-loader?indentedSyntax=sass&includePaths[]=' + srcPath
  ];
};

const inlineConfig = function(srcPath) {
  return {
    module: {
      loaders: [
        {
          test: /\.sass$/,
          loader: 'style!'+sassLoaders(srcPath).join('!')
        }
    ]
    },
  };
};
const extractConfig = function(srcPath ){
  return {
    module: {
      loaders: [
        {
          test: /\.sass$/,
          loader: ExtractTextPlugin.extract('style-loader', sassLoaders(srcPath).join('!'))
        }
      ]
    },
    plugins: [ new ExtractTextPlugin('[name].css') ],
  };
};

module.exports = {
  inlineCSS: function(srcPath) {
    return merge(
      commonConfig,
      inlineConfig(srcPath)
    );
  },
  extractCSS: function(srcPath) {
    return merge(
      commonConfig,
      extractConfig(srcPath)
    );
  },
};
