const fs = require('fs');
const path = require('path');
const assert = require('assert');
const getPort = require('get-port');
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
	address = process.env.HOST || '127.0.0.1',
	port = process.env.PORT || 8080,
	open,
}) {
	const gotPort = getPort({ port });

	// eslint-disable-next-line node/global-require
	const webpackConfig = require(path.resolve(webpackConfigPath));

	assert(typeof webpackConfig.entry === 'string', 'There must only be a single entry-point');
	assert(webpackConfig.plugins && webpackConfig.plugins.find(p => (p instanceof JustSsrPlugin)), 'JustSsrPlugin not found in Webpack config');

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
		address,
		port: await gotPort,
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
