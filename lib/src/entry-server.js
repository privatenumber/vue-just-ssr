import App from '_just-ssr-app';
import createApp from 'create-app';

function addMountId(app) {
	const { render } = app.$options;
	app.$options.render = function () {
		const vnode = Reflect.apply(render, this, arguments);

		if (!vnode.data) {
			vnode.data = {};
		}

		vnode.data.attrs = {
			...vnode.data.attrs,
			id: 'app',
		};
		return vnode;
	};
}

const entryServer = context => new Promise((resolve, reject) => {
	const { app } = createApp(App);

	addMountId(app);

	if (app.$meta) {
		context.meta = app.$meta();
	}

	if (app.$router) {
		app.$router.push(context.url);
		app.$router.onReady(() => {
			const matchedComponents = app.$router.getMatchedComponents();

			if (matchedComponents.length === 0) {
				const error = new Error('Not found');
				error.code = 404;
				reject(error);
				return;
			}

			resolve(app);
		}, reject);
		return;
	}

	resolve(app);
});

export default entryServer;
