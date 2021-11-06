const path = require('path');
const fs = require('fs');
const proc = require('process');

const filePath = path.resolve(__dirname, './text.txt');
const fileStream = fs.createWriteStream(filePath);

var stdin = process.openStdin();

const closeApp = () => {
  fileStream.close();
  console.log('Ciao!');
  proc.exit();
};


console.log('Hi! Write something');
stdin.addListener('data', function(d) {
  const input = d.toString().trim();
  if(input === 'exit') {
    closeApp();
  }
  fileStream.write(`${input}\n`, () => {});
});

proc.on('SIGINT', closeApp);