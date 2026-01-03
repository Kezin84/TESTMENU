<script setup>
import { ref, onMounted } from 'vue'

/* ================= CONFIG ================= */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'

/* ================= STATE ================= */
const ncc = ref(null)
const openTime = ref(null)
const text = ref('')
const loading = ref(false)
const pageLoading = ref(true)

const showEditModal = ref(false)
const showDeleteModal = ref(false)

/* ================= HELPERS ================= */
function genOpenTimeId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')

  return (
    'T' +
    p(d.getDate()) +
    p(d.getMonth() + 1) +
    d.getFullYear() +
    p(d.getHours()) +
    p(d.getMinutes())
  )
}

/* ================= LOAD ================= */
async function loadData() {
  pageLoading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()

    ncc.value = json.data.nha_cung_cap?.[0] || null

    openTime.value =
      json.data.time?.find(
        t => t.Ma_nha_cung_cap === ncc.value?.Ma_nha_cung_cap
      ) || null

    text.value = openTime.value?.thoi_gian_hoat_dong_shop || ''
  } catch (e) {
    console.error('Load OpenTime lỗi', e)
  } finally {
    pageLoading.value = false
  }
}

/* ================= ACTION ================= */
function openEdit() {
  text.value = openTime.value?.thoi_gian_hoat_dong_shop || ''
  showEditModal.value = true
}

function closeEdit() {
  showEditModal.value = false
  text.value = ''
}

function openDelete() {
  showDeleteModal.value = true
}

function closeDelete() {
  showDeleteModal.value = false
}

async function saveOpenTime() {
  if (!ncc.value || !text.value.trim()) {
    alert('Thiếu dữ liệu')
    return
  }

  loading.value = true

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upsertOpenTime',
      data: {
        ID: genOpenTimeId(),
        Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
        Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
        thoi_gian_hoat_dong_shop: text.value.trim()
      }
    })
  })

  showEditModal.value = false
  setTimeout(loadData, 800)
  loading.value = false
}

async function deleteOpenTime() {
  if (!openTime.value?.ID) return

  loading.value = true

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'deleteTimeShop',
      ID: openTime.value.ID
    })
  })

  showDeleteModal.value = false
  setTimeout(loadData, 800)
  loading.value = false
}

/* ================= INIT ================= */
onMounted(loadData)
</script>

<template>
  <div class="admin-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
      
        <div>
          <h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;">QUẢN LÝ THỜI GIAN</h1>
          <p class="page-subtitle" v-if="ncc">{{ ncc.Ten_nha_cung_cap }}</p>
        </div>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="pageLoading" class="card">
      <div class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- ===== EMPTY STATE ===== -->
      <div v-if="!openTime" class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-icon"><i class="ri-add-circle-fill"></i></div>
            <h3 class="empty-title">Chưa có giờ hoạt động</h3>
            <p class="empty-text">Thêm giờ hoạt động để hiển thị cho khách hàng</p>
            
            <button class="btn btn-primary" @click="openEdit">
              
              Thêm giờ hoạt động
            </button>
          </div>
        </div>
      </div>

      <!-- ===== VIEW STATE ===== -->
      <div v-else class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="ri-time-fill"></i> Thông tin Giờ hoạt động</h3>
          <div class="badge-active">Active</div>
        </div>

        <div class="card-body">
          <div class="time-display">
            <div class="time-content">
              <div class="time-label">Giờ mở cửa</div>
              <div class="time-value">{{ openTime.thoi_gian_hoat_dong_shop }}</div>
            </div>

            <div class="time-actions">
              <button class="btn btn-primary" @click="openEdit">
                
                Chỉnh sửa
              </button>
              <button class="btn btn-danger" @click="openDelete">
                
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ===== EDIT MODAL ===== -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEdit">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-group">
              
              <h3 class="modal-title">{{ openTime ? 'Chỉnh sửa' : 'Thêm' }} Giờ hoạt động</h3>
            </div>
            <button @click="closeEdit" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-field">
              <label class="modal-label">Giờ mở cửa</label>
              <textarea
                v-model="text"
                rows="4"
                class="modal-textarea"
                placeholder="VD: Mở cửa 7:00 – 22:00 | CN nghỉ"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEdit" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="saveOpenTime"
              :disabled="loading || !text.trim()"
              class="btn btn-success"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang lưu...
              </span>
              <span v-else>
               
                Lưu
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ===== DELETE MODAL ===== -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDelete">
        <div class="modal-container modal-danger">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">⚠️</span>
              <h3 class="modal-title">Xác nhận xóa</h3>
            </div>
            <button @click="closeDelete" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <p class="delete-warning">Bạn có chắc muốn xóa giờ hoạt động này?</p>
          </div>

          <div class="modal-footer">
            <button @click="closeDelete" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="deleteOpenTime"
              :disabled="loading"
              class="btn btn-danger"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang xóa...
              </span>
              <span v-else>
                <span class="btn-icon">🗑</span>
                Xóa
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
  padding: 60px 20px;
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
  margin-bottom: 24px;
}

/* TIME DISPLAY */
.time-display {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.time-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.6;
}

.time-actions {
  display: flex;
  gap: 12px;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
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

.modal-container.modal-danger .modal-icon {
  color: #ef4444;
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

.modal-field {
  margin-bottom: 20px;
}

.modal-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.modal-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.modal-textarea::placeholder {
  color: #94a3b8;
}

.modal-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

.delete-warning {
  font-size: 15px;
  color: #e2e8f0;
  line-height: 1.6;
  text-align: center;
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

  .time-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
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