const images = require('@rollup/plugin-image');
// const css = require('rollup-plugin-css-only');
const css = require('rollup-plugin-postcss');

module.exports = {
    rollup(config, options) {
        config.plugins = [
            images({ include: ['**/*.png', '**/*.jpg'] }),
            // css({
            //     output: 'assets/main.css'
            // }),
            css({
                inject: false,
                modules: true
            }),
            ...config.plugins,
        ]

        return config
    }
}
