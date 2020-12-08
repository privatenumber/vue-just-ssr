#!/usr/bin/env node

const minimist = require('minimist');
const assert = require('assert');
const chalk = require('chalk');
const justSSR = require('..');
const {version: pkgVersion} = require('../package.json');

(({
	'webpack-config': webpackConfigPath,
	template,
	address,
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
  --help, -h                [boolean] Show help
  --version                 [boolean] Show version
  --address, -a             [string] Server address (default: 127.0.0.1)
  --port, -p                [string] Server port (default: 8080 or next available)
  --webpack-config, -c      [string] Webpack base config path
  --template, -t            [string] Custom SSR template path
`);
		return;
	}

	assert(webpackConfigPath, chalk`{red.bold Error:} Webpack config must be passed into the --webpack-config flag`);

	justSSR({
		webpackConfigPath,
		template,
		address,
		port,
		open,
	});
})(minimist(process.argv.slice(2), {
	alias: {
		'webpack-config': 'c',
		address: 'a',
		port: 'p',
		template: 't',
		help: 'h',
	},
}));

