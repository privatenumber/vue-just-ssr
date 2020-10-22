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

const resolveEntry = entryPath => path.isAbsolute(entryPath) ? entryPath : path.resolve(entryPath);

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

function makeServerConfig(webpackConfig, createAppPath = './create-app') {
	const config = _.mergeWith({}, webpackConfig, {
		target: 'node',
		devtool: 'source-map',
		resolve: {
			alias: {
				'just-ssr-app': resolveEntry(webpackConfig.entry),
				'create-app': createAppPath,
			},
		},
		entry: path.join(__dirname, './src/entry-server.js'),
		externals: nodeExternals({
			allowlist: [
				/\.css$/,
			],
		}),
		optimization: {
			runtimeChunk: false,
		},
		output: {
			libraryTarget: 'commonjs2',
		},
		plugins: [
			new WebpackBar({
				name: 'server',
				color: 'orange',
			}),
			new webpack.DefinePlugin({'process.env.VUE_ENV': '"server"'}),
			new VueSSRServerPlugin(),
		],
	}, mergeStrategy);

	if (clientOnlyPlugins.length > 0) {
		config.plugins = config.plugins.filter(plugin => !clientOnlyPlugins.includes(plugin));
	}

	return config;
}

function makeClientConfig(webpackConfig, createAppPath = './create-app') {
	const config = _.mergeWith({}, webpackConfig, {
		resolve: {
			alias: {
				'just-ssr-app': resolveEntry(webpackConfig.entry),
				'create-app': createAppPath,
			},
		},
		entry: [
			'webpack-hot-middleware/client',
			path.join(__dirname, './src/entry-client.js'),
		],
		output: {
			publicPath: '/assets/',
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new WebpackBar({
				name: 'client',
				color: 'green',
			}),
			new VueSSRClientPlugin(),
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
