const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const next = require('next');
const fs = require('fs');
const {promisify} = require('es6-promisify');
const R = require('ramda');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({dev});
const nextHandler = nextApp.getRequestHandler();
const uuid = require('uuid');
const faker = require('faker');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const DATA_FILE = 'db.json';

function getData() {
  return readFile(DATA_FILE, 'utf8').then(JSON.parse);
}

function saveData(data) {
  return writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateData() {
  return getData()
    .then(R.prop('data'))
    .then(R.append({id: uuid.v4(), message: faker.company.bs()}))
    .then(R.assoc('data', R.__, {}))
    .then(saveData)
    .then(data => socket.emit('now', data));
}

function getRandomInt(min, max) {
  return R.clamp(min, max, Math.floor(Math.random() * Math.floor(max)));
}

let port = 3000;

io.on('connect', socket => {
  setInterval(() => {
    getData().then(content => {
      const randomIdx = getRandomInt(0, content.data.length - 1);
      const newData = R.set(R.lensPath(['data', randomIdx, 'message']), faker.company.bs(), content);
      socket.emit(
        'now',
        newData
      );
    });
  }, 2000);
});

nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`>Ready on http://localhost:${port}`);
  });
});
