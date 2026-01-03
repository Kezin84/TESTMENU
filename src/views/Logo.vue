<script setup>
import { ref, onMounted, computed } from 'vue'

/* ================= CONFIG ================= */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'
const IMGBB_KEY = 'b202a4bdc79bf1dc72f6f6ded6b74501'

/* ================= STATE ================= */
const ncc = ref(null)
const logo = ref(null)

const file = ref(null)
const preview = ref('')
const nameInput = ref('')

const showEditModal = ref(false)
const loading = ref(false)
const uploading = ref(false)

/* ================= HELPERS ================= */
function genLogoId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `LG-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

async function uploadImgBB(file) {
  const form = new FormData()
  form.append('image', file)

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
    { method: 'POST', body: form }
  )
  const json = await res.json()
  return json?.data?.url || ''
}

/* ================= LOAD ================= */
async function loadData() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()

    ncc.value = json.data.nha_cung_cap?.[0] || null

    logo.value =
      json.data.logo?.find(
        (l) => l.Ma_nha_cung_cap === ncc.value?.Ma_nha_cung_cap
      ) || null

    if (logo.value) {
      preview.value = logo.value.URL
      nameInput.value = logo.value.Name || ''
    }
  } catch (e) {
    console.error('Lỗi tải dữ liệu:', e)
  }
  loading.value = false
}

/* ================= UI ACTION ================= */
function openAdd() {
  preview.value = ''
  file.value = null
  nameInput.value = ''
  showEditModal.value = true
}

function openEdit() {
  preview.value = logo.value?.URL || ''
  nameInput.value = logo.value?.Name || ''
  file.value = null
  showEditModal.value = true
}

function onFileChange(e) {
  const selectedFile = e.target.files[0]
  if (selectedFile) {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 5MB')
      return
    }
    file.value = selectedFile
    preview.value = URL.createObjectURL(selectedFile)
  }
}

function closeModal() {
  showEditModal.value = false
  preview.value = ''
  file.value = null
  nameInput.value = ''
}

/* ================= SAVE ================= */
async function saveLogo() {
  if (!ncc.value || !nameInput.value.trim()) {
    alert('Vui lòng nhập tên logo')
    return
  }

  if (!file.value && !logo.value?.URL) {
    alert('Vui lòng chọn ảnh logo')
    return
  }

  uploading.value = true

  try {
    let finalUrl = logo.value?.URL || ''

    if (file.value) {
      finalUrl = await uploadImgBB(file.value)
      if (!finalUrl) {
        throw new Error('Upload ảnh thất bại')
      }
    }

    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsertLogo',
        data: {
          ID: genLogoId(),
          URL: finalUrl,
          Name: nameInput.value.trim(),
          Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
          Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
        },
      }),
    })

    closeModal()
    setTimeout(loadData, 1000)
  } catch (e) {
    alert('Lỗi lưu logo: ' + e.message)
  }

  uploading.value = false
}

/* ================= COMPUTED ================= */
const hasLogo = computed(() => !!logo.value)
const canSave = computed(() => nameInput.value.trim() && (file.value || logo.value?.URL))

/* ================= INIT ================= */
onMounted(loadData)
</script>

<template>
  <div class="admin-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
       
        <div>
          <h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;"> QUẢN LÝ LOGO</h1>
     
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card">
      <div class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- ===== EMPTY STATE ===== -->
      <div v-if="!hasLogo" class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-icon"><i class="ri-image-add-line"></i></div>
            <h3 class="empty-title">Chưa có logo</h3>
            <p class="empty-text">Thêm logo để hiển thị thương hiệu của bạn</p>
            
            <div class="upload-box" @click="openAdd">
              <div class="upload-icon"><i class="ri-image-add-line"></i></div>
              <div class="upload-text">
                <strong>Click để tải logo lên</strong>
                <span>hoặc kéo thả file vào đây</span>
              </div>
              <div class="upload-hint">PNG, JPG, SVG (tối đa 5MB)</div>
            </div>

            <button class="btn btn-primary" @click="openAdd">
              
              Thêm Logo
            </button>
          </div>
        </div>
      </div>

      <!-- ===== LOGO VIEW ===== -->
      <div v-else class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="ri-image-line"></i>Thông tin Logo</h3>
          <div class="badge-active">Active</div>
        </div>

        <div class="card-body">
          <div class="logo-display">
            <div class="logo-image-section">
              <div class="logo-image-container">
                <img :src="logo.URL" :alt="logo.Name" class="logo-image" />
                <div class="logo-overlay">
                  <button class="btn-icon-round" @click="openEdit" title="Chỉnh sửa">
                    
                  </button>
                </div>
              </div>
            </div>
            
            <div class="logo-info-section">
              <div class="info-row">
                <div class="info-label">Tên Shop</div>
                <div class="info-value">{{ logo.Name }}</div>
              </div>

              <div class="logo-actions">
                <button class="btn btn-primary" @click="openEdit">
                  
                  Chỉnh sửa logo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title-group">
                
                <h3 class="modal-title">{{ hasLogo ? 'Chỉnh sửa Logo' : 'Thêm Logo mới' }}</h3>
              </div>
              <button @click="closeModal" class="modal-close">
                <span>✖</span>
              </button>
            </div>

            <div class="modal-body">
              <!-- Upload Zone -->
              <div class="form-group">
                <label class="form-label">Ảnh logo *</label>
                <div 
                  class="upload-zone" 
                  :class="{ 'has-image': preview }"
                  @click="$refs.fileInput.click()"
                >
                  <div v-if="preview" class="preview-container">
                    <img :src="preview" alt="Preview" class="preview-image" />
                    <div class="preview-overlay">
                      <span><i class="ri-image-add-line" style="font-size: 15px;font-weight: bold;"></i></span>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder">
                    <div class="placeholder-icon"><i class="ri-image-line"></i></div>
                    <p><strong>Click để chọn ảnh</strong></p>
                    <p class="placeholder-hint">PNG, JPG, SVG (tối đa 5MB)</p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    hidden
                    @change="onFileChange"
                  />
                </div>
              </div>

              <!-- Name Input -->
              <div class="form-group">
                <label class="form-label">Tên Shop *</label>
                <input
                  v-model="nameInput"
                  type="text"
                  class="form-input"
                  placeholder="VD: Logo Header, Logo Footer..."
                  maxlength="100"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal" :disabled="uploading">
                <span class="btn-icon">✖</span>
                Hủy bỏ
              </button>
              <button 
                class="btn btn-success" 
                @click="saveLogo" 
                :disabled="!canSave || uploading"
              >
                <span v-if="uploading" class="btn-loading">
                  <span class="spinner"></span>
                  Đang lưu...
                </span>
                <span v-else>
                  
                  LƯU ẢNH
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* LAYOUT */
.admin-page {
  min-height: 100vh;
  background: rgb(15, 23, 42);
  padding: 24px;
}

/* PAGE HEADER */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #e2e8f0;
}

/* CARD */
.card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.card-body {
  padding: 24px;
}

/* TABLE LOADING */
.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.table-loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.table-loading-text {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #e2e8f0;
  margin-bottom: 32px;
}

.upload-box {
  background: rgba(51, 65, 85, 0.5);
  border: 2px dashed rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 40px 24px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
}

.upload-box:hover {
  background: rgba(51, 65, 85, 0.7);
  border-color: rgba(59, 130, 246, 0.5);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.upload-text strong {
  color: #ffffff;
  font-size: 16px;
}

.upload-text span {
  color: #e2e8f0;
  font-size: 14px;
}

.upload-hint {
  color: #94a3b8;
  font-size: 13px;
}

/* LOGO DISPLAY */
.logo-display {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  align-items: start;
}

.logo-image-section {
  width: 100%;
}

.logo-image-container {
  position: relative;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.logo-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.logo-image-container:hover .logo-overlay {
  opacity: 1;
}

.btn-icon-round {
  background: white;
  border: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon-round:hover {
  transform: scale(1.1);
}

.logo-info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.logo-actions {
  margin-top: 12px;
}

/* BUTTONS */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: green;
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: rgba(51, 65, 85, 0.6);
  color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.8);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 16px;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* FORM */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #ffffff;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-zone {
  border: 2px dashed rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  background: rgba(51, 65, 85, 0.5);
}

.upload-zone:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

.upload-zone.has-image {
  border-style: solid;
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
}

.preview-container {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.preview-image {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
  border-radius: 8px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-weight: 600;
  font-size: 15px;
  border-radius: 12px;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.upload-placeholder {
  padding: 48px 24px;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.upload-placeholder p {
  margin: 0 0 4px 0;
  color: #e2e8f0;
  font-size: 15px;
}

.upload-placeholder strong {
  color: #ffffff;
}

.placeholder-hint {
  color: #94a3b8;
  font-size: 13px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

/* MODAL ANIMATION */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .admin-page {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .card-header {
    padding: 16px;
  }

  .card-body {
    padding: 16px;
  }

  .logo-display {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .logo-image-container {
    min-height: 200px;
    padding: 24px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .card-title {
    font-size: 16px;
  }

  .btn {
    font-size: 13px;
    padding: 10px 20px;
  }
}
</style>