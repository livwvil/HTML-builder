const path = require('path');
const fs = require('fs');
const { constants } = require('fs');

const env = {
  htmlEntryPoint: path.resolve(__dirname, './template.html'),
  htmlFolderPath: path.resolve(__dirname, './components'),
  cssFolderPath: path.resolve(__dirname, './styles'),
  assetsFolderPath: path.resolve(__dirname, './assets'),

  htmlDstPath: path.join(__dirname, './project-dist/index.html'),
  cssDstPath: path.resolve(__dirname, './project-dist/style.css'),
  assetsDstFolderPath: path.resolve(__dirname, './project-dist/assets'),
};

async function readFile(file) {
  const fileStream = fs.createReadStream(file);
  return new Promise((resolve) => {
    let result = '';

    fileStream.on('data', async (chunk) => {
      result += chunk;
    });

    fileStream.on('end', async () => {
      fileStream.close();
      resolve(result);
    });
  });
}

async function createFoldersRecursive(filePath) {
  const parentFolder = path.parse(filePath).dir;

  await new Promise((resolve) => {
    fs.access(parentFolder, constants.F_OK, (err) => {
      if (err) {
        fs.mkdir(parentFolder, { recursive: true }, () => resolve());
      } else {
        resolve();
      }
    });
  });
}

async function writeFile(str, filePath, append = false) {
  await createFoldersRecursive(filePath);

  const fileStream = fs.createWriteStream(
    filePath,
    append ? { flags: 'a' } : undefined
  );
  return new Promise((resolve) => {
    fileStream.write(str, () => {
      fileStream.close();
      resolve();
    });
  });
}

function getComponentNames(src) {
  const it = src.matchAll('{{(.*)}}'); // Template strings must be on different lines
  const unique = new Set();
  const result = [];

  for (let match = it.next(); !match.done; match = it.next()) {
    const entry = { pattern: match.value[0], name: match.value[1] };
    const strEntry = JSON.stringify(entry);
    if (!unique.has(strEntry)) {
      unique.add(strEntry);
      result.push(entry);
    }
  }

  return result;
}

async function getHtmlFilePath(filename, baseDir) {
  const file = path.join(baseDir, `${filename}.html`);
  return new Promise((resolve) => {
    fs.access(file, constants.F_OK, (e) => {
      e ? resolve(null) : resolve(file);
    });
  });
}

async function build(env) {
  const template = await readFile(env.htmlEntryPoint);
  const components = getComponentNames(template);
  const componentsWithPath = (
    await Promise.all(
      components.map(async (entry) => {
        return {
          ...entry,
          path: await getHtmlFilePath(entry.name, env.htmlFolderPath),
        };
      })
    )
  ).filter((entry) => entry.path);

  const htmlBundle = await componentsWithPath.reduce(
    async (htmlDocument, component) =>
      (
        await htmlDocument
      ).replaceAll(component.pattern, await readFile(component.path)),
    template
  );

  writeFile(htmlBundle, env.htmlDstPath);
  mergeCssFiles(env.cssFolderPath, env.cssDstPath);
  cloneFolder(env.assetsFolderPath, env.assetsDstFolderPath);
}

build(env);

// stupid copypaste -- __ --

async function appendFile(file, dst) {
  const fileStream = fs.createReadStream(file);
  return new Promise((resolve) => {
    fileStream.on('data', async (chunk) => {
      await writeFile(chunk, dst, true);
    });
    fileStream.on('end', async () => {
      await writeFile('\n', dst, true);
      fileStream.close();
      resolve();
    });
  });
}

async function mergeCssFiles(srcFolder, dstFile) {
  await createFoldersRecursive(dstFile);

  fs.rm(dstFile, () => {
    fs.readdir(srcFolder, { withFileTypes: true }, async (err, data) => {
      const files = data
        .filter(
          (entry) => entry.isFile() && path.parse(entry.name).ext === '.css'
        )
        .map((entry) => path.resolve(srcFolder, entry.name));

      for (const entry of files) {
        await appendFile(entry, dstFile);
      }
    });
  });
}

// more stupid copypaste -- __ --

async function cloneFolder(src, dst) {
  fs.rm(dst, () => {
    fs.readdir(src, { withFileTypes: true }, async (err, data) => {
      for (const entry of data) {
        const srcEntryPath = path.resolve(src, entry.name);
        const dstEntryPath = path.resolve(dst, entry.name);
        if (entry.isDirectory()) {
          cloneFolder(srcEntryPath, dstEntryPath);
        } else {
          await createFoldersRecursive(dstEntryPath);
          fs.copyFile(srcEntryPath, dstEntryPath, () => {err && console.log(err);});
        }
      }
    });
  });
}
