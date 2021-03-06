/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const webpack = require('webpack');
const webpackbar = require('webpackbar');
const upath = require('upath');
const { getDocsConfig } = require('../utils');
const paths = require('./path');
const pkg = require('../../package.json');

const define = {
  FOOTER: null,
  DOCSCONFIG: null,
};
if (paths.crdConf && paths.crdConf.footer && typeof paths.crdConf.footer === 'string') {
  define.FOOTER = JSON.stringify(paths.crdConf.footer);
}

/* custom define docs config */
if (paths.docsConfig) {
  define.DOCSCONFIG = JSON.stringify(getDocsConfig());
}

module.exports = {
  entry: {},
  output: {
    path: paths.docsBuildDist,
    publicPath: paths.publicPath,
    filename: 'js/[name].[hash:8].js',
    chunkFilename: 'js/[name].[hash:8].js',
  },
  resolve: {
    alias: {
      'crd-theme': upath.normalizeSafe(paths.docsThemePath),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: [/node_modules/, /\.(cache)/, /crd-theme-(.*)/],
        enforce: 'pre',
        use: [
          // TODO:禁用require.ensure也不是一种标准的语言特征。
          // 我们等待 https://github.com/facebookincubator/create-react-app/issues/2176。
          // { parser: { requireEnsure: false } },
          {
            // 首先运行 linter。
            // 在 Babel 处理 js 之前做这一点很重要。
            options: {
              eslintPath: require.resolve('eslint'),
              configFile: require.resolve('../../.eslintrc.js'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
      },
      {
        // “oneOf”将遍历所有以下加载程序，直到一个符合要求。
        // 当没有加载器匹配时，它将返回到加载程序列表末尾的“file”加载器。
        oneOf: [
          {
            test: /\.(svg|png|bmp|jpg|jpeg|gif)$/,
            loader: require.resolve('url-replace-loader'),
            options: {
              limit: 10000,
              name: 'img/[name].[hash:8].[ext]',
              replace: [
                {
                  test: /crd\.logo\.svg$/,
                  path: paths.logoPath,
                },
              ],
            },
          },
          {
            test: /\.md$/,
            use: [
              {
                loader: require.resolve('raw-content-replace-loader'),
                options: {
                  path: path.join(paths.cacheDirPath, './md'), // 需要替换的目录
                  replace: paths.projectPath, // 替换成目标目录
                  sep: /___/g, // 文件名存储，文件夹+下划线间隔+文件名
                },
              },
            ],
          },
          // “file-loader”确保这些资源由WebpackDevServer服务。
          // 当您导入资源时，您将获得（虚拟）文件名。
          // 在生产中，它们将被复制到`build`文件夹。
          // 此加载程序不使用“test”，因此它将捕获所有模块
          {
            // 排除`js`文件以保持“css”加载器工作，因为它注入它的运行时，否则将通过“文件”加载器处理。
            // 还可以排除“html”和“json”扩展名，以便它们被webpacks内部加载器处理。
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpackbar({ name: pkg.name }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
      ...define,
    }),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
