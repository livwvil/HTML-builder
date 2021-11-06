
const path = require('path');
const fs = require('fs/promises');
const { constants } = require('fs');

const srcFolderPath = path.resolve(__dirname, './files');
const dstFolderPath = path.resolve(__dirname, './files-copy');

async function cloneFolder(src, dst) {
  await fs.rm(dst, { recursive: true });

  try {
    await fs.access(dst, constants.F_OK);
  } catch {
    await fs.mkdir(dst, { recursive: true });
  }

  const data = await fs.readdir(src, {withFileTypes: true});
  for(const entry of data) {
    const srcEntryPath = path.resolve(src, entry.name);
    const dstEntryPath = path.resolve(dst, entry.name);
    if(entry.isDirectory()) {
      cloneFolder(srcEntryPath, dstEntryPath);
    }
    else {
      fs.copyFile(srcEntryPath, dstEntryPath);
    }
  }
}

cloneFolder(srcFolderPath, dstFolderPath);