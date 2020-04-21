module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    libraryTarget: 'umd',
    library: 'Drawflow',
    umdNamedDefine: true,
	  libraryExport: 'default'
  }
};
