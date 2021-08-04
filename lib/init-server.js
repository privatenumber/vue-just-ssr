const http = require('http');
const assert = require('assert');
const os = require('os');
const connect = require('connect');
const compression = require('compression');
const open = require('open');
const chalk = require('chalk');
const consola = require('consola');
const terminalLink = require('terminal-link');

function injectedMeta(key) {
	if (!this.meta) {
		return '';
	}

	if (!this._injectedMeta) {
		this._injectedMeta = this.meta.inject();
	}

	return this._injectedMeta[key] ? this._injectedMeta[key].text() : '';
}

function initServer({
	address: requestAddress,
	port: requestPort,
	open: openServerUrl,
	middlewares,
	renderer,
}) {
	const app = connect()
		.use(compression())
		.use(middlewares.devMiddleware)
		.use(middlewares.hotMiddleware)
		.use(async (request, response) => {
			const context = {
				url: request.url,
				injectedMeta,
			};

			try {
				const html = await renderer.value.renderToString(context);
				response.setHeader('Content-Type', 'text/html');
				response.end(html);
			} catch (error) {
				const { code = 500, message = 'Internal Server Error' } = error;
				response.statusCode = code;
				response.setHeader('Content-Type', 'application/json');
				response.end(JSON.stringify({
					code,
					message,
				}));

				if (!error.code) {
					console.error(error);
				}
			}
		});

	const server = http.createServer(app).listen(
		requestPort,
		requestAddress,
		(error) => {
			assert(!error, error);
			const protocol = 'http://';
			const { address, port } = server.address();

			const urls = [
				`${protocol}${address}:${port}`,
			];

			if (address === '0.0.0.0') {
				for (const addresses of Object.values(os.networkInterfaces())) {
					const ipv4Addresses = addresses.filter(({ family }) => family === 'IPv4');
					for (const { address: interfaceAddress } of ipv4Addresses) {
						const url = `${protocol}${interfaceAddress}:${port}`;
						if (!urls.includes(url)) {
							urls.push(url);
						}
					}
				}
			}

			consola.info(chalk.green('Listening on: ') + (
				urls.length === 1
					? terminalLink(urls[0], urls[0])
					: `\n${urls.map(url => `    - ${terminalLink(url, url)}`).join('\n')}`
			));

			if (openServerUrl) {
				open(urls[0]);
			}
		},
	);
}

module.exports = initServer;
