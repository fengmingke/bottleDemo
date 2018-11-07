const test = require('ava');
const path = require('path');
require(path.join(process.cwd(), 'production.js'));

test('first test', t => {
  think.model('index');
  // const indexModel = think.model('index');
});
