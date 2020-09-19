import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip'
import copy from 'rollup-plugin-copy'
import sveltePreprocess from 'svelte-preprocess'
import Toolbelt from '@frontierjs/toolbelt/dist/build.cjs'
// import Toolbelt from '@frontierjs/build.js'

console.log({ env: Toolbelt.env.get })
let port2 = Toolbelt.env.get('PORT', 3200)

const production = !process.env.ROLLUP_WATCH
const productionSite = 'frontier.js'
const port = 3000

console.log({ port, port2 })
let apiUrl = production
  ? `https://${productionSite}/api/v1`
  : `http://localhost:${port}/api/v1`
// let authUrl = production ? `https://${productionSite}/api/v1` : `http://localhost:${port}/api/v1`
let authUrl = 'https://auth.knight.works/api/v1'

export default {
  input: 'src/index.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'dist/bundle/build.js',
  },
  plugins: [
    replace({
      __AUTH_URL__: authUrl + '/login',
      __API_URL__: apiUrl,
    }),
    alias({
      entries: [
        { find: '$p', replacement: 'src/pages' },
        { find: '$c', replacement: 'src/components' },
        { find: '$frontier', replacement: '@frontierjs/frontend' },
        { find: '$frontier-c', replacement: '@frontierjs/frontend/components' },
        { find: '$router', replacement: '@sveltech/routify' },
      ],
    }),
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist' },
        { src: 'src/static/*', dest: 'dist' },
        { src: 'src/images', dest: 'dist' },
      ],
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: (css) => {
        css.write('dist/bundle/build.css')
      },
      preprocess: sveltePreprocess({
        scss: {
          includePaths: ['src'],
        },
        postcss: {
          plugins: [require('autoprefixer')],
        },
      }),
    }),
    strip(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      dedupe: (importee) =>
        importee === 'svelte' || importee.startsWith('svelte/'),
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `dist` directory and refresh the
    // browser on changes when not in production
    !production && livereload('dist'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}

function serve() {
  let started = false

  return {
    writeBundle() {
      if (!started) {
        started = true

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}
