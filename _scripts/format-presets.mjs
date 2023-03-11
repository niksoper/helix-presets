#!/usr/bin/env zx

const sortJson = require('sort-json');

// Use the first CLI argument as the strategy
const [strategy, targetPreset] = argv._;
if (!strategy) {
  throw new Error('A strategy must be given');
}

let listPresetFiles;
switch (strategy) {
  case 'staged':
    listPresetFiles =  async () => {
      const stagedRaw = await get($`git diff-index --cached --name-only HEAD -- *.hlx`);
      return stagedRaw.split('\n').filter(file => file.length > 0);
    };
    break;
  case 'all':
    listPresetFiles = () => glob('**/*.hlx');;
    break;
  case 'single':
    listPresetFiles = () => [targetPreset];
    break;
  default:
    throw new Error(`Unexpected strategy: '${strategy}'`);
}


const repositoryRootPath = path.join(__dirname, '../');
const repoPath = (...relative) => path.join(...[repositoryRootPath, ...relative]);

const get = async p => {
  let result = '';
  for await (const chunk of p.quiet().stdout) {
    result += chunk;
  }
  return result.trim();
}

const staged = await listPresetFiles();

// Format them
if (staged.length > 0) {
  console.log(`Formatting ${staged.length} helix presets:`,  staged);
  
  const options = { ignoreCase: true, spaces: 2, depth: 5};
  for (const relPath of staged) {
    const absPath = repoPath(relPath);
    console.log(`Formatting ${absPath}...`);
    sortJson.overwrite(absPath, options);

    if (strategy === 'staged') {
      await $`git add ${relPath}`.quiet();
    }
  }
}
