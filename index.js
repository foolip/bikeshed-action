const core = require('@actions/core');
const fs = require('fs').promises;
const glob = require('@actions/glob');

async function run() {
  try {
    const src = core.getInput('src');
    console.log(`Considering ${src}`);
    const globber = await glob.create(src);
    const files = await globber.glob();
    console.log(`Found ${files.length} file(s)`);
    for (const file of files) {
      console.log(`${file} contents:`);
      const body = await fs.readFile(file, 'utf8');
      console.log(body);
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
