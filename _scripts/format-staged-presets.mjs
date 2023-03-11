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

// Get array of all staged *.hlx files
const stagedRaw = await get($`git diff-index --cached --name-only HEAD -- *.hlx`);
const staged = stagedRaw.split('\n').filter(file => file.length > 0);

// Format them
if (staged.length > 0) {
  console.log(`Formatting ${staged.length} helix presets:`,  staged);
  
  const options = { ignoreCase: true, depth: 5};
  for (const preset of staged) {
    const absPath = repoPath(preset);
    console.log(`Formatting and re-staging ${absPath}...`);
    sortJson.overwrite(absPath, options);
    await $`git add ${preset}`.quiet();
  }
}
