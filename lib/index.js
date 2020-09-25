const fs = require('fs');
const path = require('path');
const getPort = require('get-port');
const assert = require('assert');
const devBuild = require('./dev-build');
const initServer = require('./init-server');
const {makeServerConfig, makeClientConfig} = require('./config-utils');

async function justSSR({
	webpackConfigPath,
	createAppPath,
	template = path.join(__dirname, 'template.html'),
	port = process.env.PORT || 8080,
	open,
}) {
	const gotPort = await getPort({port});

	const webpackConfig = require(path.resolve(webpackConfigPath));

	assert(typeof webpackConfig.entry === 'string', 'There must only be a single entry-point');

	if (createAppPath) {
		createAppPath = path.resolve(createAppPath);
	}

	const serverConfig = makeServerConfig(webpackConfig, createAppPath);
	const clientConfig = makeClientConfig(webpackConfig, createAppPath);

	const build = await devBuild({
		serverConfig,
		clientConfig,
		rendererConfig: {
			template: fs.readFileSync(template, 'utf-8'),
			runInNewContext: false,
		},
	});

	initServer({
		port: gotPort,
		open,
		...build,
	});
}

module.exports = justSSR;
