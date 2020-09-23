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

const resolveEntry = entryPath => {
	if (!path.isAbsolute(entryPath)) {
		return path.resolve(entryPath);
	}

	return entryPath;
};

function makeServerConfig(webpackConfig) {
	return _.mergeWith({}, webpackConfig, {
		target: 'node',
		devtool: 'source-map',
		resolve: {
			alias: {
				'just-ssr-app': resolveEntry(webpackConfig.entry),
			},
		},
		entry: path.join(__dirname, './src/entry-server.js'),
		externals: nodeExternals({
			allowlist: [
				/\.css$/,
				// /\.vue$/,
				// /\?vue&type=style/,
			],
		}),
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
}

function makeClientConfig(webpackConfig) {
	return _.mergeWith({}, webpackConfig, {
		resolve: {
			alias: {
				'just-ssr-app': resolveEntry(webpackConfig.entry),
			},
		},
		entry: [
			'webpack-hot-middleware/client',
			path.join(__dirname, './src/entry-client.js'),
		],
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new WebpackBar({
				name: 'client',
				color: 'green',
			}),
			new VueSSRClientPlugin(),
		],
	}, mergeStrategy);
}

module.exports = {
	makeServerConfig,
	makeClientConfig,
};
