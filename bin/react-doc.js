#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const initProject = require('../src/commands/initProject');
const initCache = require('../src/utils/initCache');
const Servers = require('../src/server');
const Build = require('../src/build');
const Publish = require('../src/publish');
const paths = require('../src/conf/path');
const pkg = require('../package.json');

program
  .version(pkg.version, '-v, --version')
  .description('Fast static site generator for React.')
  .option('-i, init [path]', 'Create an empty website or reinitialize an existing one.')
  .option('-d, --doc <path>', 'Other documents generated.')
  .option('-o, --output <path>', 'Writes the compiled file to the disk directory.', '.create-react-doc-dist')
  .option('-p, --port [number]', 'The port.', 3000)
  .option('--host [host]', 'The host.', '0.0.0.0')
  .option('-b, --branch <branch>', 'Name of the branch you are pushing to.', 'gh-pages')
  .option('--publish [url]', 'Other documents generated.')
  .option('--build', 'Creating an optimized production build.')
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ react-doc init');
    console.log('    $ react-doc init doc-example');
    console.log('    $ react-doc -d doc/mm');
    console.log('    $ react-doc -d tutorial,doc');
    console.log('    $ react-doc -d tutorial,doc --build');
    console.log('    $ react-doc -p 2323  -d doc');
    console.log('    $ react-doc -h 0.0.0.0 -d doc');
    console.log('    $ react-doc --publish https://<your-git-repo>.git --branch master');
    console.log();
  })
  .parse(process.argv);
// create-react-doc 工具根目录
// program.crdPath = path.join(__dirname, '../');
// 所有 Markdown 目录
program.markdownPaths = [];
// 编译输出目录
program.output = path.join(process.cwd(), program.output);

// 网站根目录,指定的所有 Markdown 的目录
if (program.doc) {
  // todo: to add Index Page, default Dir Readme, modify these config to config.yml
  fs.existsSync(paths.docsReadme) &&
    program.markdownPaths.push(paths.docsReadme);
  program.doc.split(',').forEach(itemPath => program.markdownPaths.push(path.join(process.cwd(), itemPath)));
}

if (program.build && fs.pathExistsSync(paths.docsBuildDist)) {
  // 清空目录
  fs.emptyDirSync(paths.docsBuildDist);
}
if (program.init) return initProject(program);

// 将生成的代码，push 到指定仓库，和相应分支。
if (program.publish) {
  return Publish(program);
}

// 没有指定，文档目录
if (program.markdownPaths.length === 0) return console.log('Please specify the directory in config.yml.'.red);

let isExists = true;
// 判断指定文件夹是否存
program.markdownPaths.forEach((item) => {
  if (!fs.existsSync(item)) {
    console.log(`Error: Directory ${item.yellow} does not exist`.red);
    isExists = false;
  }
});

if (isExists) {
  // make sure
  fs.ensureDirSync(paths.cacheDirPath);
  initCache(program, () => {
    if (program.build) {
      Build(program);
    } else {
      Servers(program);
    }
  });
}