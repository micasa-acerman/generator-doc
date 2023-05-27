const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // mode: 'development',
  entry: './src/index.js',
  // devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../back/public')
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Development',
    template: path.resolve(__dirname, './src/template.html'), // шаблон
    filename: 'index.html', // название выходного файла
  }),
  // new webpack.HotModuleReplacementPlugin(),
  new CleanWebpackPlugin(),],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
    },
    {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
    },
    ],
  },
  devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        hot: true,
        port: 8080,
    },
};