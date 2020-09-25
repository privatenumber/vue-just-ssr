# vue-just-ssr <a href="https://npm.im/vue-just-ssr"><img src="https://badgen.net/npm/v/vue-just-ssr"></a> <a href="https://npm.im/vue-just-ssr"><img src="https://badgen.net/npm/dm/vue-just-ssr"></a> <a href="https://packagephobia.now.sh/result?p=vue-just-ssr"><img src="https://packagephobia.now.sh/badge?p=vue-just-ssr"></a>

CLI tool to spin up a Vue SSR dev environment using your own Webpack config!

This tool is designed to add a SSR dev-env to a project with Vue and Webpack already set up, and isn't a rapid prototyping tool like [Vue CLI](https://cli.vuejs.org).

## 🙋‍♂️ Why?
- 🏃‍♂️ **Jump start** Instantly get a Vue dev environment with [SSR](https://ssr.vuejs.org) and [HMR](https://webpack.js.org/concepts/hot-module-replacement/)!
- 🎛 **Full control** Pass in your own Webpack config with Vue setup, we'll do the rest!
- 🔥 **Vue version agnostic** Install your own version of Vue 2 and Webpack 4!

## 🚀 Install
```sh
npm i -D vue-just-ssr vue-server-renderer
```

_Note: Assuming you already have `webpack` and `vue` installed, your `vue-server-renderer` version should match `vue`'s_

## 🚦 Getting started

### CLI
Use it straight from your commandline via [npx](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner).
```sh
npx just-ssr --webpack-config <webpack config file>
```

### npm script
You can use `vue-just-ssr` in your npm `package.json` scripts simply by referencing it as `just-ssr`.

```diff
{
  ...,

   "scripts": {
+    "dev": "just-ssr --webpack-config <webpack config file>"
   },

  ...
}
```

### Webpack config
This module is designed for adding SSR to an existing Vue + Webpack codebase, but if you're starting a new one, make sure you have at least a [bare miniumum Webpack config](https://vue-loader.vuejs.org/guide/#manual-setup) (eg. `webpack.config.js`) setup for a Vue app.

If you're interested in what this looks like, checkout the Webpack config in the [demo](https://github.com/privatenumber/vue-just-ssr-demo/blob/master/webpack.config.js).

## 🎨 Customization

### Template
Flag: `--template, -t`

Default: [`/lib/template.html`](/lib/template.html)

Example: `just-ssr --template ./dev/template.html`

Use this flag to pass in your own template for the entire page's HTML with the `--template` flag. The template should contain a comment `<!--vue-ssr-outlet-->` which serves as the placeholder for rendered app content.

Read the official [Vue docs](https://ssr.vuejs.org/api/#template) for more information.

### App
Flag: `--create-app, -a`

Default: [`/lib/src/create-app.js`](/lib/src/create-app.js)

Example: `just-ssr --create-app ./dev/create-app.js`

Use this flag to pass in a custom `create-app` function to control how your Vue app is instantiated.

The file should have a default export with a function that returns the Vue app.

```js
import Vue from 'vue'

/* Import plugins here */

function createApp(App) {
    const app = new Vue({
      render: h => h(App)
    })

    return { app }
}

export default createApp

```

#### Vue router
If you want to add routing, install Vue Router (`npm i vue-router`) and add it to your custom `create-app` file.

The [Vue SSR guide](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router) recommends splitting up your router file and exporting a `createRouter` function to import into to your `create-app` file.

In your `createApp` function, make sure you return the instantiated router via the `router` property in the `create-app` return object.

**`create-app.js`**

```js
import Vue from 'vue'
import createRouter from './create-router'

function createApp(App) {
    const router = createRouter()

    const app = new Vue({
        render: h => h('router-view'),
        router
    })

    return { app, router }
}

export default createApp
```


**`create-router.js`**

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const createRouter = () => {
    return new Router({
        mode: 'history',
        routes: [
            {
                path: '/',
                component: () => import('./pages/Home.vue')
            }
        ]
    })
}

export default createRouter
```

### Port
Flag: `--port, -p`

Default: `8080`

Example: `just-ssr --port 3333`

Use this flag to set the port for the SSR server to listen on. If not provided, it checks `process.env.PORT` before falling back to 8080. If the port is taken, it will choose a random available port.

## Demo
👉 Check out [vue-just-ssr-demo](https://github.com/privatenumber/vue-just-ssr-demo) for a demo of how easily a Vue SSR + HMR dev environment is added to the repo.

