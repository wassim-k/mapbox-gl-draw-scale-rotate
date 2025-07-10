const pkg = require('../package.json')
const { copy } = require('esbuild-plugin-copy')
const esbuild = require('esbuild')
const { dtsPlugin } = require('esbuild-plugin-d.ts')

const watch = process.argv.includes('--watch');

(async function () {
  const options = {
    bundle: true,
    target: 'es6',
    sourcemap: true,
    format: 'esm',
    outdir: './dist',
    entryPoints: ['./src/index.ts'],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      dtsPlugin(),
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./src/img/*'],
          to: ['./dist/img'],
        },
        watch: true,
      }),
    ],
  }

  if (watch) {
    const context = await esbuild.context(options)
    await context.watch()
  }
  else {
    esbuild.build(options)
  }
})()
