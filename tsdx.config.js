const images = require('@rollup/plugin-image');
const css = require('rollup-plugin-css-only');

module.exports = {
    rollup(config, options) {
        config.plugins = [
            images({ include: ['**/*.png', '**/*.jpg'] }),
            css({
                output: 'assets/main.css'
            }),
            ...config.plugins,
        ]

        return config
    }
}
