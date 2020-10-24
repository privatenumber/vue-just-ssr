const fs = require('fs');
const path = require('path');
const getPort = require('get-port');
const assert = require('assert');
const devBuild = require('./dev-build');
const initServer = require('./init-server');
const JustSsrPlugin = require('./just-ssr-plugin');
const {
	makeServerConfig,
	makeClientConfig,
	clientOnly,
	serverOnly,
} = require('./config-utils');

async function justSSR({
	webpackConfigPath,
	template = path.join(__dirname, 'template.html'),
	port = process.env.PORT || 8080,
	open,
}) {
	const gotPort = await getPort({port});

	const webpackConfig = require(path.resolve(webpackConfigPath));

	assert(typeof webpackConfig.entry === 'string', 'There must only be a single entry-point');

	const serverConfig = makeServerConfig(webpackConfig);
	const clientConfig = makeClientConfig(webpackConfig);

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

Object.assign(justSSR, {
	JustSsrPlugin,
	clientOnly,
	serverOnly,
});
