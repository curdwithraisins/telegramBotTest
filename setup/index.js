'use strict';

const fs = require('fs');
const path = require('path');

fs.createReadStream(path.join(__dirname, '.sample-env'))
  .pipe(fs.createWriteStream('.env'));