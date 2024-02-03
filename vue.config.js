const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    publicPath: './',
    transpileDependencies: true,
    lintOnSave:false,
    devServer: {
        client: {
            overlay: false,
        },
    }
})
