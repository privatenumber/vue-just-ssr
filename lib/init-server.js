const http = require('http');
const connect = require('connect');
const opn = require('opn');
const assert = require('assert');
const chalk = require('chalk');
const consola = require('consola');
const terminalLink = require('terminal-link');

function initServer({
	port,
	open,
	middlewares,
	renderer,
}) {
	const app = connect()
		.use(middlewares.devMiddleware)
		.use(middlewares.hotMiddleware)
		.use(async (request, response) => {
			const context = {
				url: request.url,
			};

			try {
				const html = await renderer.value.renderToString(context);
				response.end(html);
			} catch(err) {
				const { code = 500, message = 'Internal Server Error' } = err;
				response.statusCode = code;
				response.end(`Error: ${message}`);

				if (!err.code) {
					console.error(err);
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
