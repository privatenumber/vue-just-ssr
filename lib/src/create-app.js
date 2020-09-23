import Vue from 'vue';
import App from 'just-ssr-app';

const createApp = () => new Vue({
	render: h => h('div', {
		attrs: {id: 'app'},
	}, [h(App)]),
});

export default createApp;
