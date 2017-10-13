var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.config')

module.exports = merge(baseWebpackConfig, {
  devtool: false,
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
})
