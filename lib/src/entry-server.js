import App from 'just-ssr-app';
import createApp from './create-app';

function addMountId(app) {
	const { render } = app.$options;
	app.$options.render = function() {
		const vnode = render.apply(this, arguments);
		vnode.data.attrs = {
			...vnode.data.attrs,
			id: 'app',
		};
		return vnode;
	};
}

const entryServer = (context) => new Promise((resolve, reject) => {
	const { app, router } = createApp(App);

	addMountId(app);

	if (!router) {
		resolve(app);
		return;
	}

	router.push(context.url);

	router.onReady(() => {
		const matchedComponents = router.getMatchedComponents();

		if (!matchedComponents.length) {
			return reject({ code: 404 });
		}

		resolve(app);
	}, reject);
});

export default entryServer;
