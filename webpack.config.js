const path = require('path');
const webpack = require('webpack');
const _ = require('lodash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';
const serverConfig = require(`./config${isDev ? '.dev' : ''}`);
const { prefix = '' } = serverConfig;

const extractLESS = new ExtractTextPlugin({
  filename: 'stm-main.css',
  allChunks: true
});

module.exports = {
  devtool: isDev ? 'cheap-module-eval-source-map' : undefined,
  entry: (isDev ? [
    'webpack-hot-middleware/client?reload=true'
  ] : []).concat([
    path.join(__dirname, 'client', 'components', 'style.less'),
    path.join(__dirname, 'client', 'app')
  ]),
  output: {
    path: path.join(__dirname, 'build', prefix, 'static'),
    filename: 'stm-main.js',
    publicPath: `${prefix ? `/${prefix}` : ''}/static/`
  },
  plugins: _.compact([
    new webpack.HotModuleReplacementPlugin(),
    extractLESS,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
    }),
    !isDev && new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    })
  ]),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules|build/,
        loader: 'babel-loader?cacheDirectory=true'
      },
      {
        test: /\.(ttf|eot|svg|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      },
      {
        test: /\.less$/,
        use: extractLESS.extract(['css-loader', 'less-loader'])
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url-loader?limit=8192'
      }
    ]
  }
};
