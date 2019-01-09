// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import axios from 'axios'
import VueAxios from 'vue-axios'
import cookies from 'js-cookie'
import store from './store/store'
import 'iview/dist/styles/iview.css'
import './assets/css/grape_common.css'
import { msgHandler } from './libs/fn.js'
import VueCookies from 'vue-cookies'


Vue.use(iView)
Vue.use(VueAxios, axios)
Vue.use(VueCookies)

Vue.config.productionTip = false

axios.defaults.timeout = 300000

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  if (to.meta.requiresAuth) {
		if(VueCookies.get('loggedIn') === 'true') {
      next();
		}else {
			next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
		}
	} else {
	    next();
	}
});

router.afterEach(route => {
    iView.LoadingBar.finish();
});

/* eslint-disable no-new */
var app = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  render: h => h(App)
})
