const path = require('path');

const resolveEntry = entryPath => (
	path.isAbsolute(entryPath)
		? entryPath
		: path.resolve(entryPath)
);

const getEntry = (options) => {
	if (typeof options.entry === 'string') {
		return options.entry;
	}

	if (options.entry.main && options.entry.main.import) {
		if (options.entry.main.import.length > 1) {
			throw new Error('Entry must be single path');
		}
		return options.entry.main.import[0];
	}

	throw new Error('Unsupported Webpack entry format');
};

class JustSsrPlugin {
	constructor(options) {
		this.options = options;
	}

	apply({ options }) {
		if (!options.resolve) {
			options.resolve = {};
		}

		if (!options.resolve.alias) {
			options.resolve.alias = {};
		}

		const entry = resolveEntry(getEntry(options));
		options.resolve.alias['_just-ssr-app'] = entry;

		if (this.options && this.options.createAppPath) {
			options.resolve.alias['create-app'] = resolveEntry(this.options.createAppPath);
		} else {
			options.resolve.alias['create-app'] = path.resolve(__dirname, './src/create-app');
		}

		const clientEntry = path.join(__dirname, './src/entry-client.js');
		if (typeof options.entry === 'string') {
			options.entry = clientEntry;
		} else if (options.entry.main.import) {
			options.entry.main.import = [clientEntry];
		}
	}
}

module.exports = JustSsrPlugin;
