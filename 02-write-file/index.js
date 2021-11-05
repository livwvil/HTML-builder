const path = require('path');
const fs = require('fs');
const proc = require('process');

const filePath = path.resolve(__dirname, './text.txt');
const fileStream = fs.createWriteStream(filePath);

const buf = [];
var stdin = process.openStdin();

const closeApp = () => {
  fileStream.write(buf.join('\n'), () => {
    fileStream.close();
    stdin.close();
    console.log('I`ll save it. Bye!');
    proc.exit();
  });
};


console.log('Hi! Write something');
stdin.addListener('data', function(d) {
  const input = d.toString().trim();
  if(input === 'exit') {
    closeApp();
  }
  buf.push(input);
});

proc.on('SIGINT', closeApp);
