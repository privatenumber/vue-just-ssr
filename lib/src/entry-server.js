import App from 'just-ssr-app';
import createApp from 'create-app';

function addMountId(app) {
	const {render} = app.$options;
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
	const {app, router} = createApp(App);

	addMountId(app);

	if (!router) {
		resolve(app);
		return;
	}

	router.push(context.url);

	router.onReady(() => {
		const matchedComponents = router.getMatchedComponents();

		if (matchedComponents.length === 0) {
			const err = new Error('Not found');
			err.code = 404;
			reject(err);
			return;
		}

		resolve(app);
	}, reject);
});

export default entryServer;
