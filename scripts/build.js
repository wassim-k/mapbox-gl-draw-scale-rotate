const pkg = require('../package.json');
const { copy } = require('esbuild-plugin-copy');
const { build } = require('esbuild');
const { dtsPlugin } = require("esbuild-plugin-d.ts");

(async function () {
    await build({
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
                watch: true
            }),
        ]
    });
})();
