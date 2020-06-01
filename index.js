const core = require('@actions/core');
const fs = require('fs').promises;

async function run() {
  try {
    const src = core.getInput('src');
    console.log(`Building ${src} ...`);

    const body = await fs.readFile(src, 'utf8');
    console.log(body);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
