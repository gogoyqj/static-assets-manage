process.env.NODE_ENV = 'production';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');

const compiler = webpack(config);
const encoding = { encoding: 'utf8' };

compiler.run((err) => {
  if (err) {
    console.log(err);
  }
  const {
    output: {
      path: outputPath
    }
  } = config;
  const html = fs.readFileSync(path.join(__dirname, 'static', 'index.html'), encoding);
  const ver = Date.now();
  fs.writeFileSync(path.join(outputPath, '..', 'index.html'), html
    .replace(/stm-main.js/g, `stm-main.js?ver=${ver}`)
    .replace(/stm-main.css/g, `stm-main.css?ver=${ver}`), encoding);
  console.log('build success');
});