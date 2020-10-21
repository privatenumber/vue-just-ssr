#!/usr/bin/env node

const minimist = require('minimist');
const assert = require('assert');
const chalk = require('chalk');
const justSSR = require('..');
const {version: pkgVersion} = require('../package.json');
const {cosmiconfig} = require('cosmiconfig');

(async argv => {
	if (argv.help || argv.version) {
		console.log(`
${chalk.underline.bold(`just-ssr ${pkgVersion}`)}

Spin up a Vue SSR dev environment using your Webpack config


⚙️  ${chalk.bold('Options')}
  --help, -h                [boolean] show help
  --version                 [boolean] show version
  --port, -p                [string] server port
  --webpack-config, -c      [string] Webpack base config path
  --template, -t            [string] custom SSR template path
  --create-app, -a          [string] custom create-app path
`);
		return;
	}

	const explorer = cosmiconfig('just-ssr');
	const found = await explorer.search();
	const config = found.config || {};

	const {
		'webpack-config': webpackConfigPath = config.webpackConfigPath,
		template: templatePath = config.templatePath,
		'create-app': createAppPath = config.createAppPath,
		port = config.port,
		open,
	} = argv;

	assert(webpackConfigPath, chalk`{red.bold Error:} Webpack config must be passed into the --webpack-config flag`);

	justSSR({
		port,
		open,
		webpackConfigPath,
		templatePath,
		createAppPath,
		webpackHook: config.webpack,
	});
})(minimist(process.argv.slice(2), {
	alias: {
		'webpack-config': 'c',
		port: 'p',
		template: 't',
		'create-app': 'a',
		help: 'h',
	},
}));

