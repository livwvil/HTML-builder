const path = require('path');
const fs = require('fs');

const srcFolderPath = path.resolve(__dirname, './styles');
const dstFilePath = path.resolve(__dirname, './project-dist/bundle.css');

async function appendFile(file, dst) {
  const fileStream = fs.createReadStream(file);
  return new Promise((resolve) => {
    fileStream.on('data', async (chunk) => {
      await writeFile(chunk, dst);
    });
    fileStream.on('end', async () => {
      await writeFile('\n', dst);
      fileStream.close();
      resolve();
    });
  });
}

function writeFile(str, dst) {
  const fileStream = fs.createWriteStream(dst, { flags: 'a' });
  return new Promise((resolve) => {
    fileStream.write(str, () => {
      fileStream.close();
      resolve();
    });
  });
}

function mergeFiles(srcFolder, dstFile) {
  fs.rm(dstFile, () => {
    fs.readdir(srcFolder, { withFileTypes: true }, async (err, data) => {
      const files = data
        .filter((entry) => entry.isFile() && path.parse(entry.name).ext === '.css')
        .map((entry) => path.resolve(srcFolder, entry.name));

      for(const entry of files) {
        await appendFile(entry, dstFile);
      }
    });
  });
}

mergeFiles(srcFolderPath, dstFilePath);
