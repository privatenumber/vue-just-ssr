const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const _ = require('lodash');

function mergeStrategy(objectValue, srcValue) {
	if (Array.isArray(objectValue) && Array.isArray(srcValue)) {
		return objectValue.concat(srcValue);
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
		target: 'node',
		devtool: 'source-map',
		output: {
			libraryTarget: 'commonjs2',
		},
		optimization: {
			runtimeChunk: false,
		},
		externals: nodeExternals({
			allowlist: [
				/\.css$/,
			],
		}),
		plugins: [
			{
				apply({options}) {
					// This needs to be in a plugin because the vue-just-ssr plugin overwrites entry
					options.entry = path.join(__dirname, './src/entry-server.js');
				},
			},
			new webpack.DefinePlugin({'process.env.VUE_ENV': '"server"'}),
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
		stats: false,
		output: {
			publicPath: '/assets/',
		},
		plugins: [
			{
				apply({options}) {
					options.entry = [
						'webpack-hot-middleware/client',
						options.entry,
					];
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
