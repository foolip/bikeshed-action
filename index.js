const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

async function install(version) {
  const spec = version === 'latest' ? 'bikeshed' : `bikeshed==${version}`;
  console.log(`Installing ${spec}`);
  await exec.exec('pip3', ['--disable-pip-version-check', 'install', spec]);
}

async function findFiles(pattern) {
  const globber = await glob.create(pattern);
  const files = await globber.glob();
  if (!files.length) {
    throw new Error(`No input files matching ${pattern} found`);
  }
  // TODO: filter to touched files if multiple
  return files;
}

async function build(file) {
  console.log(`Building ${file}`);
  await exec.exec('bikeshed', ['spec', file]);
}

async function run() {
  await install(core.getInput('bikeshed-version'));

  const files = await findFiles(core.getInput('src'));
  for (const file of files) {
    await build(file);
  }
}

run().catch(error => core.setFailed(error.message));
