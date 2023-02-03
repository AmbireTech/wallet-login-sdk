const images = require('@rollup/plugin-image');
const css = require('rollup-plugin-postcss');

module.exports = {
    rollup(config, options) {
        config.plugins = [
            images({ include: ['**/*.png', '**/*.jpg'] }),
            css({
                inject: true,
            }),
            ...config.plugins,
        ]

        return config
    }
}
