import { createRouter, createWebHistory } from 'vue-router'
import MenuOnline from '@/views/MenuOnline.vue'
import MenuMobile from '@/views/MenuMobile.vue'

const SUPPORTED_LANGS = ['vi', 'en', 'zh-CN', 'fil']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // redirect root → vi
    {
      path: '/',
      redirect: '/vi',
    },

    // DESKTOP
    {
      path: '/:lang',
      name: 'menu-online',
      component: MenuOnline,
      beforeEnter: (to) => {
        if (!SUPPORTED_LANGS.includes(to.params.lang)) {
          return '/vi'
        }
      },
    },

    // MOBILE
    {
      path: '/:lang/mobile',
      name: 'menu-mobile',
      component: MenuMobile,
      beforeEnter: (to) => {
        if (!SUPPORTED_LANGS.includes(to.params.lang)) {
          return '/vi/mobile'
        }
      },
    },
  ],
})

export default router
