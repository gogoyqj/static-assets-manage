process.env.NODE_ENV = 'production';
const webpack = require('webpack');
const config = require('./webpack.config');

const compiler = webpack(config);

compiler.run((err) => {
  if (err) {
    console.log(err);
  }
  console.log('build success');
});