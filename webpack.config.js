const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), //generating absolute path
    publicPath: 'dist', // live-server
  },
  devtool: 'inline-source-map', // debugging
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /'node_modules/ }],
  },
  resolve: { extensions: ['.ts', '.js'] },
};
