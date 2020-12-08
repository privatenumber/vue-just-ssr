const http = require('http');
const connect = require('connect');
const compression = require('compression');
const opn = require('opn');
const assert = require('assert');
const chalk = require('chalk');
const consola = require('consola');
const terminalLink = require('terminal-link');
const os = require('os');

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
	address,
	port,
	open,
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
				const {code = 500, message = 'Internal Server Error'} = error;
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
		port,
		address,
		err => {
			assert(!err, err);
			const protocol = 'http://';
			const {address, port} = server.address();

			const urls = [
				`${protocol}${address}:${port}`,
			];

			if (address === '0.0.0.0') {
				Object.values(os.networkInterfaces()).forEach(addresses => {
					addresses
						.filter(({family}) => family === 'IPv4')
						.forEach(({address}) => {
							const url = `${protocol}${address}:${port}`;
							if (!urls.includes(url)) {
								urls.push(url);
							}
						});
				});
			}

			consola.info(chalk.green('Listening on: ') + (
				urls.length === 1 ?
					terminalLink(urls[0], urls[0]) :
					'\n' + urls.map(url => '    - ' + terminalLink(url, url)).join('\n')
			));

			if (open) {
				opn(urls[0]);
			}
		},
	);
}

module.exports = initServer;
