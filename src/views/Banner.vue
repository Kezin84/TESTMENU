<script setup>
import { ref, onMounted } from 'vue'

/* ======================
   CONFIG
====================== */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'

const IMGBB_KEY = 'b202a4bdc79bf1dc72f6f6ded6b74501'

/* ======================
   STATE
====================== */
const banners = ref([])
const ncc = ref(null)

const file = ref(null)
const fileInput = ref(null)
const previewUrl = ref('')

const editingBanner = ref(null)
const loading = ref(false)
const tableLoading = ref(true)
const showEditBannerModal = ref(false)
const editBannerFile = ref(null)
const editBannerPreview = ref('')

/* ======================
   HELPERS
====================== */
function genBannerId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    'BN_' +
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    '_' +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
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

function onSelectFile(e) {
  const f = e.target.files[0]
  if (!f) return

  file.value = f
  previewUrl.value = URL.createObjectURL(f)
}

/* ======================
   LOAD DATA
====================== */
async function loadBanners() {
  tableLoading.value = true
  try {
    const res = await fetch(`${API_URL}?action=sheet&sheet=banner`)
    const json = await res.json()
    banners.value = (json.data || []).reverse()
  } finally {
    tableLoading.value = false
  }
}

async function loadNCC() {
  const res = await fetch(`${API_URL}?action=sheet&sheet=nha_cung_cap`)
  const json = await res.json()
  ncc.value = json.data?.[0] || null
}

/* ======================
   ADD
====================== */
async function addBanner() {
  if (!file.value || !previewUrl.value) {
    alert('Chưa chọn ảnh')
    return
  }

  loading.value = true

  const imgUrl = await uploadImgBB(file.value)

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addBanner',
      data: {
        ID: genBannerId(),
        URL: imgUrl,
        Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
        Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
      },
    }),
  })

  resetForm()
  setTimeout(loadBanners, 1200)
}
function onSelectEditFile(e) {
  const f = e.target.files[0]
  if (!f) return

  editBannerFile.value = f
  editBannerPreview.value = URL.createObjectURL(f)
}

/* ======================
   EDIT
====================== */
function startEdit(banner) {
  editingBanner.value = banner
  editBannerFile.value = null
  editBannerPreview.value = banner.URL
  showEditBannerModal.value = true
}


async function saveEdit() {
  if (!editBannerFile.value) {
    alert('Chưa chọn ảnh mới')
    return
  }

  loading.value = true

  const imgUrl = await uploadImgBB(editBannerFile.value)

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateBanner',
      data: {
        ID: editingBanner.value.ID,
        URL: imgUrl,
        Ma_nha_cung_cap: editingBanner.value.Ma_nha_cung_cap,
        Ten_nha_cung_cap: editingBanner.value.Ten_nha_cung_cap,
      },
    }),
  })

  closeEditBannerModal()
  setTimeout(loadBanners, 1200)
}


function cancelEdit() {
  resetForm()
}
function closeEditBannerModal() {
  showEditBannerModal.value = false
  editingBanner.value = null
  editBannerFile.value = null
  editBannerPreview.value = ''
  loading.value = false
}

/* ======================
   DELETE
====================== */
function deleteBanner(id) {
  if (!confirm('Xóa banner này?')) return

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'deleteBanner',
      ID: id,
    }),
  })

  setTimeout(loadBanners, 800)
}

/* ======================
   RESET
====================== */
function resetForm() {
  editingBanner.value = null
  file.value = null
  previewUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
  loading.value = false
}

/* ======================
   INIT
====================== */
onMounted(async () => {
  await loadNCC()
  await loadBanners()
})
</script>

<template>
  <div class="admin-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
       
        <div>
          <h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;">QUẢN LÝ BANNER WEB</h1>
          <p class="page-subtitle">Thêm, chỉnh sửa và quản lý banner hiển thị</p>
        </div>
      </div>
    </div>

    <!-- UPLOAD SECTION -->
    <div class="card upload-card">
      <div class="card-header">
        <h3 class="card-title">Tải lên Banner mới</h3>
      </div>
      <div class="card-body">
        <div class="upload-area">
          <label class="file-upload-label">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="onSelectFile"
              class="file-input-hidden"
            />
            <div class="file-upload-content">
              <div class="upload-icon"><i class="ri-image-add-fill" style="color:white"></i></div>
              <div class="upload-text">
                <span class="upload-primary">Chọn ảnh banner</span>
                <span class="upload-secondary">PNG, JPG, GIF tối đa 10MB</span>
              </div>
            </div>
          </label>

          <div v-if="previewUrl" class="preview-section">
            <div class="preview-label">Xem trước</div>
            <div class="preview-container">
              <img :src="previewUrl" alt="Preview" class="preview-image" />
            </div>
          </div>

          <div class="action-buttons">
            <button
              v-if="!editingBanner"
              @click="addBanner"
              :disabled="loading || !previewUrl"
              class="btn btn-primary"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang tải lên...
              </span>
              <span v-else>
               THÊM BANNER
              </span>
            </button>

            <button
              v-else
              @click="saveEdit"
              :disabled="loading || !previewUrl"
              class="btn btn-success"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang lưu...
              </span>
              <span v-else>
                
                Lưu thay đổi
              </span>
            </button>

            <button v-if="editingBanner" @click="cancelEdit" class="btn btn-cancel">
              <span class="btn-icon">✖</span>
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- BANNER LIST -->
    <div class="card list-card">
      <div class="card-header">
        <h3 class="card-title"><i class="ri-layout-grid-fill"></i> Danh sách Banner</h3>
        <div class="badge">{{ banners.length }} banner</div>
      </div>

      <!-- TABLE LOADING -->
      <div v-if="tableLoading" class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải danh sách banner...</div>
        </div>
      </div>

      <!-- TABLE CONTENT -->
      <div v-else-if="banners.length" class="card-body no-padding">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-index">Vị trí hiển thị</th>
                <th class="th-image">Hình ảnh Banner</th>
                <th class="th-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in banners" :key="b.ID" class="table-row">
                <td class="td-index" data-label="Vị trí hiển thị">
                  <div class="index-badge">#{{ i + 1 }}</div>
                </td>
                <td class="td-image" data-label="Hình ảnh Banner">
                  <div class="image-wrapper">
                    <img :src="b.URL" alt="Banner" class="banner-thumb" />
                  </div>
                </td>
                <td class="td-action" data-label="Thao tác">
                  <div class="action-group">
                    <button @click="startEdit(b)" class="btn-icon-action btn-edit" title="Chỉnh sửa">
                     
                      <span class="text">Sửa</span>
                    </button>
                    <button @click="deleteBanner(b.ID)" class="btn-icon-action btn-delete" title="Xóa">
                     
                      <span class="text">Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else class="card-body">
        <div class="empty-state">
          <div class="empty-icon"><i class="ri-image-add-fill" style="color:white"></i></div>
          <h3 class="empty-title">Chưa có banner nào</h3>
          <p class="empty-text">Bắt đầu bằng cách tải lên banner đầu tiên của bạn</p>
        </div>
      </div>
    </div>
  </div>

  <!-- EDIT MODAL -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showEditBannerModal" class="modal-overlay" @click.self="closeEditBannerModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-group">
              
              <h3 class="modal-title">Chỉnh sửa Banner</h3>
            </div>
            <button @click="closeEditBannerModal" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-preview">
              <div class="modal-preview-label">Xem trước</div>
              <div class="modal-preview-container">
                <img :src="editBannerPreview" alt="Preview" class="modal-preview-image" />
              </div>
            </div>

            <label class="modal-file-upload">
              <input
                type="file"
                accept="image/*"
                @change="onSelectEditFile"
                class="file-input-hidden"
              />
              <div class="modal-upload-content">
                <span class="modal-upload-icon"><i class="ri-image-add-fill" style="color:white"></i></span>
                <span class="modal-upload-text">Chọn ảnh mới</span>
              </div>
            </label>
          </div>

          <div class="modal-footer">
            <button @click="closeEditBannerModal" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="saveEdit"
              :disabled="loading || !editBannerFile"
              class="btn btn-success"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang lưu...
              </span>
              <span v-else>
                
                Lưu thay đổi
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  margin-bottom: 24px;
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

.badge {
  background: rgba(59, 130, 246, 0.2);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.card-body {
  padding: 24px;
}

.card-body.no-padding {
  padding: 0;
}

/* UPLOAD AREA */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.file-upload-label {
  cursor: pointer;
  display: block;
}

.file-input-hidden {
  display: none;
}

.file-upload-content {
  background: rgba(51, 65, 85, 0.5);
  border: 2px dashed rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.file-upload-content:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

.upload-icon {
  font-size: 48px;
  opacity: 0.8;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-primary {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.upload-secondary {
  font-size: 13px;
  color: #e2e8f0;
}

/* PREVIEW */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-container {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* BUTTONS */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
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
  min-width: 180px;
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

.btn-cancel,
.btn-secondary {
  background: rgba(51, 65, 85, 0.6);
  color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-cancel:hover,
.btn-secondary:hover {
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

@keyframes spin {
  to { transform: rotate(360deg); }
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* TABLE */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 2px solid rgba(148, 163, 184, 0.1);
}

.data-table th {
  padding: 14px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  vertical-align: middle;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: rgba(51, 65, 85, 0.3);
}

.th-index { 
  width: 140px;
}
.th-image { 
  width: auto;
}
.th-action { 
  width: 180px;
}

.td-index,
.td-image,
.td-action {
  text-align: center;
}

.index-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 36px;
  background: rgba(59, 130, 246, 0.2);
  color: #ffffff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0 12px;
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.banner-thumb {
  max-width: 500px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: block;
}

.action-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon-action {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-icon-action .icon {
  font-size: 14px;
}

.btn-edit {
  background: rgb(1, 126, 11);
  color: white;
  box-shadow: 0 3px 12px rgba(139, 92, 246, 0.3);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(139, 92, 246, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(239, 68, 68, 0.4);
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #e2e8f0;
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

.modal-preview {
  margin-bottom: 24px;
}

.modal-preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.modal-preview-container {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-file-upload {
  cursor: pointer;
  display: block;
}

.modal-upload-content {
  background: rgba(51, 65, 85, 0.5);
  border: 2px dashed rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.modal-upload-content:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

.modal-upload-icon {
  font-size: 24px;
}

.modal-upload-text {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

  .file-upload-content {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  /* TABLE MOBILE */
  .data-table thead {
    display: none;
  }

  .data-table tbody {
    display: block;
  }

  .table-row {
    display: block;
    margin-bottom: 16px;
    background: rgba(51, 65, 85, 0.3);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .data-table td {
    display: block;
    padding: 12px 0;
    border: none;
  }

  .data-table td::before {
    content: attr(data-label);
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .td-index::before {
    display: none;
  }

  .index-badge {
    margin-bottom: 8px;
  }

  .image-wrapper {
    justify-content: center;
    margin: 12px 0;
  }

  .banner-thumb {
    width: 100%;
    max-width: 100%;
  }

  .action-group {
    flex-direction: column;
    gap: 8px;
  }

  .btn-icon-action {
    width: 100%;
    justify-content: center;
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

  .preview-image,
  .modal-preview-image {
    max-height: 200px;
  }
}
</style>