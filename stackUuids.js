const uuid = require('uuid');
const fs = require('fs');
const {promisify} = require('es6-promisify');

const stat = promisify(fs.stat);
const appendFile = promisify(fs.appendFile);
const filename = 'ids.txt';

const getStats = filename =>
stat(filename)
  .then(stats => {
    console.log(`Size is ${stats.size}`);
    return stats.size <= 5000000.0;
  })
  .then(shouldWrite => {
    console.log(shouldWrite ? 'writing...' : 'Not writing');
    return shouldWrite && appendFile(filename, `${uuid.v4()} - true\n`, 'utf8');
  });

async function go() {
  let shouldContinue = true;
  while (shouldContinue) {
    shouldContinue = await getStats(filename);
    await go();
  }
}

go();


