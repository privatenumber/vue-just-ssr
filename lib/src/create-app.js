import Vue from 'vue';

function createApp(App) {
	const app = new Vue({
		render: h => h(App),
	});

	return { app };
}

export default createApp;
