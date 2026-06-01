// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const demo = process.env.DEMO || 'e-commerce';

const configs = {
  'basic': {
    entry: './examples/basic/index.jsx',
    template: './examples/basic/index.html',
    dist: path.resolve(__dirname, 'examples/basic/dist'),
  },
  'e-commerce': {
    entry: './examples/e-commerce/src/index.tsx',
    template: './examples/e-commerce/src/index.html',
    dist: path.resolve(__dirname, 'examples/e-commerce/dist'),
  },
};

const cfg = configs[demo] || configs['e-commerce'];

const srcDir = path.resolve(__dirname, 'src');

module.exports = {
  entry: cfg.entry,
  output: {
    filename: 'bundle.js',
    path: cfg.dist,
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      reactscrew: srcDir,
    },
    fallback: {
      fs: false,
      path: false,
    },
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      const mod = resource.request.replace(/^node:/, '');
      resource.request = mod;
    }),
    new HtmlWebpackPlugin({
      template: cfg.template,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  devServer: {
    static: cfg.dist,
    compress: true,
    port: 7001,
    open: true,
  },
};
