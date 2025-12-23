<template>
  <div class="mobile-layout">

    <!-- 1. LOGO + TÊN -->
    <header class="mobile-header">
      <img
        v-if="logo"
        :src="logo.URL"
        class="logo"
      />
      <div class="logo-name">
        {{ logo?.Name }}
      </div>
    </header>

    <!-- 2. THÔNG BÁO -->
    <div
      v-if="thongBaoList.length"
      class="notice-bar"
    >
      {{ thongBaoList.map(t => t.Noi_dung).join(' • ') }}
    </div>

    <!-- 3. BANNER -->
    <div
      v-if="bannerList.length"
      class="banner"
    >
      <img :src="bannerList[currentBannerIndex].URL" />
    </div>

    <!-- 4. SEARCH -->
    <div class="search-wrapper">
      <input
        v-model="keyword"
        class="search-input"
        placeholder="Tìm món..."
      />
    </div>

    <!-- 5-8. THẺ HÀNG GRID 2x2 -->
    <div class="menu-grid">
      <div
        v-for="m in pagedMenu"
        :key="m.Ma_hang"
        class="menu-card"
      >
        <img
          :src="m.Main_img"
          @click="openDetail(m)"
        />

        <div class="card-info">
          <div class="name">
            {{ m.Ten_hang }}
          </div>

          <div class="price">
            {{ format(m.Gia_ban) }}đ
            <span v-if="m.Dvt">/ {{ m.Dvt }}</span>
          </div>

          <button
            class="add-btn"
            :disabled="m.Trang_thai === 'Hết hàng'"
            @click="addToCart(m)"
          >
            THÊM
          </button>
        </div>
      </div>
    </div>

    <!-- 9. PHÂN TRANG -->
    <div
      v-if="totalPages > 1"
      class="pagination"
    >
      <button
        v-for="p in pages"
        :key="p"
        :class="{ active: p === currentPage }"
        @click="currentPage = p"
      >
        {{ p }}
      </button>
    </div>

    <!-- 10-13. THANH NÚT DƯỚI -->
    <div class="bottom-bar">
      <button @click="showCategories = true">📂</button>
      <button @click="showContact = true">📞</button>
      <button @click="showCart = true">🛒</button>
      <button @click="showExportModal = true">🚀</button>
    </div>

    <!-- 14. FOOTER -->
    <footer class="footer">
      <div
        v-for="f in footerList"
        :key="f.ID"
      >
        {{ f.Noi_dung }}
      </div>
    </footer>

    <!-- ===== MODAL CHI TIẾT MÓN ===== -->
    <div
      v-if="showDetail"
      class="modal-overlay"
      @click="closeDetail"
    >
      <div
        class="modal-card"
        @click.stop
      >
        <button class="modal-close" @click="closeDetail">✕</button>

        <img
          :src="selectedItem.Main_img"
          class="modal-img"
        />

        <h3>{{ selectedItem.Ten_hang }}</h3>

        <p>{{ selectedItem.Mo_ta }}</p>

        <div class="price">
          {{ format(selectedItem.Gia_ban) }}đ
        </div>

        <button
          class="add-btn"
          @click="addToCart(selectedItem)"
        >
          THÊM VÀO GIỎ
        </button>
      </div>
    </div>

    <!-- ===== MODAL NỘI DUNG ĐƠN ===== -->
    <div
      v-if="showExportModal"
      class="modal-overlay"
      @click="showExportModal = false"
    >
      <div class="modal-card" @click.stop>
        <button class="modal-close" @click="showExportModal = false">✕</button>

        <h3>📦 Nội dung đơn hàng</h3>

        <textarea
          class="export"
          rows="10"
          readonly
          :value="exportText"
        ></textarea>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL =
  'https://script.google.com/macros/s/AKfycbxe3R-xxwz41Ym0iQSp2DyWL75pzJ-EUWhQJ--nSNtHAz363aaY4peat6SgykfR7Zc/exec'

const params = new URLSearchParams(location.search)
const maNCC = params.get('ncc')

/* ===== STATE ===== */
const menu = ref([])
const banners = ref([])
const thongBao = ref([])
const logos = ref([])
const footers = ref([])

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 8

const cart = ref({})
const showDetail = ref(false)
const selectedItem = ref(null)
const showExportModal = ref(false)

const showCategories = ref(false)
const showContact = ref(false)
const showCart = ref(false)

const currentBannerIndex = ref(0)

/* ===== LOAD DATA ===== */
onMounted(async () => {
  const res = await fetch(`${API_URL}?action=all`)
  const json = await res.json()

  menu.value = json.data.hang_hoa.filter(
    m => m.Ma_nha_cung_cap === maNCC
  )

  banners.value = json.data.banner || []
  thongBao.value = json.data.thong_bao || []
  logos.value = json.data.logo || []
  footers.value = json.data.footer || []
})

/* ===== COMPUTED ===== */
const logo = computed(() =>
  logos.value.find(l => l.Ma_nha_cung_cap === maNCC)
)

const thongBaoList = computed(() =>
  thongBao.value.filter(t => t.Ma_nha_cung_cap === maNCC)
)

const bannerList = computed(() =>
  banners.value.filter(b => b.Ma_nha_cung_cap === maNCC)
)

const footerList = computed(() =>
  footers.value.filter(f => f.Ma_nha_cung_cap === maNCC)
)

const filteredMenu = computed(() => {
  if (!keyword.value) return menu.value
  return menu.value.filter(m =>
    m.Ten_hang.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredMenu.value.length / pageSize)
)

const pagedMenu = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMenu.value.slice(start, start + pageSize)
})

const pages = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => i + 1)
)

const exportText = computed(() => {
  return Object.keys(cart.value)
    .map(k => {
      const m = menu.value.find(i => i.Ma_hang === k)
      return `${cart.value[k]} x ${m.Ten_hang}`
    })
    .join('\n')
})

/* ===== METHODS ===== */
function addToCart(m) {
  cart.value[m.Ma_hang] = (cart.value[m.Ma_hang] || 0) + 1
}

function openDetail(m) {
  selectedItem.value = m
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedItem.value = null
}

function format(n) {
  return Number(n || 0).toLocaleString('vi-VN')
}
</script>
<style scoped>
.mobile-layout {
  background: #0e1729;
  min-height: 100vh;
  padding-bottom: 72px;
}

.mobile-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg,#22c55e,#16a34a);
}

.logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: white;
}

.logo-name {
  font-weight: 900;
  color: white;
}

.notice-bar {
  padding: 8px 12px;
  background: #fde68a;
  font-weight: 600;
}

.banner img {
  width: 100%;
  aspect-ratio: 21/9;
  object-fit: contain;
}

.search-wrapper {
  padding: 10px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border-radius: 999px;
  border: 2px solid #22c55e;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
  padding: 12px;
}

.menu-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #16a34a;
}

.menu-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-info {
  padding: 8px;
}

.name {
  font-weight: 800;
  font-size: 14px;
}

.price {
  font-weight: 900;
  color: #15803d;
}

.add-btn {
  width: 100%;
  margin-top: 6px;
  padding: 8px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg,#22c55e,#16a34a);
  color: white;
  font-weight: 800;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(4,1fr);
  background: #16a34a;
  padding: 8px 0;
}

.bottom-bar button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
}

.footer {
  padding: 16px;
  text-align: center;
  color: white;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  width: 90%;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
