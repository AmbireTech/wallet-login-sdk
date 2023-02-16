import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/ambire-login-sdk-browser-bundle.js',
            format: 'iife'
        }
    ],
    plugins: [
        commonjs(),
        typescript(),
        nodeResolve(),
        replace({
            exclude: 'node_modules/**',
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        babel({
            exclude:'node_modules/**',
            babelHelpers: 'bundled'
        }),
        terser(),
    ]
}
