const path = require("path");
module.exports = {
	// The basic path
	publicPath: './',
    // Whether the production environment generates the sourceMap file
    productionSourceMap: false,
    // Server Port Number
    devServer: {
        port: 13356,
        proxy: {
			'/api': {
				target: 'http://127.0.0.1:14453/api', // The domain name
				ws: true, // Whether to enable WebSockets
				secure: false,
				changOrigin: true, //Enable proxy: A virtual server is created locally, sends the requested data, and receives the requested data at the same time. In this way, the data interaction between the server and the server will not have cross-domain problems
				pathRewrite: {
					"^/api": "/"
				}
			},
			'/user': {
				target: 'http://127.0.0.1:14453/user', // The domain name
				ws: true, // Whether to enable WebSockets
				secure: false,
				changOrigin: true,
				pathRewrite: {
					"^/user": "/"
				}
			},
			'/dataset': {
				target: 'http://127.0.0.1:14453/dataset', // The domain name
				ws: true, // Whether to enable WebSockets
				secure: false,
				changOrigin: true,
				pathRewrite: {
					"^/dataset": "/"
				}
			},
			'/template': {
				target: 'http://127.0.0.1:14453/template', // The domain name
				ws: true, // Whether to enable WebSockets
				secure: false,
				changOrigin: true,
				pathRewrite: {
					"^/template": "/"
				}
			},
            '/results': {
                target: 'http://127.0.0.1:14453/results', // The domain name
                ws: true, // Whether to enable WebSockets
                secure: false,
                changOrigin: true,
                pathRewrite: {
                    "^/results": "/"
                }
            }
		}
    },
  	pluginOptions: {
    	'style-resources-loader': {
      		preProcessor: 'less',
      		patterns: [path.resolve(__dirname, "src/assets/less/global.less")]
   	 	}
	},
	chainWebpack: config => {
        config.module.rules.delete('eslint');
    }
}
