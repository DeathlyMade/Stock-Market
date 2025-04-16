const path = require('path');

module.exports = {
  entry: './StockMarket/frontend/src/index.js', // Entry file
  output: {
    path: path.resolve(__dirname, 'StockMarket/frontend/static/frontend'), // Output directory
    filename: 'main.js', // Output file name
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'development', // Set mode to development
};