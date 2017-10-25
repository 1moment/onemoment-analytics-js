var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.config')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
  devtool: 'cheap-module-source-map',
  devServer: {
    historyApiFallback: true,
    compress: true,
    host: '0.0.0.0',
    port: 7000
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      'process.env.SERVER_ADDR': '"http://127.0.0.1:3000"'
    })
  ]
})
