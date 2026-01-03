<script setup>
import { ref, onMounted } from 'vue'

/* ================= CONFIG ================= */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'

/* ================= STATE ================= */
const list = ref([])
const ncc = ref(null)
const content = ref('')
const loading = ref(false)
const tableLoading = ref(true)

/* modal edit */
const showEditModal = ref(false)
const editingItem = ref(null)
const editContent = ref('')

/* ================= HELPERS ================= */
function genId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    'KM_' +
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    '_' +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
}

/* ================= LOAD ================= */
async function loadData() {
  tableLoading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()

    ncc.value = json.data.nha_cung_cap?.[0] || null

    list.value =
      (json.data.khuyenmai_info || []).filter(
        (k) =>
          k.Ma_nha_cung_cap === ncc.value?.Ma_nha_cung_cap
      ).reverse()
  } finally {
    tableLoading.value = false
  }
}

/* ================= ADD ================= */
async function addKhuyenMai() {
  if (!content.value.trim()) {
    alert('Vui lòng nhập nội dung khuyến mãi')
    return
  }
  if (!ncc.value) return

  loading.value = true

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addKhuyenMai',
      data: {
        ID: genId(),
        Noi_dung: content.value.trim(),
        Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
        Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
      },
    }),
  })

  content.value = ''
  setTimeout(loadData, 800)
  loading.value = false
}

/* ================= EDIT ================= */
function openEdit(item) {
  editingItem.value = item
  editContent.value = item.Noi_dung
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingItem.value = null
  editContent.value = ''
}

function saveEdit() {
  if (!editingItem.value || !editContent.value.trim()) {
    alert('Nội dung trống')
    return
  }

  loading.value = true

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateKhuyenMai',
      data: {
        ID: editingItem.value.ID,
        Noi_dung: editContent.value.trim(),
        Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
        Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
      },
    }),
  })

  closeEditModal()
  setTimeout(loadData, 800)
}

/* ================= DELETE ================= */
function deleteItem(id) {
  if (!confirm('Xóa khuyến mãi này?')) return

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'deleteKhuyenMai',
      ID: id,
    }),
  })

  setTimeout(loadData, 600)
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
          <h1 class="page-title" style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5)">THÔNG TIN KHUYẾN MÃI </h1>
          <p class="page-subtitle">Thêm, chỉnh sửa và quản lý thông tin khuyến mãi</p>
        </div>
      </div>
    </div>

    <!-- ADD SECTION -->
    <div class="card add-card">
      <div class="card-header">
        <h3 class="card-title">Thêm Khuyến mãi mới <i class="ri-add-circle-fill"></i></h3>
      </div>
      <div class="card-body">
        <div class="add-area">
          <input
            v-model="content"
            placeholder="Nhập nội dung khuyến mãi..."
            class="input-field"
            @keypress.enter="addKhuyenMai"
          />
          <button
            @click="addKhuyenMai"
            :disabled="loading || !content.trim()"
            class="btn btn-primary"
          >
            <span v-if="loading" class="btn-loading">
              <span class="spinner"></span>
              Đang thêm...
            </span>
            <span v-else>
              
              Thêm Khuyến mãi
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- LIST -->
    <div class="card list-card">
      <div class="card-header">
        <h3 class="card-title"><i class="ri-layout-grid-fill"></i> Danh sách Khuyến mãi</h3>
        <div class="badge">{{ list.length }} khuyến mãi</div>
      </div>

      <!-- TABLE LOADING -->
      <div v-if="tableLoading" class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải danh sách khuyến mãi...</div>
        </div>
      </div>

      <!-- TABLE CONTENT -->
      <div v-else-if="list.length" class="card-body no-padding">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-index">Vị trí hiển thị</th>
                <th class="th-content">Nội dung</th>
                <th class="th-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(k, i) in list" :key="k.ID" class="table-row">
                <td class="td-index" data-label="Vị trí hiển thị">
                  <div class="index-badge">#{{ i + 1 }}</div>
                </td>
                <td class="td-content" data-label="Nội dung">
                  <div class="content-text">{{ k.Noi_dung }}</div>
                </td>
                <td class="td-action" data-label="Thao tác">
                  <div class="action-group">
                    <button @click="openEdit(k)" class="btn-icon-action btn-edit" title="Chỉnh sửa">
                    
                      <span class="text">Sửa</span>
                    </button>
                    <button @click="deleteItem(k.ID)" class="btn-icon-action btn-delete" title="Xóa">
                      
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
          <div class="empty-icon"><i class="ri-add-circle-fill"></i></div>
          <h3 class="empty-title">Chưa có khuyến mãi nào</h3>
          <p class="empty-text">Bắt đầu bằng cách thêm khuyến mãi đầu tiên của bạn</p>
        </div>
      </div>
    </div>
  </div>

  <!-- EDIT MODAL -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-group">
              
              <h3 class="modal-title">Chỉnh sửa Khuyến mãi</h3>
            </div>
            <button @click="closeEditModal" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-field">
              <label class="modal-label">Nội dung khuyến mãi</label>
              <textarea
                v-model="editContent"
                rows="5"
                class="modal-textarea"
                placeholder="Nhập nội dung khuyến mãi..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditModal" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="saveEdit"
              :disabled="loading || !editContent.trim()"
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

/* ADD AREA */
.add-area {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: #94a3b8;
}

.input-field:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
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
  white-space: nowrap;
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
.th-content { 
  width: auto;
  text-align: left;
}
.th-action { 
  width: 180px;
}

.td-index,
.td-action {
  text-align: center;
}

.td-content {
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

.content-text {
  color: #ffffff;
  font-size: 14px;
  line-height: 1.6;
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
  background: green;
  color: white;
  box-shadow: 0 3px 12px rgba(139, 92, 246, 0.3);
  font-weight: bold;
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

  .add-area {
    flex-direction: column;
  }

  .input-field,
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
    text-align: left;
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
}
</style>