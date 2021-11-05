const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, './text.txt');
const fileStream = fs.createReadStream(filePath);

fileStream.on('data', (chunk) => console.log(chunk.toString()));
fileStream.on('end', () => fileStream.close());