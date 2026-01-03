<script setup>
import { ref, onMounted, computed } from 'vue'

/* ================= CONFIG ================= */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'
const IMGBB_KEY = 'b202a4bdc79bf1dc72f6f6ded6b74501'

/* ================= STATE ================= */
const list = ref([])
const ncc = ref(null)
const loading = ref(false)
const tableLoading = ref(true)

/* form */
const tieuDe = ref('')
const stk = ref('')
const nganHang = ref('')
const nguoiNhan = ref('')
const tiGia = ref('')
const donViTienTe = ref('')
const file = ref(null)
const preview = ref('')

/* modal */
const showEdit = ref(false)
const editing = ref(null)

/* notification modal */
const notification = ref({
  show: false,
  type: 'info', // success, error, warning, confirm
  title: '',
  message: '',
  onConfirm: null
})

/* ================= NOTIFICATION HELPERS ================= */
function showNotification(type, title, message, onConfirm = null) {
  notification.value = {
    show: true,
    type,
    title,
    message,
    onConfirm
  }
}

function closeNotification() {
  notification.value.show = false
  setTimeout(() => {
    notification.value = {
      show: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null
    }
  }, 300)
}

function confirmNotification() {
  if (notification.value.onConfirm) {
    notification.value.onConfirm()
  }
  closeNotification()
}

/* ================= HELPERS ================= */
function genId() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    'BK' +
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
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

function buildThongTin() {
  return `${stk.value}\n${nganHang.value}\n${nguoiNhan.value}`
}

function parseThongTin(text = '') {
  const [a, b, c] = text.split('\n')
  stk.value = a || ''
  nganHang.value = b || ''
  nguoiNhan.value = c || ''
}

/* ================= COMPUTED ================= */
const hasPreviewData = computed(() => {
  return tieuDe.value || stk.value || nganHang.value || nguoiNhan.value || preview.value
})

/* ================= LOAD ================= */
async function loadData() {
  tableLoading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()

    list.value = json.data.thong_tin_chuyen_khoan || []
    ncc.value = json.data.nha_cung_cap?.[0] || null
  } finally {
    tableLoading.value = false
  }
}

/* ================= ADD ================= */
async function addQR() {
  if (!file.value || !ncc.value) {
    showNotification('error', 'Thiếu dữ liệu', 'Vui lòng điền đầy đủ thông tin và chọn ảnh QR')
    return
  }

  loading.value = true
  try {
    const url = await uploadImgBB(file.value)

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addThongTinChuyenKhoan',
        data: {
          ID: genId(),
          Tieu_de: tieuDe.value,
          ThongTin: buildThongTin(),
          QR_IMG: url,
          Ma_nha_cung_cap: ncc.value.Ma_nha_cung_cap,
          Ten_nha_cung_cap: ncc.value.Ten_nha_cung_cap,
          Ti_gia: tiGia.value,
          Don_vi_tien_te: donViTienTe.value,
        },
      }),
    })

    resetForm()
    showNotification('success', 'Thành công', 'Đã thêm QR Banking thành công!')
    setTimeout(loadData, 1200)
  } catch (e) {
    showNotification('error', 'Lỗi', 'Không thể thêm QR: ' + e.message)
  }
  loading.value = false
}

/* ================= EDIT ================= */
function openEdit(item) {
  editing.value = item
  tieuDe.value = item.Tieu_de
  tiGia.value = item.Ti_gia
  donViTienTe.value = item.Don_vi_tien_te
  preview.value = item.QR_IMG
  parseThongTin(item.ThongTin)
  showEdit.value = true
}

async function saveEdit() {
  if (!editing.value) return

  loading.value = true
  try {
    let url = editing.value.QR_IMG
    if (file.value) {
      url = await uploadImgBB(file.value)
    }

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateThongTinChuyenKhoan',
        data: {
          ID: editing.value.ID,
          Tieu_de: tieuDe.value,
          ThongTin: buildThongTin(),
          QR_IMG: url,
          Ma_nha_cung_cap: editing.value.Ma_nha_cung_cap,
          Ten_nha_cung_cap: editing.value.Ten_nha_cung_cap,
          Ti_gia: tiGia.value,
          Don_vi_tien_te: donViTienTe.value,
        },
      }),
    })

    closeEdit()
    showNotification('success', 'Thành công', 'Đã cập nhật QR Banking thành công!')
    setTimeout(loadData, 1200)
  } catch (e) {
    showNotification('error', 'Lỗi', 'Không thể cập nhật: ' + e.message)
  }
  loading.value = false
}

/* ================= DELETE ================= */
function deleteQR(id) {
  showNotification(
    'confirm',
    'Xác nhận xóa',
    'Bạn có chắc chắn muốn xóa QR Banking này không?',
    () => {
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteThongTinChuyenKhoan',
          ID: id,
        }),
      })

      showNotification('success', 'Đã xóa', 'QR Banking đã được xóa thành công!')
      setTimeout(loadData, 800)
    }
  )
}

/* ================= UI ================= */
function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  
  if (!f.type.startsWith('image/')) {
    showNotification('warning', 'File không hợp lệ', 'Vui lòng chọn file ảnh (JPG, PNG, GIF, v.v.)')
    return
  }
  
  if (f.size > 5 * 1024 * 1024) {
    showNotification('warning', 'File quá lớn', 'Kích thước ảnh tối đa 5MB')
    return
  }
  
  file.value = f
  preview.value = URL.createObjectURL(f)
}

function resetForm() {
  tieuDe.value = ''
  stk.value = ''
  nganHang.value = ''
  nguoiNhan.value = ''
  tiGia.value = ''
  donViTienTe.value = ''
  file.value = null
  preview.value = ''
}

function closeEdit() {
  showEdit.value = false
  editing.value = null
  resetForm()
}

/* ================= INIT ================= */
onMounted(loadData)
</script>

<template>
  <div class="admin-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <div class="icon-wrapper"><i class="ri-qr-code-line"></i></div>
        <div>
         <h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;"> QUẢN LÝ THÔNG TIN BANKING QR </h1>
          <p class="page-subtitle">Thêm, chỉnh sửa thông tin chuyển khoản QR</p>
        </div>
      </div>
    </div>

    <!-- ADD SECTION -->
    <div class="card add-card">
      <div class="card-header">
        <h3 class="card-title">Thêm QR Banking mới <i class="ri-add-circle-fill"></i></h3>
      </div>
      <div class="card-body">
        <div class="form-layout">
          <!-- LEFT: FORM FIELDS -->
          <div class="form-section">
            <div class="form-field">
              <label class="form-label">Tiêu đề</label>
              <input
                v-model="tieuDe"
                placeholder="VD: QR CODE"
                class="form-input"
              />
            </div>

            <div class="form-field">
              <label class="form-label">Số tài khoản</label>
              <input
                v-model="stk"
                placeholder="0933511334"
                class="form-input"
              />
            </div>

            <div class="form-field">
              <label class="form-label">Ngân hàng</label>
              <input
                v-model="nganHang"
                placeholder="MB BANK"
                class="form-input"
              />
            </div>

            <div class="form-field">
              <label class="form-label">Người nhận</label>
              <input
                v-model="nguoiNhan"
                placeholder="NGUYEN VO DINH ANH"
                class="form-input"
              />
            </div>

            <div class="form-field">
              <label class="form-label">QR Code *</label>
              <input
                type="file"
                accept="image/*"
                @change="onFileChange"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Tỉ giá</label>
                <input
                  v-model="tiGia"
                  type="number"
                  placeholder="1"
                  class="form-input"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Đơn vị tiền tệ</label>
                <input
                  v-model="donViTienTe"
                  placeholder="VND"
                  class="form-input"
                />
              </div>
            </div>

            <button
              @click="addQR"
              :disabled="loading || !file"
              class="btn btn-primary"
            >
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>
                Đang thêm...
              </span>
              <span v-else>
                HOÀN THÀNH
              </span>
            </button>
          </div>

          <!-- RIGHT: LIVE PREVIEW -->
          <div class="preview-section">
            <div class="preview-label">Bản xem trước</div>
            
            <div v-if="hasPreviewData" class="banking-preview">
              <!-- QR CODE -->
              <div class="preview-qr-wrapper">
                <img
                  v-if="preview"
                  :src="preview"
                  class="preview-qr-image"
                  alt="QR"
                />
                <div v-else class="preview-qr-placeholder">
                  <div class="qr-placeholder-icon">🏦</div>
                  <div class="qr-placeholder-text">QR Code</div>
                </div>
              </div>

              <!-- INFO -->
              <div class="preview-info">
                <div class="preview-info-title">
                  {{ tieuDe || 'QR CODE' }}
                </div>
                <div class="preview-info-item">
                  {{ stk || '0933511334' }}
                </div>
                <div class="preview-info-item">
                  {{ nganHang || 'MB BANK' }}
                </div>
                <div class="preview-info-item">
                  {{ nguoiNhan || 'NGUYEN VO DINH ANH' }}
                </div>
              </div>
            </div>

            <div v-else class="preview-empty">
              <div class="preview-empty-icon">🏦</div>
              <div class="preview-empty-text">Nhập thông tin để xem trước</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST -->
    <div class="card list-card">
      <div class="card-header">
        <h3 class="card-title"><i class="ri-qr-code-line"></i> Danh sách QR Banking</h3>
        <div class="badge">{{ list.length }} QR</div>
      </div>

      <!-- TABLE LOADING -->
      <div v-if="tableLoading" class="card-body">
        <div class="table-loading">
          <div class="table-loading-spinner"></div>
          <div class="table-loading-text">Đang tải danh sách QR...</div>
        </div>
      </div>

      <!-- TABLE CONTENT -->
      <div v-else-if="list.length" class="card-body no-padding">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-index">Vị trí</th>
                <th class="th-qr">QR Code</th>
                <th class="th-info">Thông tin </th>
                <th class="th-rate">Tỉ giá</th>
                <th class="th-currency">Đơn vị</th>
                <th class="th-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(i, idx) in list" :key="i.ID" class="table-row">
                <td class="td-index" data-label="Vị trí">
                  <div class="index-badge">#{{ idx + 1 }}</div>
                </td>
                <td class="td-qr" data-label="QR Code">
                  <div class="qr-thumbnail">
                    <img :src="i.QR_IMG" alt="QR" />
                  </div>
                </td>
                <td class="td-info" data-label="Thông tin">
                  <div class="bank-info">
                    <div class="bank-title">{{ i.Tieu_de }}</div>
                    <div class="bank-details">{{ i.ThongTin }}</div>
                  </div>
                </td>
                <td class="td-rate" data-label="Tỉ giá">
                  <div class="rate-value">{{ i.Ti_gia || '1' }}</div>
                </td>
                <td class="td-currency" data-label="Đơn vị">
                  <div class="currency-badge">{{ i.Don_vi_tien_te || 'VND' }}</div>
                </td>
                <td class="td-action" data-label="Thao tác">
                  <div class="action-group">
                    <button @click="openEdit(i)" class="btn-icon-action btn-edit" title="Chỉnh sửa">
                      <span class="text">Sửa</span>
                    </button>
                    <button @click="deleteQR(i.ID)" class="btn-icon-action btn-delete" title="Xóa">
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
          <h3 class="empty-title">Chưa có QR Banking nào</h3>
          <p class="empty-text">Bắt đầu bằng cách thêm QR Banking đầu tiên của bạn</p>
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
              <h3 class="modal-title">Chỉnh sửa QR Banking</h3>
            </div>
            <button @click="closeEdit" class="modal-close">
              <span>✖</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-field">
              <label class="modal-label">Tiêu đề</label>
              <input
                v-model="tieuDe"
                class="modal-input"
                placeholder="QR CODE"
              />
            </div>

            <div class="modal-field">
              <label class="modal-label">Số tài khoản</label>
              <input v-model="stk" class="modal-input" />
            </div>

            <div class="modal-field">
              <label class="modal-label">Ngân hàng</label>
              <input v-model="nganHang" class="modal-input" />
            </div>

            <div class="modal-field">
              <label class="modal-label">Người nhận</label>
              <input v-model="nguoiNhan" class="modal-input" />
            </div>

            <div class="modal-field">
              <label class="modal-label">QR Code</label>
              <input
                type="file"
                accept="image/*"
                @change="onFileChange"
                class="modal-input"
              />
            </div>

            <div class="modal-row">
              <div class="modal-field">
                <label class="modal-label">Tỉ giá</label>
                <input v-model="tiGia" type="number" class="modal-input" />
              </div>
              <div class="modal-field">
                <label class="modal-label">Đơn vị tiền tệ</label>
                <input v-model="donViTienTe" class="modal-input" />
              </div>
            </div>

            <div v-if="preview" class="modal-preview">
              <img :src="preview" alt="QR Preview" />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEdit" class="btn btn-secondary">
              <span class="btn-icon">✖</span>
              Hủy
            </button>
            <button
              @click="saveEdit"
              :disabled="loading"
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

  <!-- NOTIFICATION MODAL -->
  <Teleport to="body">
    <Transition name="notification">
      <div v-if="notification.show" class="notification-overlay" @click.self="closeNotification">
        <div class="notification-container" :class="`notification-${notification.type}`">
          <!-- ICON -->
          <div class="notification-icon">
            <div v-if="notification.type === 'success'" class="icon-success">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="4"/>
                <path d="M20 32L28 40L44 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div v-else-if="notification.type === 'error'" class="icon-error">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="4"/>
                <path d="M24 24L40 40M40 24L24 40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div v-else-if="notification.type === 'warning'" class="icon-warning">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 8L56 52H8L32 8Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                <path d="M32 24V36M32 44V44.5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div v-else-if="notification.type === 'confirm'" class="icon-confirm">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="4"/>
                <path d="M32 20V36M32 44V44.5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <!-- CONTENT -->
          <div class="notification-content">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <p class="notification-message">{{ notification.message }}</p>
          </div>

          <!-- BUTTONS -->
          <div class="notification-actions">
            <button 
              v-if="notification.type === 'confirm'" 
              @click="closeNotification" 
              class="notification-btn notification-btn-cancel"
            >
              Hủy
            </button>
            <button 
              v-if="notification.type === 'confirm'" 
              @click="confirmNotification" 
              class="notification-btn notification-btn-confirm"
            >
              Xác nhận
            </button>
            <button 
              v-else 
              @click="closeNotification" 
              class="notification-btn notification-btn-ok"
            >
              Đã hiểu
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
  background: white;
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

/* FORM LAYOUT */
.form-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  margin-bottom: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
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

/* PREVIEW SECTION */
.preview-section {
  display: flex;
  flex-direction: column;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

/* BANKING PREVIEW */
.banking-preview {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  gap: 20px;
  align-items: flex-start;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.preview-qr-wrapper {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.qr-placeholder-icon {
  font-size: 32px;
  opacity: 0.3;
  margin-bottom: 4px;
}

.qr-placeholder-text {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.preview-info-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.preview-info-item {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.5;
  word-break: break-word;
}

/* PREVIEW EMPTY */
.preview-empty {
  background: rgba(51, 65, 85, 0.3);
  border: 2px dashed rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  padding: 60px 24px;
  text-align: center;
}

.preview-empty-icon {
  font-size: 48px;
  opacity: 0.3;
  margin-bottom: 12px;
}

.preview-empty-text {
  font-size: 14px;
  color: #94a3b8;
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
.th-qr { width: 120px; }
.th-info { width: auto; }
.th-rate { width: 120px; }
.th-currency { width: 120px; }
.th-action { width: 180px; }

.td-index,
.td-qr,
.td-rate,
.td-currency,
.td-action {
  text-align: center;
}

.td-info {
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

.qr-thumbnail {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(51, 65, 85, 0.5);
}

.qr-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bank-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bank-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.bank-details {
  font-size: 13px;
  color: #e2e8f0;
  white-space: pre-line;
  line-height: 1.5;
}

.rate-value {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.currency-badge {
  display: inline-block;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(59, 130, 246, 0.3);
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

.modal-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
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

/* ============ NOTIFICATION MODAL ============ */
.notification-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.notification-container {
  background: rgba(30, 41, 59, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  padding: 40px 32px;
  text-align: center;
  border: 2px solid;
  animation: notificationBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes notificationBounce {
  0% {
    transform: scale(0.3) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.notification-success {
  border-color: rgba(34, 197, 94, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(22, 163, 74, 0.1) 100%);
}

.notification-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.notification-warning {
  border-color: rgba(234, 179, 8, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(202, 138, 4, 0.1) 100%);
}

.notification-confirm {
  border-color: rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(37, 99, 235, 0.1) 100%);
}

/* ICON */
.notification-icon {
  margin-bottom: 24px;
  animation: iconPulse 1.5s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.icon-success,
.icon-error,
.icon-warning,
.icon-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
}

.icon-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.icon-success::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(34, 197, 94, 0.3);
  animation: ripple 2s ease-out infinite;
}

.icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-error::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.3);
  animation: ripple 2s ease-out infinite;
}

.icon-warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.icon-warning::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(234, 179, 8, 0.3);
  animation: ripple 2s ease-out infinite;
}

.icon-confirm {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-confirm::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.3);
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* CONTENT */
.notification-content {
  margin-bottom: 32px;
}

.notification-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.notification-message {
  font-size: 15px;
  color: #cbd5e1;
  line-height: 1.6;
  max-width: 90%;
  margin: 0 auto;
}

/* ACTIONS */
.notification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.notification-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.notification-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.notification-btn:hover::before {
  transform: translateX(100%);
}

.notification-btn-ok {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.notification-btn-ok:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
}

.notification-btn-ok:active {
  transform: translateY(-1px);
}

.notification-btn-cancel {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 2px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.notification-btn-cancel:hover {
  background: rgba(51, 65, 85, 0.8);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.notification-btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.notification-btn-confirm:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
}

.notification-btn-confirm:active {
  transform: translateY(-1px);
}

/* NOTIFICATION ANIMATION */
.notification-enter-active {
  animation: notificationBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
}

.notification-leave-to .notification-container {
  transform: scale(0.8) translateY(30px);
  opacity: 0;
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

  .form-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .banking-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preview-qr-wrapper {
    width: 120px;
    height: 120px;
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

  .qr-thumbnail {
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

  .modal-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
  }

  /* NOTIFICATION MOBILE */
  .notification-container {
    padding: 32px 24px;
  }

  .notification-icon {
    margin-bottom: 20px;
  }

  .icon-success,
  .icon-error,
  .icon-warning,
  .icon-confirm {
    width: 64px;
    height: 64px;
  }

  .icon-success svg,
  .icon-error svg,
  .icon-warning svg,
  .icon-confirm svg {
    width: 48px;
    height: 48px;
  }

  .notification-title {
    font-size: 20px;
  }

  .notification-message {
    font-size: 14px;
  }

  .notification-actions {
    flex-direction: column;
  }

  .notification-btn {
    width: 100%;
    min-width: auto;
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

  .notification-container {
    padding: 28px 20px;
  }

  .notification-title {
    font-size: 18px;
  }
}
</style>