const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/',
  output: {
    filename: 'drawflow.min.js',
    libraryTarget: 'umd',
    library: 'Drawflow',
    umdNamedDefine: true,
	  libraryExport: 'default'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "drawflow.min.css",
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  }
};
