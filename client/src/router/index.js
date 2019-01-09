import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Hello from '@/components/Hello'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: '/',
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '*',
      redirect: '/hello'
  },
  {
      path: '/login',
      name: 'Login',
      component: Login
  },
  {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {requiresAuth: true},
      children: [
          {
              path: '/hello',
              name: 'Hello',
              meta: {requiresAuth: true},
              component: Hello
          }
      ]
    }
  ]
})
