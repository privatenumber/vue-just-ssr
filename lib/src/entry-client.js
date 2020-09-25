import App from 'just-ssr-app';
import createApp from 'create-app';

const { app, router } = createApp(App);

if (router) {
	router.onReady(() => {
		app.$mount('#app');
	});
} else {
	app.$mount('#app');
}
