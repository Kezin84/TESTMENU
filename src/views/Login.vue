<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">
            <img src="/Logo/FBC ONLY LOGO NO TEXT.png" alt="FBC Logo" class="logo-image" />
          </div>
          <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
          <p class="subtitle">Truy cập vào hệ thống quản lý</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>
              <i class="ri-user-line"></i>
              Tên đăng nhập
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Nhập username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label>
              <i class="ri-lock-password-line"></i>
              Mật khẩu
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="Nhập password"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" :disabled="loading" class="login-btn">
            <span v-if="loading" class="spinner"></span>
            <span v-else><i class="ri-login-box-line"></i></span>
            <span>{{ loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP' }}</span>
          </button>

          <div v-if="error" class="error-box">
            <i class="ri-error-warning-line"></i>
            <span>{{ error }}</span>
          </div>
        </form>
      </div>

      <div class="login-footer">
        <p>© 2025 • Powered by <span class="fbc-text">FBC</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'

const handleLogin = async () => {
  loading.value = true
  error.value = ''

 try {
  const formData = new FormData()
  formData.append('action', 'login')
  formData.append('username', username.value.trim())
  formData.append('password', password.value.trim())

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData
  })

  const text = await res.text()
  console.log('RAW RESPONSE:', text)

  const data = JSON.parse(text)
  if (data.code === 'EXPIRED') {
  localStorage.removeItem('user')
  error.value = data.message || 'Gói dịch vụ đã hết hạn'
  loading.value = false
  return
}
  if (!data.success) {
    error.value = data.message || 'Đăng nhập thất bại'
    loading.value = false
    return
  }

  // ✅ LƯU LOGIN
  localStorage.setItem(
    'user',
    JSON.stringify({
      username: data.user.username
    })
  )

  // ✅ CHUYỂN TRANG SAU LOGIN
  router.replace({ name: 'kho-hang' })

} catch (err) {
  console.error(err)
  error.value = 'Không kết nối được server'
}


  loading.value = false
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  animation: pulse 10s ease-in-out infinite reverse;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(34, 197, 94, 0.1);
  animation: cardEntry 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardEntry {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgb(0, 153, 255), rgb(0, 255, 42));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-shadow: 
    0 8px 24px rgba(34, 197, 94, 0.4),
    0 0 0 1px rgba(34, 197, 94, 0.3);
  animation: iconFloat 3s ease-in-out infinite;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group label i {
  font-size: 16px;
  color: rgb(134, 239, 172);
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(51, 65, 85, 0.4);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;
}

.form-group input::placeholder {
  color: #64748b;
}

.form-group input:focus {
  background: rgba(51, 65, 85, 0.6);
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74));
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
  margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgb(22, 163, 74), rgb(21, 128, 61));
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(34, 197, 94, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-btn i {
  font-size: 20px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 14px;
  font-weight: 600;
  animation: errorShake 0.5s ease;
}

.error-box i {
  font-size: 20px;
  flex-shrink: 0;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.login-footer {
  text-align: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.login-footer p {
  margin: 0;
}

.fbc-text {
  font-weight: 700;
  color: rgb(134, 239, 172);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

/* ================= RESPONSIVE ================= */
@media (max-width: 640px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  .logo-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    padding: 14px;
  }

  .login-header h2 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 13px;
  }

  .form-group input {
    padding: 12px 14px;
    font-size: 14px;
  }

  .login-btn {
    padding: 14px;
    font-size: 14px;
  }
}
</style>