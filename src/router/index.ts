import { createRouter, createWebHistory } from 'vue-router'

import MenuOnline from '@/views/MenuOnline.vue'
import MenuMobile from '@/views/MenuMobile.vue'
import QRBanking from '@/views/QRBanking.vue'

import NhapHang from '@/views/NhapHang.vue'
import KhoHang from '@/views/KhoHang.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Banner from '@/views/Banner.vue'
import Thongbao from '@/views/Thongbao.vue'
import Logo from '@/views/Logo.vue'   // 👈 THÊM DÒNG NÀY
import Khuyenmai from '@/views/Khuyenmai.vue'   // ✅ THÊM
import OpenTime from '@/views/OpenTime.vue' 
import ContactShop from '@/views/ContactShop.vue'   // ✅ THÊM
import Login from '@/views/Login.vue'

const SUPPORTED_LANGS = ['vi', 'en', 'zh-CN', 'fil']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* ======================
       ROOT
    ====================== */
    {
      path: '/',
      redirect: '/vi',
    },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
    /* ======================
       PUBLIC – DESKTOP
    ====================== */
    {
      path: '/:lang',
      name: 'menu-online',
      component: MenuOnline,
      beforeEnter: (to) => {
        if (!SUPPORTED_LANGS.includes(to.params.lang)) {
          return { name: 'menu-online', params: { lang: 'vi' } }
        }
      },
    },

    /* ======================
       PUBLIC – MOBILE
    ====================== */
    {
      path: '/:lang/mobile',
      name: 'menu-mobile',
      component: MenuMobile,
      beforeEnter: (to) => {
        if (!SUPPORTED_LANGS.includes(to.params.lang)) {
          return { name: 'menu-mobile', params: { lang: 'vi' } }
        }
      },
    },

    /* ======================
       CRM (KHÔNG DÍNH LANG)
    ====================== */
  {
  path: '/crm',
  component: AdminLayout,
  meta: { requiresAuth: true }, // ✅ BẮT BUỘC LOGIN
  children: [
    {
      path: '',
      redirect: 'nhap-hang',
    },
    {
      path: 'nhap-hang',
      name: 'nhap-hang',
      component: NhapHang,
    },
    {
      path: 'kho-hang',
      name: 'kho-hang',
      component: KhoHang,
    },
    {
      path: 'banner',
      name: 'admin-banner',
      component: Banner,
    },
    {
      path: 'thong-bao',
      name: 'admin-thong-bao',
      component: Thongbao,
    },
    {
      path: 'logo',
      name: 'admin-logo',
      component: Logo,
    },
    {
      path: 'khuyen-mai',
      name: 'admin-khuyen-mai',
      component: Khuyenmai,
    },
    {
      path: 'open-time',
      name: 'admin-open-time',
      component: OpenTime,
    },
    {
      path: 'contact-shop',
      name: 'admin-contact-shop',
      component: ContactShop,
    },
    {
      path: 'qr-banking',
      name: 'admin-qr-banking',
      component: QRBanking,
    },
  ],
},


    /* ======================
       FALLBACK
    ====================== */
    {
      path: '/:pathMatch(.*)*',
      redirect: '/vi',
    },
  ],
})
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isLoginPage = to.name === 'login'
  const isPublicMenu =
    to.name === 'menu-online' || to.name === 'menu-mobile'

  // ❌ chưa login mà vào CRM
  if (to.meta.requiresAuth && !user) {
    return next({ name: 'login' })
  }

  // ❌ đã login mà quay lại login
  if (user && isLoginPage) {
    return next('/crm')
  }

  // ✅ PUBLIC
  if (isPublicMenu || isLoginPage) {
    return next()
  }

  next()
})


export default router
