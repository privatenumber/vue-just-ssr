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

### App

#### Vue router


## Demo
👉 Check out [vue-just-ssr-demo](https://github.com/privatenumber/vue-just-ssr-demo) for a demo of how easily a Vue SSR + HMR dev environment is added to the repo.

## 🏁 Flags

- `--port, -p`

  Port for the dev server to listen on. If not provided, checks `process.env.PORT` before falling back to 8080. If the port is taken, it will choose a random available port.

- `--template, -t`

  Pass in a custom HTML template for the SSR to be injected to. Default is located in [`/lib/template.html`](/lib/template.html).

- `--create-app, -a`

  Pass in a custom `create-app` function. Default is located in [`/lib/src/create-app.js`](/lib/src/create-app.js).
