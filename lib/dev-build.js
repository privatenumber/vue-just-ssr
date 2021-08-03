const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { default: getFilenameFromUrl } = require('webpack-dev-middleware/dist/utils/getFilenameFromUrl');
const webpackHotMiddleware = require('webpack-hot-middleware');
const { reactive, computed } = require('@vue/reactivity');
const { createBundleRenderer } = require('vue-server-renderer');
const { createFsFromVolume, Volume } = require('memfs');
const consola = require('consola');
const getETag = require('etag');
const hasOwnProp = require('has-own-prop');

function Deferred() {
	this.isResolved = false;
	this.isRejected = false;
	this.promise = new Promise((resolve, reject) => {
		this.resolve = (result) => {
			this.isResolved = true;
			resolve(result);
		};

		this.reject = (error) => {
			this.isRejected = true;
			reject(error);
		};
	});
}

function createMfs() {
	const mfs = createFsFromVolume(new Volume());
	mfs.join = path.join.bind(path);
	return mfs;
}

function createServerBuild(state, serverConfig) {
	const firstBuild = new Deferred();
	const mfs = createMfs();

	const serverCompiler = webpack(serverConfig);
	serverCompiler.outputFileSystem = mfs;
	serverCompiler.watch({}, (error, stats) => {
		if (error) {
			consola.error(error);
			return;
		}

		stats = stats.toJson();

		if (stats.errors.length > 0) {
			for (const error_ of stats.errors) {
				consola.error(error_);
			}
			return;
		}

		if (stats.warnings.length > 0) {
			for (const error_ of stats.warnings) {
				consola.info(error_);
			}
		}

		const serverBundlePath = path.join(serverConfig.output.path, 'vue-ssr-server-bundle.json');
		state.serverBundle = JSON.parse(mfs.readFileSync(serverBundlePath, 'utf-8'));

		if (!firstBuild.isResolved) {
			firstBuild.resolve();
		}
	});

	return firstBuild.promise;
}

function createClientBuild(state, clientConfig) {
	const firstBuild = new Deferred();
	const clientManifestPath = path.join(clientConfig.output.path, 'vue-ssr-client-manifest.json');

	const clientCompiler = webpack(clientConfig);
	const devMiddleware = webpackDevMiddleware(clientCompiler, {
		publicPath: clientConfig.output.publicPath,
		stats: 'none',
	});

	const etagRegistry = new Map();

	function computeEtags(assets) {
		for (const assetId in assets) {
			if (!hasOwnProp(assets, assetId)) {
				continue;
			}

			const fsPath = assets[assetId].existsAt;
			const etag = getETag(assets[assetId].source());
			etagRegistry.set(fsPath, etag);
		}
	}

	const middlewares = {
		devMiddleware({ url, headers }, response) {
			const filename = getFilenameFromUrl(
				devMiddleware.context.options.publicPath,
				devMiddleware.context.compiler,
				url,
			);

			const ifNoneMatch = headers['if-none-match'];
			if (ifNoneMatch) {
				const assetEtag = etagRegistry.get(filename);
				if (assetEtag && assetEtag === ifNoneMatch) {
					response.statusCode = 304;
					response.end();
					return;
				}
			}

			response.send = (result) => {
				const etag = etagRegistry.get(filename);
				if (etag) {
					response.setHeader('ETag', etag);
				}

				response.setHeader('Cache-Control', 'nocache');
				response.end(result);
			};

			Reflect.apply(devMiddleware, this, arguments);
		},
		hotMiddleware: webpackHotMiddleware(clientCompiler),
	};

	const onDone = (stats) => {
		computeEtags(stats.compilation.assets);

		stats = stats.toJson();

		if (stats.errors.length > 0) {
			for (const error of stats.errors) {
				consola.error(error);
			}
			return;
		}

		if (stats.warnings.length > 0) {
			for (const error of stats.warnings) {
				consola.info(error);
			}
		}

		state.clientManifest = JSON.parse(devMiddleware.fileSystem.readFileSync(clientManifestPath));

		if (!firstBuild.isResolved) {
			firstBuild.resolve(middlewares);
		}
	};

	if (clientCompiler.hooks.done) {
		clientCompiler.hooks.done.tap('just-ssr', onDone);
	} else {
		clientCompiler.plugin('done', onDone);
	}

	return firstBuild.promise;
}

async function devBuild({
	serverConfig,
	clientConfig,
	rendererConfig,
}) {
	const state = reactive({
		serverBundle: undefined,
		clientManifest: undefined,
	});

	const renderer = computed(() => {
		const { serverBundle, clientManifest } = state;
		if (serverBundle && clientManifest) {
			return createBundleRenderer(
				serverBundle,
				{
					...rendererConfig,
					clientManifest,
				},
			);
		}
	});

	const [middlewares] = await Promise.all([
		createClientBuild(state, clientConfig),
		createServerBuild(state, serverConfig),
	]);

	return {
		renderer,
		middlewares,
	};
}

module.exports = devBuild;
