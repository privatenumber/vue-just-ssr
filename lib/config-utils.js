const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const _ = require('lodash');

function mergeStrategy(objectValue, sourceValue) {
	if (Array.isArray(objectValue) && Array.isArray(sourceValue)) {
		return objectValue.concat(sourceValue);
	}
}

const clientOnlyPlugins = [];
function clientOnly(plugin) {
	clientOnlyPlugins.push(plugin);
	return plugin;
}

const serverOnlyPlugins = [];
function serverOnly(plugin) {
	serverOnlyPlugins.push(plugin);
	return plugin;
}

function makeServerConfig(webpackConfig) {
	const config = _.mergeWith({}, webpackConfig, {
		name: `${webpackConfig.name || ''}-vue-just-ssr-server`,
		target: 'node',
		devtool: 'source-map',
		output: {
			libraryTarget: 'commonjs2',
		},
		optimization: {
			runtimeChunk: false,
			splitChunks: false,
		},
		externals: nodeExternals({
			allowlist: [
				/^(?:(?!\.js(on)?).)+$/,
			],
		}),
		plugins: [
			{
				apply({ options }) {
					// This needs to be in a plugin because the vue-just-ssr plugin overwrites entry
					const entryServer = path.join(__dirname, './src/entry-server.js');

					// WP5
					if (options.entry.main && options.entry.main.import) {
						options.entry.main.import = [entryServer];
					} else {
						options.entry = entryServer;
					}
				},
			},
			new webpack.DefinePlugin({ 'process.env.VUE_ENV': '"server"' }),
			new VueSSRServerPlugin(),
			new WebpackBar({
				name: 'server',
				color: 'orange',
			}),

		],
	}, mergeStrategy);

	if (clientOnlyPlugins.length > 0) {
		config.plugins = config.plugins.filter(plugin => !clientOnlyPlugins.includes(plugin));
	}

	return config;
}

function makeClientConfig(webpackConfig) {
	const config = _.mergeWith({}, webpackConfig, {
		name: `${webpackConfig.name || ''}-vue-just-ssr-client`,
		stats: false,
		output: {
			publicPath: '/assets/',
		},
		plugins: [
			{
				apply({ options }) {
					// WP5
					if (options.entry.main && options.entry.main.import) {
						options.entry.main.import = [
							'webpack-hot-middleware/client',
							...options.entry.main.import,
						];
					} else {
						options.entry = [
							'webpack-hot-middleware/client',
							options.entry,
						];
					}
				},
			},
			new webpack.HotModuleReplacementPlugin(),
			new VueSSRClientPlugin(),
			new WebpackBar({
				name: 'client',
				color: 'green',
			}),
		],
	}, mergeStrategy);

	if (serverOnlyPlugins.length > 0) {
		config.plugins = config.plugins.filter(plugin => !serverOnlyPlugins.includes(plugin));
	}

	return config;
}

module.exports = {
	makeServerConfig,
	makeClientConfig,
	clientOnly,
	serverOnly,
};
