<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { KeepAlive } from 'vue'

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const router = useRouter()

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const logout = () => {
  localStorage.removeItem('user')
  mobileSidebarOpen.value = false
  router.replace('/login')
}

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'

let expiredTimer = null
let checking = false

const checkExpiredSilently = async () => {
  if (checking) return
  checking = true

  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    checking = false
    return
  }

  if (!user?.username) {
    checking = false
    return
  }

  try {
    const form = new FormData()
    form.append('action', 'checkExpired')
    form.append('username', user.username)

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      console.warn('checkExpired not ok:', res.status)
      return
    }

    const text = await res.text()
    let data = null
    try {
      data = JSON.parse(text)
    } catch {
      console.warn('checkExpired returned non-JSON:', text?.slice(0, 80))
      return
    }

    if (data?.expired === true) {
      localStorage.removeItem('user')
      router.replace('/login')
    }
  } catch (err) {
    console.warn('Expired check failed:', err)
  } finally {
    checking = false
  }
}

onMounted(() => {
  checkExpiredSilently()
  expiredTimer = setInterval(checkExpiredSilently, 120_000)
})

onUnmounted(() => {
  if (expiredTimer) {
    clearInterval(expiredTimer)
    expiredTimer = null
  }
})
</script>

<template>
  <div class="admin-layout" :class="{ collapsed: !sidebarOpen }">
    <!-- DESKTOP SIDEBAR (LEFT) -->
    <aside class="crm-sidebar desktop-only">
      <div class="brand">
        <div class="brand-logo">
          <img src="/Logo/FBC ONLY LOGO NO TEXT.png" alt="FBC Logo" class="logo-img" />
          <span class="brand-text">FBC</span>
        </div>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '◀' : '▶' }}
        </button>
      </div>

      <nav class="menu">
        <RouterLink :to="{ name: 'nhap-hang' }" class="menu-item">
          <i class="ri-folder-add-fill"></i> <span>NHẬP HÀNG LÊN WEB</span>
        </RouterLink>

        <RouterLink :to="{ name: 'kho-hang' }" class="menu-item">
          <i class="ri-store-2-fill"></i> <span>KHO HÀNG</span>
        </RouterLink>

        <div class="menu-divider"></div>
        <div class="menu-section-title">
          <span>THÔNG TIN HIỂN THỊ WEB</span>
        </div>

        <RouterLink to="/crm/banner" class="menu-item">
          <i class="ri-tv-2-fill"></i><span>BANNER</span>
        </RouterLink>

        <RouterLink to="/crm/thong-bao" class="menu-item">
          <i class="ri-alert-fill"></i> <span>THÔNG BÁO</span>
        </RouterLink>

        <RouterLink to="/crm/logo" class="menu-item">
          <i class="ri-image-line"></i> <span>LOGO</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-khuyen-mai' }" class="menu-item">
          <i class="ri-coupon-line"></i> <span>KHUYẾN MÃI</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-open-time' }" class="menu-item">
          <i class="ri-24-hours-line"></i> <span>GIỜ HOẠT ĐỘNG</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-contact-shop' }" class="menu-item">
          <i class="ri-contacts-book-2-fill"></i> <span>THÔNG TIN LIÊN HỆ SHOP</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-qr-banking' }" class="menu-item">
          <i class="ri-bank-card-fill"></i> <span>NGÂN HÀNG & TỈ GIÁ</span>
        </RouterLink>
        <div class="menu-divider"></div>

        <button class="menu-item logout-btn" @click="logout">
          <i class="ri-logout-box-r-fill" ></i><span style="color: red;font-weight: bold;">ĐĂNG XUẤT</span>
        </button>
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="crm-main">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <!-- MOBILE BOTTOM BAR -->
    <nav class="mobile-bottom-bar">
      <RouterLink :to="{ name: 'nhap-hang' }" class="bottom-bar-item">
        <i class="ri-folder-add-fill"></i>
        <span class="label">Nhập hàng</span>
      </RouterLink>

      <RouterLink :to="{ name: 'kho-hang' }" class="bottom-bar-item">
        <i class="ri-store-2-fill"></i>
        <span class="label">Kho hàng</span>
      </RouterLink>

      <button class="bottom-bar-item" @click="mobileSidebarOpen = true">
        <i class="ri-settings-4-fill"></i>
        <span class="label">Thông tin web</span>
      </button>
    </nav>

    <!-- MOBILE SIDEBAR (RIGHT) - OVERLAY -->
    <div
      class="mobile-sidebar-overlay"
      :class="{ open: mobileSidebarOpen }"
      @click="closeMobileSidebar"
    ></div>

    <!-- MOBILE SIDEBAR (RIGHT) -->
    <aside class="mobile-sidebar" :class="{ open: mobileSidebarOpen }">
      <div class="mobile-sidebar-header">
        <div class="mobile-header-brand">
          <img src="/Logo/FBC ONLY LOGO NO TEXT.png" alt="FBC Logo" class="mobile-logo-img" />
          <h3>FBC-QUẢN LÝ</h3>
        </div>
        <button class="close-btn" @click="closeMobileSidebar">✕</button>
      </div>

      <nav class="mobile-sidebar-menu">
        <RouterLink to="/crm/banner" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-tv-2-fill"></i> <span>Banner</span>
        </RouterLink>

        <RouterLink to="/crm/thong-bao" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-alert-fill"></i> <span>Thông báo</span>
        </RouterLink>

        <RouterLink to="/crm/logo" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-image-line"></i> <span>Logo</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-khuyen-mai' }"
          class="mobile-menu-item"
          @click="closeMobileSidebar"
        >
          <i class="ri-coupon-line"></i> <span>Khuyến mãi</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-open-time' }"
          class="mobile-menu-item"
          @click="closeMobileSidebar"
        >
          <i class="ri-24-hours-line"></i> <span>Giờ hoạt động</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-contact-shop' }"
          class="mobile-menu-item"
          @click="closeMobileSidebar"
        >
          <i class="ri-contacts-book-2-fill"></i> <span>Contact shop</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-qr-banking' }"
          class="mobile-menu-item"
          @click="closeMobileSidebar"
        >
          <i class="ri-bank-card-fill"></i> <span>QR Banking</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <button class="mobile-menu-item logout-btn" @click="logout">
          <i class="ri-logout-box-r-fill"></i><span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  position: relative;
}

/* ================= DESKTOP SIDEBAR (LEFT) ================= */
.crm-sidebar {
  width: 280px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
  color: #e5e7eb;
  padding: 0;
  transform: translateX(0);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
  z-index: 100;
  overflow: hidden; /* ✅ ẨN scroll của sidebar */
  border-right: 2px solid rgba(34, 197, 94, 0.2);
  box-shadow: 4px 0 20px rgba(34, 197, 94, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh; /* ✅ Full height */
}

.crm-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(34, 197, 94, 0.05) 0%,
    transparent 20%,
    transparent 80%,
    rgba(34, 197, 94, 0.05) 100%);
  pointer-events: none;
  z-index: 0;
}

.admin-layout.collapsed .crm-sidebar {
  width: 80px;
}

.brand {
  position: relative; /* ✅ Không sticky nữa */
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  flex-shrink: 0; /* ✅ Không co lại */
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))
          drop-shadow(0 0 24px rgba(34, 197, 94, 0.4))
          drop-shadow(0 0 36px rgba(34, 197, 94, 0.2));
  animation: logoGlow 3s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 24px rgba(34, 197, 94, 0.4))
            drop-shadow(0 0 36px rgba(34, 197, 94, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.8))
            drop-shadow(0 0 32px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 48px rgba(34, 197, 94, 0.3));
  }
}

.brand-text {
  font-weight: 700;
  font-size: 18px;
  color: rgb(134, 239, 172);
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.toggle-btn {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: rgb(134, 239, 172);
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
  transform: scale(1.1);
}

.admin-layout.collapsed .brand-text {
  display: none;
}

.admin-layout.collapsed .brand-logo {
  justify-content: center;
}

.menu {
  flex: 1; /* ✅ Chiếm hết không gian còn lại */
  overflow-y: auto; /* ✅ CHỈ menu scroll */
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  min-height: 0; /* ✅ Quan trọng để flex hoạt động */
}

/* ✅ Custom scrollbar cho menu */
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.3);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.5);
}

.menu-divider {
  height: 2px;
  background: linear-gradient(to right, 
    transparent, 
    rgba(34, 197, 94, 0.3), 
    transparent);
  margin: 12px 0;
  border-radius: 2px;
}

.menu-section-title {
  padding: 8px 12px;
  font-size: 11px;
  text-transform: uppercase;
  color: rgb(134, 239, 172);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.05);
  border-radius: 6px;
  border-left: 3px solid rgb(34, 197, 94);
}

.menu-item,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: #e5e7eb;
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-weight: 700;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgb(34, 197, 94);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item i {
  font-size: 20px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.menu-item:hover,
.logout-btn:hover {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: rgb(134, 239, 172);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.menu-item:hover i,
.logout-btn:hover i {
  transform: scale(1.1);
}

.menu-item.router-link-active {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.2), 
    rgba(34, 197, 94, 0.15));
  border: 1px solid rgb(34, 197, 94);
  color: #fff;
  box-shadow: 
    0 4px 12px rgba(34, 197, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.menu-item.router-link-active::before {
  transform: scaleY(1);
}

.logout-btn:hover span {
  color: #fca5a5 !important;
}

.admin-layout.collapsed .menu-item span,
.admin-layout.collapsed .menu-section-title {
  display: none;
}

.admin-layout.collapsed .menu-item {
  justify-content: center;
}

.admin-layout.collapsed .menu-item i {
  font-size: 22px;
}

.admin-layout.collapsed .menu-divider {
  margin: 8px 0;
}

/* ================= MAIN CONTENT ================= */
.crm-main {
  flex: 1;
  padding: 0;
  overflow: auto;
  background: #f8fafc;
  color: #0f172a;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ================= MOBILE ELEMENTS (HIDDEN ON DESKTOP) ================= */
.mobile-bottom-bar,
.mobile-sidebar,
.mobile-sidebar-overlay {
  display: none;
}

/* ================================================= */
/* ================= MOBILE MODE =================== */
/* ================================================= */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .admin-layout {
    flex-direction: column;
  }

  .crm-main {
    padding: 0;
    padding-bottom: 70px;
    height: calc(100vh - 70px);
    overflow-y: auto;
  }

  /* ================= MOBILE BOTTOM BAR ================= */
  .mobile-bottom-bar {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    border-top: 2px solid rgba(34, 197, 94, 0.3);
    z-index: 1000;
    padding: 0;
    box-shadow: 0 -4px 20px rgba(34, 197, 94, 0.15);
  }

  .bottom-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    padding: 10px 8px;
    color: #ffffff;
    text-decoration: none;
    border-radius: 0;
    transition: all 0.3s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    position: relative;
  }

  .bottom-bar-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(to right, 
      transparent, 
      rgb(34, 197, 94), 
      transparent);
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
  }

  .bottom-bar-item.router-link-active::before {
    width: 80%;
  }

  .bottom-bar-item i {
    font-size: 28px;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .bottom-bar-item .label {
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    color: #ffffff;
    line-height: 1.2;
    white-space: nowrap;
  }

  .bottom-bar-item:active {
    background: rgba(34, 197, 94, 0.15);
  }

  .bottom-bar-item.router-link-active {
    background: rgba(34, 197, 94, 0.1);
  }

  .bottom-bar-item.router-link-active i {
    color: rgb(134, 239, 172);
    transform: scale(1.2);
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
  }

  .bottom-bar-item.router-link-active .label {
    color: rgb(134, 239, 172);
    text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  }

  /* ================= MOBILE SIDEBAR OVERLAY ================= */
  .mobile-sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 1100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(4px);
  }

  .mobile-sidebar-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  /* ================= MOBILE SIDEBAR (RIGHT) ================= */
  .mobile-sidebar {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    max-width: 85vw;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    color: #e5e7eb;
    z-index: 1200;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    overflow-y: auto;
    box-shadow: -4px 0 20px rgba(34, 197, 94, 0.2);
    border-left: 2px solid rgba(34, 197, 94, 0.3);
  }

  .mobile-sidebar.open {
    transform: translateX(0);
  }

  .mobile-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px;
    border-bottom: 2px solid rgba(34, 197, 94, 0.3);
    position: sticky;
    top: 0;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(10px);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .mobile-header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-logo-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    flex-shrink: 0;
    filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))
            drop-shadow(0 0 30px rgba(34, 197, 94, 0.2));
    animation: logoGlowMobile 3s ease-in-out infinite;
  }

  @keyframes logoGlowMobile {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))
              drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))
              drop-shadow(0 0 30px rgba(34, 197, 94, 0.2));
    }
    50% {
      filter: drop-shadow(0 0 14px rgba(34, 197, 94, 0.8))
              drop-shadow(0 0 28px rgba(34, 197, 94, 0.6))
              drop-shadow(0 0 42px rgba(34, 197, 94, 0.3));
    }
  }

  .mobile-sidebar-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: rgb(134, 239, 172);
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  }

  .close-btn {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: rgb(134, 239, 172);
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  .close-btn:active {
    background: rgba(34, 197, 94, 0.2);
    transform: scale(0.95);
  }

  .mobile-sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    color: #e5e7eb;
    text-decoration: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.3s ease;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }

  .mobile-menu-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgb(34, 197, 94);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  .mobile-menu-item:active::before {
    transform: scaleY(1);
  }

  .mobile-menu-item i {
    font-size: 20px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .mobile-menu-item:active {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: rgb(134, 239, 172);
    transform: translateX(4px);
  }

  .mobile-menu-item:active i {
    transform: scale(1.1);
  }

  .mobile-menu-item.router-link-active {
    background: linear-gradient(135deg, 
      rgba(34, 197, 94, 0.2), 
      rgba(34, 197, 94, 0.15));
    border: 1px solid rgb(34, 197, 94);
    color: #fff;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .mobile-menu-item.router-link-active::before {
    transform: scaleY(1);
  }
}
</style>