#!/usr/bin/env node

const minimist = require('minimist');
const assert = require('assert');
const chalk = require('chalk');
const justSSR = require('..');
const {version: pkgVersion} = require('../package.json');
const {cosmiconfig} = require('cosmiconfig');

(async ({
	'webpack-config': webpackConfigPath,
	template,
	'create-app': createAppPath,
	port,
	open,
	help,
	version,
}) => {
	if (help || version) {
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
	const config = await explorer.search();

	console.log(config);

	assert(webpackConfigPath, chalk`{red.bold Error:} Webpack config must be passed into the --webpack-config flag`);

	justSSR({
		webpackConfigPath,
		template,
		createAppPath,
		port,
		open,
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

