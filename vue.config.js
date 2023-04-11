/*
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-02-12 16:17:17
 * @LastEditTime: 2023-04-11 23:02:13
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
module.exports = {
    // outputDir: 'dist',   //build输出目录
    // assetsDir: 'assets', //静态资源目录（js, css, img）
    // lintOnSave: false, //是否开启eslint

    //基本路径，从 3.3 弃用，对应dev.assetsPublicPath
    //baseUrl: "/", 
    publicPath: './',
    outputDir: 'dist', //不书写默认 dist ，对应dev.assetsSubDirectory

    devServer: {
        open: true, //是否自动弹出浏览器页面
        // host: "localhost",
        // port: '8080',
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
    },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: "javascript/auto"
                },
            ]
        }
    }

}