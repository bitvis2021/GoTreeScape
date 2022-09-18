import Vue from 'vue'
import App from './App.vue'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

// the style of vue drag and drop dialog
import 'vue-dialog-drag/dist/vue-dialog-drag.css'

import axios from 'axios'
import VueAxios from 'vue-axios'

// Vue.prototype.$axios = axios
window.baseURL = ""


Vue.use(VueAxios, axios)

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

Vue.config.productionTip = false

// import d3Voronoi from "d3-voronoi"
// console.log('d3.Voronoi', d3.voronoi)

import * as d3 from "d3"
window.d3 = d3

import * as $ from 'jquery'
window.$ = $

window.exports = {}

window.disableUpload = false

import './assets/icon_font/iconfont.css'

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
