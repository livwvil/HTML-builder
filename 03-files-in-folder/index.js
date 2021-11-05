const path = require('path');
const fs = require('fs/promises');

const folderPath = path.resolve(__dirname, './secret-folder');

fs.readdir(folderPath, {withFileTypes: true}).then(async data => {
  const files = data.filter(e => e.isFile());
  for(const entry of files) {
    const filePath = path.resolve(folderPath, entry.name);
    const parsed = path.parse(filePath);

    const fileName = parsed.name;
    const fileExt = parsed.ext.slice(1);
    const stat = await fs.stat(filePath);

    console.log(`${fileName} - ${fileExt} - ${stat.size} bytes`);
  }
});
