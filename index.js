const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');
const path = require('path');
const vnu = require('vnu-jar');

async function install(version) {
  const spec = version === 'latest' ? 'bikeshed' : `bikeshed==${version}`;
  core.startGroup(`Installing ${spec}`);
  await exec.exec('pip3', ['--disable-pip-version-check', 'install', spec]);
  core.endGroup();
}

async function findFiles(pattern) {
  const cwd = process.cwd();
  const globber = await glob.create(pattern);
  const files = await globber.glob();
  if (!files.length) {
    throw new Error(`No input files matching ${pattern} found`);
  }
  // TODO: filter to touched files if multiple
  // return paths relative to the current directory
  return files.map(file => path.relative(cwd, file));
}

async function build(file) {
  core.startGroup(`Building ${file}`);
  const outfile = path.basename(file, '.bs') + '.html';
  await exec.exec('bikeshed', ['spec', file, outfile]);
  core.endGroup();
  return outfile;
}

async function validate(file) {
  core.startGroup(`Validating ${file}`);
  await exec.exec('java', ['-jar', vnu, file]);
  core.endGroup();
}

async function run() {
  await install(core.getInput('bikeshed-version'));

  const files = await findFiles(core.getInput('src'));
  const outfiles = [];
  for (const file of files) {
    outfiles.push(await build(file));
  }

  if (core.getInput('validate')) {
    for (const file of outfiles) {
      validate(file);
    }
  }
}

run().catch(error => core.setFailed(error.message));
