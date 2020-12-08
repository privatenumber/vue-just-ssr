import App from '_just-ssr-app';
import createApp from 'create-app';

const {app} = createApp(App);

if (app.$router) {
	app.$router.onReady(() => {
		app.$mount('#app');
	});
} else {
	app.$mount('#app');
}
