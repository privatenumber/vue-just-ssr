const http = require('http');
const connect = require('connect');
const compression = require('compression');
const opn = require('opn');
const assert = require('assert');
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
		err => {
			assert(!err, err);

			const address = server.address();
			const url = `http://127.0.0.1:${address.port}`;
			const link = terminalLink(url, url);

			consola.info(chalk`Listening on: ${link}`);

			if (open) {
				opn(url);
			}
		},
	);
}

module.exports = initServer;
