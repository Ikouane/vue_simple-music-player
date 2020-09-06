module.exports = {
    // outputDir: 'dist',   //build输出目录
    // assetsDir: 'assets', //静态资源目录（js, css, img）
    // lintOnSave: false, //是否开启eslint
    devServer: {
        open: true, //是否自动弹出浏览器页面
        host: "localhost",
        port: '8080',
        // https: false,
        // hotOnly: false,
        // proxy: {
        //     '/api': {
        //         target: 'https://music.163.com/api/', //API服务器的地址，原跨域配置
        //         changeOrigin: true,
        //         pathRewrite: {
        //             '^/api': ''
        //         }
        //     }
        // },
    }
}