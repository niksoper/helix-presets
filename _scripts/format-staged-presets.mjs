#!/usr/bin/env zx

const sortJson = require('sort-json');

const repositoryRootPath = path.join(__dirname, '../');
const repoPath = (...relative) => path.join(...[repositoryRootPath, ...relative]);

const get = async p => {
  let result = '';
  for await (const chunk of p.quiet().stdout) {
    result += chunk;
  }
  return result.trim();
}

const listAllPresets = () => glob('**/*.hlx');

/**Gets an array of all staged *.hlx files */
const listStagedPresets = async () => {
  const stagedRaw = await get($`git diff-index --cached --name-only HEAD -- *.hlx`);
  return stagedRaw.split('\n').filter(file => file.length > 0);
}

const staged = await listStagedPresets();

// Format them
if (staged.length > 0) {
  console.log(`Formatting ${staged.length} helix presets:`,  staged);
  
  const options = { ignoreCase: true, depth: 5};
  for (const relPath of staged) {
    const absPath = repoPath(relPath);
    console.log(`Formatting and re-staging ${absPath}...`);
    sortJson.overwrite(absPath, options);
    await $`git add ${relPath}`.quiet();
  }
}
