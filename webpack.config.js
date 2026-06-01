// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './examples/basic/index.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'examples/basic/dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './examples/basic/index.html',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'examples/basic/dist'),
    compress: true,
    port: 7001,
    open: true,
  },
};
