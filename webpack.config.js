const path = require('path');

module.exports = {
  entry: './mediarecorder/demo.js',
  output: {
    path: path.resolve(__dirname, 'mediarecorder'),
    filename: 'demo.bundle.js',
    library: 'Demo'
  }
};
