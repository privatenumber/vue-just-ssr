import App from 'just-ssr-app';
import createApp from './create-app';

const entryServer = (context) => new Promise((resolve, reject) => {
	const { app, router } = createApp(App);

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
