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


## ⚡️ Demos
Check out the demos to see how easily a Vue SSR + HMR dev environment can be setup in your repo.

- [Basic usage demo](https://github.com/privatenumber/vue-just-ssr-demo)
- [Template metadata demo](https://github.com/privatenumber/vue-just-ssr-demo/tree/template-meta)
- [Vue Router demo](https://github.com/privatenumber/vue-just-ssr-demo/tree/vue-router)
- [Vue router + Static site compilation demo](https://github.com/privatenumber/vue-just-ssr-demo/tree/vue-router-html)


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
+         "dev": "just-ssr --webpack-config <webpack config file>"
      },

      ...
  }
```

### Webpack config
This module is designed for adding SSR to an existing Vue + Webpack codebase, but if you're starting a new one, make sure you have at least a [bare miniumum Webpack config](https://vue-loader.vuejs.org/guide/#manual-setup) (eg. `webpack.config.js`) setup for a Vue app.

If you're interested in what this looks like, checkout the Webpack config in the [demo](https://github.com/privatenumber/vue-just-ssr-demo/blob/master/webpack.config.js).

To your Webpack config, add the `JustSsrPlugin` to the `plugins` array:

```diff
+ const { JustSsrPlugin } = require('vue-just-ssr');

  module.exports = {
      ...,

      plugins: [
          ...,
+         new JustSsrPlugin()
      ]
  }
```

## 🎨 Customization

### Server port
Flag: `--port, -p`

Default: `8080`

Example: `just-ssr --port 3333`

Use this flag to set the port for the SSR server to listen on. If not provided, it checks `process.env.PORT` before falling back to 8080. If the port is taken, it will choose a random available port.


### Template
Flag: `--template, -t`

Default: [`/lib/template.html`](/lib/template.html)

Example: `just-ssr --template ./dev/template.html`

Use this flag to pass in your own template for the entire page's HTML with the `--template` flag. The template should contain a comment `<!--vue-ssr-outlet-->` which serves as the placeholder for rendered app content.

Read the official [Vue docs](https://ssr.vuejs.org/api/#template) for more information.

👉 Checkout the [Template metadata demo](https://github.com/privatenumber/vue-just-ssr-demo/tree/template-meta) to see a working example


### Create App

Default: [`/lib/src/create-app.js`](/lib/src/create-app.js)

You can pass in a custom _create-app.js_ file to gain more control over your app. For example, you can use this to set up [routing](#vue-router) or other app-level integrations.

The _create-app.js_ file is introduced in [Vue's SSR guide](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router).
It must default-export a function that returns the Vue app. Any setup code for the app can live here:

**`create-app.js`**

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

Pass in the path to `create-app.js` via the `createAppPath` property in the Webpack plugin: 

```diff
  const { JustSsrPlugin } = require('vue-just-ssr');

  module.exports = {
      ...,

      plugins: [
          ...,
          new JustSsrPlugin({
+             createAppPath: './path-to/create-app.js'
          })
      ]
  }
```


#### Vue router
If you want to add routing, install Vue Router (`npm i vue-router`) and add it to your custom `create-app` file.

The [Vue SSR guide](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router) recommends organizing your router in a separate file (eg. `create-router.js`) that exports a `createRouter` function and importing it into `create-app.js`.

In your App entry-point, simply render `<router-view />`.

**`create-app.js`**

```js
import Vue from 'vue'
import createRouter from './create-router'

function createApp(App) {
    const router = createRouter()

    const app = new Vue({
        render: h => h(App),
        router
    })

    return { app }
}

export default createApp
```


**`create-router.js`**

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

function createRouter() {
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

👉 Checkout the [Vue Router demo](https://github.com/privatenumber/vue-just-ssr-demo/tree/vue-router) to see a working example

### Client/Server Webpack plugins
If you have plugins that you only want running on the client or server-build, you can wrap them in `clientOnly` and `serverOnly` functions.

For example, if you want `ESLintPlugin` to only run on the client-build, you can modify your Webpack config like so:

```diff
  const {
      JustSsrPlugin,
+     clientOnly
  } = require('vue-just-ssr');
  
  module.exports = {
      ...,
  
      plugins: [
          ...,

          new JustSsrPlugin(),

+         clientOnly(
              new ESLintPlugin({
                  files: '**/*.{vue,js}',
                  emitWarning: true
              })
+         )
      ]
  };
```
