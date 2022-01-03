const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DEST = path.join(ROOT, 'dist');

module.exports = {
  context: SRC,
  entry: {
    build: path.join(SRC, 'index.ts'),
  },
  output: {
    path: DEST,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', 'fx'],
    modules: [
      ROOT,
      path.join('node_modules'),
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  mode: "development",
  devtool: 'cheap-module-source-map',
}
