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

const isDev = process.env.WEBPACK_SERVE === 'true';

const backendProducts = isDev ? '/api/proxy/fakestoreapi' : 'https://fakestoreapi.com';
const backendUsers = isDev ? '/api/proxy/jsonplaceholder' : 'https://jsonplaceholder.typicode.com';

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
    new webpack.DefinePlugin({
      __BACKEND_PRODUCTS__: JSON.stringify(backendProducts),
      __BACKEND_USERS__: JSON.stringify(backendUsers),
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
    proxy: [
      {
        context: ['/api/proxy/fakestoreapi'],
        target: 'https://fakestoreapi.com',
        pathRewrite: { '^/api/proxy/fakestoreapi': '' },
        changeOrigin: true,
      },
      {
        context: ['/api/proxy/jsonplaceholder'],
        target: 'https://jsonplaceholder.typicode.com',
        pathRewrite: { '^/api/proxy/jsonplaceholder': '' },
        changeOrigin: true,
      },
    ],
  },
};
