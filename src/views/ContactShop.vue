<script setup>
import { ref, onMounted } from 'vue'

/* ================= CONFIG ================= */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'
const IMGBB_KEY = 'b202a4bdc79bf1dc72f6f6ded6b74501'

/* ================= STATE ================= */
const contacts = ref([])
const ncc = ref(null)
const loading = ref(false)
const tableLoading = ref(true)

/* ADD FORM */
const form = ref({
  PLATFORM_name: '',
  INFO: '',
  Direct_link: '',
  file: null,
  preview: '',
})

/* EDIT MODAL */
const showEdit = ref(false)
const editing = ref(null)

/* ================= HELPERS ================= */
function genId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    'CT' +
    p(d.getDate()) +
    p(d.getMonth() + 1) +
    d.getFullYear() +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
}

async function uploadImgBB(file) {
  const fd = new FormData()
  fd.append('image', file)

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
    { method: 'POST', body: fd }
  )
  const json = await res.json()
  return json?.data?.url || ''
}

/* ================= LOAD ================= */
async function loadData() {
  tableLoading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()

    ncc.value = json.data.nha_cung_cap?.[0] || null

contacts.value = [...(json.data.shop_contact || [])]
  .filter(c => c.Ma_nha_cung_cap === ncc.value?.Ma_nha_cung_cap)
  

  } finally {
    tableLoading.value = false
  }
}

/* ================= FORM ================= */
function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  
  // Validate file type
  if (!f.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh')
    return
  }
  
  // Validate file size (max 5MB)
  if (f.size > 5 * 1024 * 1024) {
    alert('Kích thước ảnh tối đa 5MB')
    return
  }
  
  form.value.file = f
  form.value.preview = URL.createObjectURL(f)
}

function resetForm() {
  form.value = {
    PLATFORM_name: '',
    INFO: '',
    Direct_link: '',
    file: null,
    preview: '',
  }
}

/* ================= CRUD ================= */
async function addContact() {
  if (!form.value.PLATFORM_name || !form.value.file) {
    alert('Thiếu tên nền tảng hoặc ảnh')
    return
  }

  loading.value = true
  try {
    const img = await uploadImgBB(form.value.file)

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addShopContact',
        data: {
          ID: genId(),
          PLATFORM_name: form.value.PLATFORM_name,
          URL_img: img,
          INFO: form.value.INFO,
          Direct_link: form.value.Direct_link,
          Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
          Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
        },
      }),
    })

    resetForm()
    setTimeout(loadData, 900)
  } catch {
    alert('Lỗi thêm contact')
  }
  loading.value = false
}

function openEdit(c) {
  editing.value = {
    ...c,
    file: null,
    preview: c.URL_img,
  }
  showEdit.value = true
}

function closeEdit() {
  showEdit.value = false
  editing.value = null
}

function onEditFile(e) {
  const f = e.target.files[0]
  if (!f) return
  
  if (!f.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh')
    return
  }
  
  if (f.size > 5 * 1024 * 1024) {
    alert('Kích thước ảnh tối đa 5MB')
    return
  }
  
  editing.value.file = f
  editing.value.preview = URL.createObjectURL(f)
}

async function saveEdit() {
  if (!editing.value.PLATFORM_name) {
    alert('Thiếu tên nền tảng')
    return
  }

  loading.value = true
  try {
    let img = editing.value.URL_img
    if (editing.value.file) {
      img = await uploadImgBB(editing.value.file)
    }

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateShopContact',
        data: {
          ID: editing.value.ID,
          PLATFORM_name: editing.value.PLATFORM_name,
          URL_img: img,
          INFO: editing.value.INFO,
          Direct_link: editing.value.Direct_link,
          Ma_nha_cung_cap: editing.value.Ma_nha_cung_cap,
          Ten_nha_cung_cap: editing.value.Ten_nha_cung_cap,
        },
      }),
    })

    closeEdit()
    setTimeout(loadData, 800)
  } catch {
    alert('Lỗi cập nhật')
  }
  loading.value = false
}

function deleteContact(id) {
  if (!confirm('Xóa contact này?')) return

  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'deleteShopContact',
      ID: id,
    }),
  })

  setTimeout(loadData, 700)
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
          <h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;">QUẢN LÝ THÔNG TIN LIÊN HỆ SHOP</h1>
          <p class="page-subtitle">Thêm, chỉnh sửa thông tin liên hệ shop</p>
        </div>
      </div>
    </div>

    <!-- ADD SECTION -->
    <div class="card add-card">
      <div class="card-header">
        <h3 class="card-title"> Thêm Contact mới <i class="ri-contacts-book-upload-fill"></i></h3>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">Tên nền tảng *</label>
            <input
              v-model="form.PLATFORM_name"
              placeholder="Facebook / Telegram / Zalo..."
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Thông tin nền tảng</label>
            <input
              v-model="form.INFO"
              placeholder="@username / hotline..."
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Đường dẫn nền tảng</label>
            <input
              v-model="form.Direct_link"
              placeholder="https://..."
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Ảnh nền tảng *</label>
            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="form-input"
            />
          </div>
        </div>

        <!-- LIVE PREVIEW -->
        <div
          v-if="form.PLATFORM_name || form.preview || form.INFO"
          class="preview-section"
        >
          <div class="preview-label">bản hiển thị web ( Xem trước)</div>
          <div class="contact-preview">
            <div class="preview-img">
              <img v-if="form.preview" :src="form.preview" />
              <div v-else class="img-placeholder">IMG</div>
            </div>
            <div class="preview-content">
              <div class="preview-title">
                {{ form.PLATFORM_name || 'Tên nền tảng' }}
              </div>
              <div class="preview-info">
                {{ form.INFO || 'Thông tin nền tảng' }}
              </div>
            </div>
          </div>
        </div>

        <button
          @click="addContact"
          :disabled="loading || !form.PLATFORM_name || !form.file"
          class="btn btn-primary"
        >
          <span v-if="loading" class="btn-loading">
            <span class="spinner"></span>
            Đang thêm...
          </span>
          <span v-else>
            
            Thêm Contact
          </span>
        </button>
      </div>
    </div>

    <!-- LIST -->
    <div class="card list-card">
      <div class="card-header">
        <h3 class="card-title"><i class="ri-list-check"></i>Danh sách Contact</h3>
        <div class="badge">{{ contacts.length }} contact</div>
      </div>

      <!-- TABLE LOADING -->
      <div v-if="tableLoading" class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải danh sách contact...</div>
        </div>
      </div>

      <!-- TABLE CONTENT -->
      <div v-else-if="contacts.length" class="card-body no-padding">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-index">Vị trí</th>
                <th class="th-platform">Nền tảng</th>
                <th class="th-image">Ảnh</th>
                <th class="th-info">Thông tin</th>
                <th class="th-link">Đường dẫn</th>
                <th class="th-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in contacts" :key="c.ID" class="table-row">
                <td class="td-index" data-label="Vị trí">
                  <div class="index-badge">#{{ i + 1 }}</div>
                </td>
                <td class="td-platform" data-label="Nền tảng">
                  <div class="platform-name">{{ c.PLATFORM_name }}</div>
                </td>
                <td class="td-image" data-label="Ảnh">
                  <div class="image-wrapper">
                    <img :src="c.URL_img" :alt="c.PLATFORM_name" />
                  </div>
                </td>
                <td class="td-info" data-label="Thông tin">
                  <div class="info-text">{{ c.INFO || '—' }}</div>
                </td>
                <td class="td-link" data-label="Đường dẫn">
                  <a 
                    v-if="c.Direct_link"
                    :href="c.Direct_link"
                    target="_blank"
                    rel="noopener"
                    class="link-text"
                  >
                    {{ c.Direct_link }}
                  </a>
                  <span v-else class="no-link">—</span>
                </td>
                <td class="td-action" data-label="Thao tác">
                  <div class="action-group">
                    <button @click="openEdit(c)" class="btn-icon-action btn-edit" title="Chỉnh sửa">
                   
                      <span class="text">Sửa</span>
                    </button>
                    <button @click="deleteContact(c.ID)" class="btn-icon-action btn-delete" title="Xóa">
            
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
          <h3 class="empty-title">Chưa có contact nào</h3>
          <p class="empty-text">Bắt đầu bằng cách thêm contact đầu tiên của bạn</p>
        </div>
      </div>
    </div>
  </div>

  <!-- EDIT MODAL -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showEdit" class="modal-overlay" @click.self="closeEdit">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-group">
              
              <h3 class="modal-title">Chỉnh sửa Contact</h3>
            </div>
            <button @click="closeEdit" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-field">
              <label class="modal-label">Tên nền tảng *</label>
              <input
                v-model="editing.PLATFORM_name"
                class="modal-input"
                placeholder="Facebook / Telegram..."
              />
            </div>

            <div class="modal-field">
              <label class="modal-label">Thông tin nền tảng</label>
              <input
                v-model="editing.INFO"
                class="modal-input"
                placeholder="@username / hotline..."
              />
            </div>

            <div class="modal-field">
              <label class="modal-label">Đường dẫn</label>
              <input
                v-model="editing.Direct_link"
                class="modal-input"
                placeholder="https://..."
              />
            </div>

            <div class="modal-field">
              <label class="modal-label">Ảnh nền tảng</label>
              <input
                type="file"
                accept="image/*"
                @change="onEditFile"
                class="modal-input"
              />
            </div>

            <div v-if="editing.preview" class="modal-preview">
              <img :src="editing.preview" alt="Preview" />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEdit" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="saveEdit"
              :disabled="loading || !editing.PLATFORM_name"
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

/* FORM */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px 16px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
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

/* PREVIEW */
.preview-section {
  margin: 20px 0;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.contact-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  box-shadow: 0 12px 30px rgba(34, 197, 94, 0.35);
}

.preview-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 4px;
}

.preview-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
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

.th-index { width: 100px; }
.th-platform { width: 150px; }
.th-image { width: 100px; }
.th-info { width: auto; }
.th-link { width: 200px; }
.th-action { width: 180px; }

.td-index,
.td-image,
.td-action {
  text-align: center;
}

.td-platform,
.td-info {
  text-align: center;
}

.td-link {
  text-align: left;
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

.platform-name,
.info-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.image-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(51, 65, 85, 0.5);
  margin: 0 auto;
  border: 2px solid rgba(148, 163, 184, 0.2);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-text {
  color: #60a5fa;
  font-size: 13px;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.2s ease;
}

.link-text:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.no-link {
  color: #64748b;
  font-size: 13px;
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

.modal-input {
  width: 100%;
  padding: 12px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.modal-input::placeholder {
  color: #94a3b8;
}

.modal-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(51, 65, 85, 0.7);
}

.modal-preview {
  margin-top: 16px;
  text-align: center;
}

.modal-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  border: 2px solid rgba(148, 163, 184, 0.2);
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

  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
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

  .image-wrapper {
    margin: 8px 0;
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