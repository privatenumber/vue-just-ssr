const path = require('path');
const resolveEntry = entryPath => path.isAbsolute(entryPath) ? entryPath : path.resolve(entryPath);

class JustSsrPlugin {
	constructor(options) {
		this.options = options;
	}

	apply({options}) {
		if (!options.resolve) {
			options.resolve = {};
		}

		if (!options.resolve.alias) {
			options.resolve.alias = {};
		}

		options.resolve.alias['_just-ssr-app'] = resolveEntry(options.entry);

		if (this.options.createAppPath) {
			options.resolve.alias['create-app'] = resolveEntry(this.options.createAppPath);
		}

		options.entry = path.join(__dirname, './src/entry-client.js');
	}
}

module.exports = JustSsrPlugin;
