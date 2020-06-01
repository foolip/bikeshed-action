const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

async function run() {
  try {
    const version = core.getInput('bikeshed-version');
    const spec = version === 'latest' ? 'bikeshed' : `bikeshed==${version}`;
    console.log(`Installing ${spec}`);
    await exec.exec('pip3', ['--disable-pip-version-check', 'install', spec]);
    const src = core.getInput('src');
    console.log(`Considering ${src}`);
    const globber = await glob.create(src);
    const files = await globber.glob();
    console.log(`Found ${files.length} file(s)`);
    for (const file of files) {
      console.log(`Building ${file}`);
      await exec.exec('bikeshed', ['spec', file]);
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
