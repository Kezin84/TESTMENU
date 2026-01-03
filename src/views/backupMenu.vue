<template>
  
  <div
  class="layout"
  :class="{
    'hide-left': !showCategories,
    'hide-right': !showCart
  }"
>

    <!-- ========== SIDEBAR LEFT (1 + 2) ========== -->
    <aside class="sidebar-left" :class="{ collapsed: !showCategories }">
<button class="toggle-btn" @click="showCategories = !showCategories">
  <i
    :class="[
      showCategories
        ? 'ri-arrow-left-circle-fill'
        : 'ri-list-check',
      'toggle-icon'
    ]"
  ></i>
</button>



      <div v-if="showCategories" class="sidebar-content">
       <div class="logo-box" v-if="logo">
  <img :src="logo.URL" />
  <div class="logo-name">
    {{ logo.Name }}
  </div>
  <div v-if="shopTime" class="logo-time badge-online">
  <span class="dot-online"></span>
  {{ shopTime }}
</div>

</div>


        <div class="categories">
          <h4>{{ $t('menu.category') }}</h4>
        <div
  v-for="c in categories"
  :key="c"
  class="cat"
  :class="{
    active: c === currentCategory,
    sale: c === 'Sale'
  }"
  @click="selectCategory(c)"
>
  {{ c }}
</div>


        </div>
        <!-- ===== SHOP CONTACT ===== -->
<div
  v-if="shopContactList.length"
  class="shop-contact"
>
  <h4 class="contact-title">
    {{ $t('contact.sendOrder') }}
  </h4>

  <a
    v-for="c in shopContactList"
    :key="c.ID"
    :href="c.Direct_link"
    target="_blank"
    rel="noopener"
    class="contact-item"
  >
  <div class="contact-icon-wrap">
  <img
    :src="c.URL_img"
    class="contact-icon"
    alt=""
  />
</div>


    <div class="contact-info">
      <div class="contact-name">
        {{ c.PLATFORM_name }}
      </div>

      <div class="contact-desc">
        {{ c.INFO }}
      </div>
    </div>
  </a>
</div>

      </div>
    </aside>

    <!-- ========== MAIN CONTENT (3 4 5 6) ========== -->


    <main class="main" ref="mainRef">
      <div v-if="isMobile && logo" class="mobile-header-clean">
  <img :src="logo.URL" class="mh-logo" />

  <div class="mh-name">
    {{ logo.Name }}
  </div>

  <!-- ⏰ THỜI GIAN -->
  <div
    v-if="shopTime"
    class="logo-time badge-online mh-time"
  >
    <span class="dot-online"></span>
    {{ shopTime }}
  </div>
</div>
        <!-- ================== SKELETON ================== -->
  <div v-if="loadingMain" class="main-skeleton">
    <div class="sk-notice"></div>
    <div class="sk-banner"></div>
    <div class="sk-search"></div>
    <div class="sk-filter"></div>

    <div class="sk-grid">
      <div v-for="n in 8" :key="n" class="sk-card">
        <div class="sk-img"></div>
        <div class="sk-line"></div>
        <div class="sk-line short"></div>
        <div class="sk-btn"></div>
      </div>
    </div>
  </div>
  <template v-else>
      <!-- THÔNG BÁO -->
<div v-if="thongBaoList.length" class="notice-bar">
  <div class="notice-icon"><i class="ri-volume-up-fill"></i></div>

  <div class="notice-marquee">
    <span class="notice-text">
      {{ thongBaoList.map(t => t.Noi_dung).join(' • ') }}
    </span>
  </div>
</div>



      <!-- BANNER CAROUSEL -->
     <!-- BANNER CAROUSEL -->
<div v-if="bannerList.length > 0" class="banner">
  <img :src="bannerList[currentBannerIndex].URL" />

  <!-- NÚT PREV -->
  <button
    class="banner-btn prev"
    @click="prevBanner"
  >
    ‹
  </button>

  <!-- NÚT NEXT -->
  <button
    class="banner-btn next"
    @click="nextBanner"
  >
    ›
  </button>
</div>


      <!-- SEARCH -->
<div class="search-wrapper">
  <div class="search-box">
    <input
      v-model="keyword"
      type="text"
      :placeholder="$t('search.placeholder')"
      class="search-input"
    />

    <button class="search-btn" type="button">
      <i class="ri-search-line"></i>
    </button>
  </div>
<!-- ===== FILTER BAR ===== -->
<!-- ===== FILTER + LANGUAGE ROW ===== -->
 
<div class="filter-bar">
  <!-- FILTER -->
  <button
    class="filter-btn"
    :class="{ active: priceSort === 'all' }"
    @click="priceSort = 'all'"
  >
    {{ $t('filter.all') }}
  </button>

  <button
    class="filter-btn"
    :class="{ active: priceSort === 'asc' }"
    @click="priceSort = 'asc'"
  >
    {{ $t('filter.asc') }}
  </button>

  <button
    class="filter-btn"
    :class="{ active: priceSort === 'desc' }"
    @click="priceSort = 'desc'"
  >
    {{ $t('filter.desc') }}
  </button>

  <!-- LANGUAGE = FILTER THỨ 4 -->
  <button
    class="filter-btn lang-filter"
    @click="openLangModal"
    :title="$t('filter.changeLang')"
  >
    <img
      :src="currentLangFlagImg"
      class="lang-flag-img-only"
      alt="lang"
    />
  </button>
</div>

<!-- ===== LANGUAGE SWITCH ===== -->




  <!-- 🔝 SCROLL TO TOP – NẰM BÊN PHẢI -->

</div>

      <!-- MENU GRID 4x4 -->
<!-- MENU GRID 4x4 -->
<div class="menu" ref="menuRef" :key="menuKey" v-if="pagedMenu.length > 0">
<div
  v-for="m in pagedMenu"
  :key="m.Ma_hang"
  class="card-border"
  :class="{ out: m.Trang_thai === 'Hết hàng' }"
>
  <div
    class="card"
    @click="openDetail(m)"
  >



<div class="card-img-wrap">
  <img :src="m.Main_img" alt="" />

  <!-- TAG GIẢM GIÁ -->
  <div
    v-if="isDiscount(m)"
    class="discount-tag"
  >
    <span> -{{ discountPercent(m) }}%</span>
  </div>
</div>



  <div class="info">
    <!-- TAG TRẠNG THÁI -->
<div
  class="status-tag"
  :class="{
    available: m.Trang_thai === 'Còn hàng',
    out: m.Trang_thai === 'Hết hàng'
  }"
>
 {{ $t(getStatusKey(m.Trang_thai)) }}

</div>

    <!-- TÊN -->
    <h4 class="name">{{ m.Ten_hang }}</h4>

    <!-- MÔ TẢ -->
    <p class="desc">
      {{ m.Mo_ta || m.Ten_hang}}
    </p>
<a
  class="detail-link"
  @click.stop.prevent="openDetail(m)"
>
  {{ $t('menu.detail') }}
</a>


    <!-- GIÁ (BÊN PHẢI) -->
  <div class="price-row price-discount">
  <!-- GIÁ CŨ -->
  <span
    v-if="isDiscount(m)"
    class="price-old"
  >
    {{ formatPrice(m.Gia_ban, m.Don_vi_tien_te) }}
  </span>

  <!-- GIÁ SAU GIẢM -->
  <span class="price">
    {{ formatPrice(finalPrice(m), m.Don_vi_tien_te) }}
    <span v-if="m.Dvt" class="unit">/ {{ m.Dvt }}</span>
  </span>
</div>


    <!-- SỐ LƯỢNG (BÊN DƯỚI) -->
    <div class="qty-row">
      <button class="btn-qty" @click.stop="decTemp(m)">−</button>

<input
  type="number"
  min="1"
  v-model.number="tempQty[m.Ma_hang]"
  @click.stop
/>




    <button class="btn-qty" @click.stop="incTemp(m)">+</button>
    </div>

    <!-- ADD GIỎ -->
     
<button
  class="add-btn"
  :class="{ added: addedMap[m.Ma_hang] }"
  :disabled="m.Trang_thai === 'Hết hàng'"
  @click.stop="addToCart(m)"
>
  <template v-if="addedMap[m.Ma_hang]">
    <i class="ri-checkbox-circle-fill"></i>
  </template>
  <template v-else>
    {{ $t('menu.add') }}
  </template>
</button>





  </div>
</div>


</div>
</div>
<!-- EMPTY STATE -->
<div
  v-else
  class="empty-menu"
>
  {{ $t('empty.menu') }}&nbsp;
<i class="ri-search-2-line"></i>

</div>


      <!-- PAGINATION -->
      <div
  class="pagination"
  v-if="totalPages > 1"
  :key="pageKey"
>

        <button
  :disabled="currentPage === 1"
  @click="
    currentPage--;
    scrollToTop();
  "
>
  ‹
</button>


<template v-for="(p, idx) in pages" :key="`${p}-${idx}`">
  <button
    v-if="p !== '...'"
    :class="{ active: p === currentPage }"
    @click="
      currentPage = p;
      scrollToTop();
    "
  >
    {{ p }}
  </button>

  <span v-else class="page-dots">…</span>
</template>



       <button
  :disabled="currentPage === totalPages"
  @click="
    currentPage++;
    scrollToTop();
  "
>
  ›
</button>

      </div>
<!-- FOOTER -->
    
      </template>
    </main>
<transition name="detail-slide">
  <aside
    v-if="showDetailSidebar && isMobile"
    class="detail-sidebar"
  >
    <!-- HEADER -->
   <div class="detail-header">
  <button class="detail-back" @click="closeDetailSidebar">
    <i class="ri-arrow-left-line"></i>
  </button>

  <div class="detail-title">
    {{ selectedItem?.Ten_hang }}
  </div>
</div>
   <!-- ✅ ẢNH SẢN PHẨM (BỊ THIẾU) -->
    <div class="detail-image-wrap">
      <img
  :src="selectedItem?.Main_img"
  class="detail-img clickable"
  alt=""
  @click="openImageModal(selectedItem.Main_img)"
/>

    </div>

    <!-- BODY (COPY 100% TỪ MODAL) -->
    <div class="detail-body modal-right">

  <!-- TAG TRẠNG THÁI -->
  <div
    class="status-tag"
    :class="{
      available: selectedItem.Trang_thai === 'Còn hàng',
      out: selectedItem.Trang_thai === 'Hết hàng'
    }"
  >
    {{ selectedItem.Trang_thai }}
  </div>

  <!-- BADGE DANH MỤC -->
  <div v-if="selectedItem.Danh_muc" class="meta-tag">
    {{ $t('menu.category') }}: {{ selectedItem.Danh_muc }}
  </div>

  <!-- BADGE SIZE -->
  <div v-if="selectedItem.Size" class="meta-tag">
    Size: {{ selectedItem.Size }}
  </div>

  <!-- TÊN -->
  <h3 class="modal-title">
    {{ selectedItem.Ten_hang }}
  </h3>

  <!-- MÔ TẢ -->
  <p class="modal-desc">
    {{ selectedItem.Mo_ta || selectedItem.Ten_hang }}
  </p>

  <!-- GIÁ -->
<div class="modal-price price-discount">
  <!-- GIÁ CŨ -->
  <span
    v-if="isDiscount(selectedItem)"
    class="price-old"
  >
    {{ formatPrice(selectedItem.Gia_ban, selectedItem.Don_vi_tien_te) }}
  </span>

  <!-- GIÁ SAU GIẢM -->
  <span class="price">
    {{ formatPrice(finalPrice(selectedItem), selectedItem.Don_vi_tien_te) }}
    <span v-if="selectedItem.Dvt" class="modal-unit">
      / {{ selectedItem.Dvt }}
    </span>
  </span>
</div>


  <!-- QTY (Y CHANG MODAL) -->
  <div class="qty-row modal-qty">
    <button @click="decTemp(selectedItem)">−</button>
    <input
      type="number"
      min="1"
      v-model.number="tempQty[selectedItem.Ma_hang]"
    />
    <button @click="incTemp(selectedItem)">+</button>
  </div>
<!-- ===== GHI CHÚ MÓN (MOBILE) ===== -->
<div class="form-field">
  <label>{{ $t('menu.note') }}</label>
  <textarea
    rows="2"
    v-model="itemNotes[selectedItem.Ma_hang]"
    :placeholder="$t('menu.notePlaceholder') || 'VD: ít cay, không hành, thêm sốt...'"
  ></textarea>
</div>

  <!-- ADD -->
<button
  class="add-btn"
  :class="{
    added: addedMap[selectedItem.Ma_hang],
    closing: closingDetailSidebar
  }"
  :disabled="selectedItem.Trang_thai === 'Hết hàng'"
  @click="addFromDetailSidebar"
>

    <template v-if="addedMap[selectedItem.Ma_hang]">
      <i class="ri-checkbox-circle-fill"></i>
    </template>
    <template v-else>
      {{ $t('menu.add') }}
    </template>
  </button>

</div>

  </aside>
</transition>

    <!-- ========== SIDEBAR RIGHT – CART (7) ========== -->
    <aside class="sidebar-right" :class="{ collapsed: !showCart }">
 <button class="toggle-btn" @click="showCart = !showCart">
  <i
    :class="[
      showCart
        ? 'ri-arrow-right-circle-fill'
        : 'ri-shopping-cart-2-line',
      'toggle-icon'
    ]"
  ></i>
</button>



  <div v-if="showCart" class="sidebar-content cart-box">
    <h3 style="color: green;font-weight: bold;">    <i class="ri-shopping-basket-2-fill"></i> {{ $t('cart.title') }}</h3>

    <!-- ===== CHI TIẾT ĐƠN ===== -->
     <transition-group
  name="cart"
  tag="div"
  class="cart-list"
  ref="cartListRef"
>
<div class="cart-list" ref="cartListRef">
  <template v-for="(i, idx) in cartItems" :key="i.Ma_hang">
    
    <!-- ===== CART ROW ===== -->
<div
  class="cart-row"
  :class="{
    highlight: i.Ma_hang === lastAdded,
    active: editingItem?.Ma_hang === i.Ma_hang
  }"
  @click="openEditQty(i)"
>

      <!-- STT -->
      <div class="cart-col stt">
        {{ idx + 1 }}
      </div>

      <!-- INFO -->
      <div class="cart-col info">
        <div class="cart-name">{{ i.Ten_hang }}</div>

        <div class="cart-price">
          {{ formatPrice(i.Gia_ban, i.Don_vi_tien_te) }}
          <span v-if="i.Dvt">/ {{ i.Dvt }}</span>
        </div>

        <div class="cart-qty">
          {{ $t('cart.quantity') }}: x{{ i.qty }}
        </div>

        <div
          v-if="itemNotes[i.Ma_hang]"
          class="cart-item-note"
        >
          <i class="ri-edit-2-fill"></i>
          {{ itemNotes[i.Ma_hang] }}
        </div>
      </div>

      <!-- SUBTOTAL -->
      <div class="cart-col subtotal">
        {{ formatPrice(i.thanhTien, i.Don_vi_tien_te) }}
      </div>

      <!-- REMOVE -->
      <div class="cart-col action">
        <button
          class="remove-btn"
          @click.stop="removeItem(i)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- ===== INLINE EDIT QTY – CHỈ MOBILE ===== -->
   

  </template>
</div>

</transition-group>
<div class="cart-total">
  <span>{{ $t('cart.total') }}</span>
  <strong>
    {{ formatPrice(totalAmount, cartItems[0]?.Don_vi_tien_te) }}
  </strong>
</div>

<!-- ✅ HÀNG NÚT CK (TRÁI) + KHUYẾN MÃI (PHẢI) -->
<div class="cart-ck-km-row">
  <button
    class="ck-btn-inline"
    :disabled="!ckList.length"
    @click="showCKModal = true"
  >

    CHUYỂN KHOẢN
  </button>

  <div v-if="khuyenMaiNoiDung.length" class="khuyenmai-box km-inline">
    <div
      v-for="(km, idx) in khuyenMaiNoiDung"
      :key="idx"
      class="khuyenmai-item"
    >
      * {{ km }}
    </div>
  </div>
</div>




    <!-- ===== FORM THÔNG TIN ===== -->
<div class="cart-form">
    <div class="form-field">
    <label>{{ $t('cart.phone') }}</label>
    <input v-model="sdt" :placeholder="$t('cart.phonePlaceholder')" />
  </div>
<div class="form-field">
  <label>{{ $t('cart.address') }}</label>

  <input
    v-model="diaChi"
    :placeholder="$t('cart.addressPlaceholder')"
  />
</div>


  <div class="form-field">
    <label>{{ $t('cart.time') }}</label>
    <input v-model="thoiGian" :placeholder="$t('cart.timePlaceholder')" />
  </div>

  <div class="form-field">
    <label>{{ $t('cart.note') }}</label>
    <textarea
      v-model="ghiChu"
      rows="3"
      :placeholder="$t('cart.notePlaceholder')"
    ></textarea>
  </div>
 <button
  v-if="canFinish"
  class="finish-btn"
  @click="onFinish"
>
  {{ $t('cart.finish') }}
</button>
<!-- 👈 NÚT QUAY LẠI (MOBILE ONLY) -->
<button
  v-if="isMobile"
  class="back-btn"
  @click="closeCartMobile"
>
  {{ $t('cart.back') }}
</button>

</div>


   
  </div>
</aside>

  </div>
    <button
    class="scroll-top-fab"
    :title="$t('common.scrollTop')"
    @click="scrollToTop"
  >
    ▲
  </button>
  <!-- ===== MODAL CHI TIẾT SẢN PHẨM ===== -->
<!-- ===== MODAL CHI TIẾT SẢN PHẨM ===== -->
<div v-if="showDetail && !isMobile" class="modal-overlay" @click="closeDetail" >
  <div
  class="modal-card modal-wide"
  :class="{ closing: closingModal }"
  @click.stop
>

    <button class="modal-close" @click="closeDetail">✕</button>

    <div class="modal-content">
      <!-- ẢNH BÊN TRÁI -->
      <div class="modal-left">
       <img
  :src="selectedItem.Main_img"
  alt=""
  class="modal-img clickable"
  @click="openImageModal(selectedItem.Main_img)"
/>

      </div>

      <!-- THÔNG TIN BÊN PHẢI -->
      <div class="modal-right">
        <!-- TAG TRẠNG THÁI -->
        <div
          class="status-tag"
          :class="{
            available: selectedItem.Trang_thai === 'Còn hàng',
            out: selectedItem.Trang_thai === 'Hết hàng'
          }"
        >
          {{ selectedItem.Trang_thai }}
        </div>

        <!-- TAG DANH MỤC -->
        <div v-if="selectedItem.Danh_muc" class="meta-tag">
 {{ $t('menu.category') }}: {{ selectedItem.Danh_muc }}
        </div>

        <!-- TAG SIZE (NẾU CÓ) -->
        <div v-if="selectedItem.Size" class="meta-tag">
           Size: {{ selectedItem.Size }}
        </div>

        <h3 class="modal-title">
          {{ selectedItem.Ten_hang }}
        </h3>

        <p class="modal-desc">
          {{ selectedItem.Mo_ta || selectedItem.Ten_hang }}
        </p>

<div class="modal-price price-discount">
  <!-- GIÁ CŨ -->
  <span
    v-if="isDiscount(selectedItem)"
    class="price-old"
  >
    {{ formatPrice(selectedItem.Gia_ban, selectedItem.Don_vi_tien_te) }}
  </span>

  <!-- GIÁ SAU GIẢM -->
  <span class="price">
    {{ formatPrice(finalPrice(selectedItem), selectedItem.Don_vi_tien_te) }}
    <span v-if="selectedItem.Dvt" class="modal-unit">
      / {{ selectedItem.Dvt }}
    </span>
  </span>
</div>


<div class="qty-row modal-qty">
  <button @click="decTemp(selectedItem)">−</button>
  <input
    type="number"
    min="1"
    v-model.number="tempQty[selectedItem.Ma_hang]"
  />
  <button @click="incTemp(selectedItem)">+</button>
</div>

<div class="form-field">
  <label>{{ $t('menu.note') }}</label>
  <textarea
    rows="2"
    v-model="itemNotes[selectedItem.Ma_hang]"
    placeholder="VD: ít cay, không hành, thêm sốt..."
  ></textarea>
</div>

<button
  class="add-btn"
  :class="{ added: addedMap[selectedItem.Ma_hang] }"
  :disabled="selectedItem.Trang_thai === 'Hết hàng'"
  @click.stop="addToCartFromModal(selectedItem)"
>
  <template v-if="addedMap[selectedItem.Ma_hang]">
    <i class="ri-checkbox-circle-fill"></i>
  </template>
  <template v-else>
    {{ $t('menu.add') }}
  </template>
</button>



      </div>
    </div>
  </div>
</div>

<div
  v-if="showExportModal"
  class="modal-overlay"
  @click="showExportModal = false"
>
  <div class="modal-card" @click.stop>
    <button class="modal-close" @click="showExportModal = false">✕</button>

    <h3 class="export-title"><i class="ri-shopping-basket-2-fill"></i>{{ $t('export.title') }}</h3>

    <!-- TEXT EXPORT -->
    <textarea
      class="export"
      rows="10"
      readonly
      :value="exportText"
    ></textarea>

    <!-- ===== SEND TO SHOP ===== -->
    <div
      v-if="shopContactList.length"
      class="send-shop-box"
    >
     <!-- ===== COPY ===== -->
    <button
      class="copy-btn"
      :class="{ copied }"
      @click="copy"
    >
      {{ copied ? $t('export.copied') : $t('export.copy') }}
    </button>
      <button
        v-for="c in shopContactList"
        :key="c.ID"
        class="send-btn"
        @click="sendToShop(c)"
      >
         {{ $t('export.send') }} {{ c.PLATFORM_name }}
      </button>
    </div>

   
  </div>
</div>
<!-- ===== MODAL DANH MỤC (MOBILE) ===== -->
 <transition name="mobile-modal">
<div
  v-if="showCategoryModal"
  class="modal-overlay"
  @click="showCategoryModal = false"
>
  <div class="modal-card" @click.stop>
    <button class="modal-close" @click="showCategoryModal = false">✕</button>

    <h3 class="export-title"> {{ $t('modal.chooseCategory') }}</h3>
    
    <div class="categories">
  <div
  v-for="c in categories"
  :key="c"
  class="cat"
  :class="{
    active: c === currentCategory,
    sale: c === 'Sale'
  }"
  @click="selectCategory(c)"
>
  {{ c }}
</div>


    </div>
  </div>
</div>
</transition>
<!-- ===== MODAL LIÊN HỆ (MOBILE) ===== -->
 <transition name="mobile-modal">
<div
  v-if="showContactModal"
  class="modal-overlay"
  @click="showContactModal = false"
>
  <div class="modal-card" @click.stop>
    <button class="modal-close" @click="showContactModal = false">✕</button>

    <h3 class="export-title">{{ $t('contact.supportInfo') }}</h3>

    <div class="shop-contact">
      <a
        v-for="c in shopContactList"
        :key="c.ID"
        :href="c.Direct_link"
        target="_blank"
        rel="noopener"
        class="contact-item"
      >
        <div class="contact-icon-wrap">
          <img :src="c.URL_img" class="contact-icon" />
        </div>

        <div class="contact-info">
          <div class="contact-name">{{ c.PLATFORM_name }}</div>
          <div class="contact-desc">{{ c.INFO }}</div>
        </div>
      </a>
    </div>
  </div>
</div>
</transition>

<div v-if="isMobile" class="mobile-bottom-bar">
  <!-- HOME -->
  <button
    :class="{ active: activeMobilePanel === 'home' }"
    @click="goHomeMobile"
  >
    <div class="btn-inner">
      <div class="btn-scale">
        <i class="ri-home-4-line"></i>
        <span class="btn-label">Home</span>
      </div>
    </div>
  </button>
  <!-- DANH MỤC -->
 <button
  :class="{ active: activeMobilePanel === 'category' }"
  @click="openMobilePanel('category')"
>
  <div class="btn-inner">
    <div class="btn-scale category-btn-wrap">
      <i class="ri-list-check"></i>

      <!-- 🔴 SALE BADGE -->
      <span
        v-if="hasSale"
        class="sale-badge"
      >
        SALE
      </span>

      <span class="btn-label">
        {{ $t('mobile.category') }}
      </span>
    </div>
  </div>
</button>

  <!-- GIỎ HÀNG -->
  <button
    class="cart-btn"
    :class="{ active: activeMobilePanel === 'cart' }"
    @click="openMobilePanel('cart')"
  >
    <div class="btn-inner">
      <div class="btn-scale">
        <div class="cart-icon-wrap">
          <i class="ri-shopping-cart-2-fill" style="color:green"></i>

          <span
            v-if="cartItems.length"
            class="cart-badge"
            :class="{ bump: bumpCart }"
          >
            {{
              cartItems.reduce((sum, i) => sum + i.qty, 0)
            }}
          </span>
        </div>
        <span class="btn-label">{{ $t('mobile.cart') }}</span>
      </div>
    </div>
  </button>
  <!-- LIÊN HỆ -->
  <button
    :class="{ active: activeMobilePanel === 'contact' }"
    @click="openMobilePanel('contact')"
  >
    <div class="btn-inner">
      <div class="btn-scale">
        <i class="ri-customer-service-fill"></i>
        <span class="btn-label">{{ $t('mobile.contact') }}</span>
      </div>
    </div>
  </button>



  <!-- GỬI ĐƠN -->
  <button
    :class="{ active: activeMobilePanel === 'export' }"
    @click="openMobilePanel('export')"
  >
    <div class="btn-inner">
      <div class="btn-scale">
        <i class="ri-send-plane-fill"></i>
        <span class="btn-label">{{ $t('mobile.send') }}</span>
      </div>
    </div>
  </button>
</div>

<!-- ===== MODAL CHỌN NGÔN NGỮ ===== -->
<!-- ===== MODAL CHỌN NGÔN NGỮ ===== -->
<div v-if="showLangModal" class="modal-overlay">
  <div class="modal-card lang-modal">

    <!-- HEADER -->
    <div class="lang-modal-header">
      <div class="lang-title">
        {{ $t('modal.chooseLang') }}
      </div>

      <!-- NÚT TẮT -->
      <button class="lang-close-btn" @click="showLangModal = false">
        ✕
      </button>
    </div>

    <!-- LIST -->
<div class="lang-list">
  <button
    v-for="l in languages"
    :key="l.code"
    class="lang-item"
    :disabled="langLoading"
    @click="selectLanguage(l.code)"
  >
    <img :src="l.flagImg" class="lang-flag" />
    <span class="lang-label">{{ l.label }}</span>
  </button>

  <!-- LOADING OVERLAY -->
  <div v-if="langLoading" class="lang-loading">
    <div class="spinner"></div>
    <div class="loading-text">{{ $t('modal.loading') }}</div>
  </div>
</div>


  </div>
 
</div>


 <!-- ===== MODAL IMAGE PREVIEW ===== -->
<Teleport to="body">
  <div
    v-if="showImageModal"
    class="modal-overlay image-modal"
    @click="closeImageModal"
  >
    <div class="image-modal-card" @click.stop>
      <button class="modal-close" @click="closeImageModal">✕</button>

      <img
        :src="previewImage"
        class="image-preview"
        alt=""
      />
    </div>
  </div>
</Teleport>

<!-- ===== MODAL CHỈNH SỐ LƯỢNG ===== -->
<div v-if="showEditQtyModal" class="modal-overlay">

  <div class="modal-card qty-modal">

    <!-- close -->
    <button class="modal-close" @click="closeEditQtyModal">✕</button>


    <!-- tên hàng -->
    <div class="qty-title">
      {{ editingItem?.Ten_hang || editingItem?.name }}
    </div>

    <!-- qty control -->
    <div class="modal-qty">
      <button @click="editQty > 1 && editQty--">−</button>
      <input type="number" v-model.number="editQty" min="1" />
        <!-- DVT -->
  <span class="qty-dvt">
    /{{ editingItem?.DVT || editingItem?.Dvt || '' }}
  </span>
      <button @click="editQty++">+</button>
    </div>

    <!-- save -->
    <button class="save-btn" @click="saveEditQty">
      LƯU
    </button>

  </div>
</div>
<div
  v-if="showCKModal"
  class="modal-overlay"
  @click="showCKModal = false"
>
  <div class="modal-card ck-modal" @click.stop>
    <button class="modal-close" @click="showCKModal = false">✕</button>

    <h3 class="export-title">
      <i class="ri-bank-card-fill"></i>
      THÔNG TIN CHUYỂN KHOẢN
    </h3>

   <div v-if="ckList.length" class="ck-list">
  <div v-for="c in ckList" :key="c.ID" class="ck-card">

    <!-- (1) TIÊU ĐỀ (pill góc phải) -->
    <div class="ck-title">{{ c.Tieu_de }}</div>

    <!-- (2) TÊN NCC -->
<!-- (2) TÊN NCC -->
<div class="ck-ncc-wrap">
  <img
    v-if="logo?.URL"
    :src="logo.URL"
    class="ck-ncc-logo"
    alt="logo"
  />

  <div class="ck-ncc">
    {{ c.Ten_nha_cung_cap || 'Nhà cung cấp' }}
  </div>
</div>



<!-- 💰 SỐ TIỀN CHUYỂN -->
<div class="ck-amount">
  {{ soTienChuyenKhoan(c) }}
  <span class="ck-note">(Chưa tính ship)</span>
</div>



    <!-- (3) QR -->
    <div class="ck-qr-wrap" v-if="c.QR_IMG">
      <img :src="c.QR_IMG" class="ck-qr" alt="" />
    </div>

    <!-- (4) THÔNG TIN -->
    <div class="ck-info">
      {{ c.ThongTin }}
    </div>

  </div>
</div>

    <div v-else class="ck-empty">
      Chưa có thông tin chuyển khoản cho NCC này.
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, computed, onMounted, watch ,nextTick,onUnmounted  } from 'vue'
import L from 'leaflet'
import { useRoute,useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
watch(
  () => route.query.ncc,
  (ncc) => {
    if (ncc) {
      localStorage.setItem('CURRENT_NCC', ncc)
    }
  },
  { immediate: true }
)

const languages = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    flagImg: 'https://flagcdn.com/w40/vn.png'
  },
  {
    code: 'en',
    label: 'English',
    flagImg: 'https://flagcdn.com/w40/us.png'
  },
  {
    code: 'zh-CN',
    label: '中文',
    flagImg: 'https://flagcdn.com/w40/cn.png'
  },
  {
    code: 'fil',
    label: 'Filipino',
    flagImg: 'https://flagcdn.com/w40/ph.png'
  }
,
  {
    code: 'ko',
    label: '한국어',
    flagImg: 'https://flagcdn.com/w40/kr.png'
  }

]

const showLangModal = ref(false)
const currentLang = computed(() => route.params.lang || 'vi')
const langLoading = ref(false)
/* ===== CONFIG ===== */
const API_URL =
  'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'
const closingModal = ref(false)
const shopContacts = ref([])
const cartListRef = ref(null)
const params = new URLSearchParams(location.search)
const maNCC = params.get('ncc')
let bannerTimer = null
const tempQty = ref({})
/* ===== STATE ===== */
const menu = ref([])
const thongBao = ref([])
const banners = ref([])
const logos = ref([])
const footers = ref([])
const diaChi = ref('')
const sdt = ref('')
const thoiGian = ref('')
const ghiChu = ref('')
// ===== MAP + ADDRESS AUTOCOMPLETE =====
const mapRef = ref(null)
const addressKeyword = ref('')
const addressSuggestions = ref([])
const selectedLatLng = ref(null)
const khuyenMaiInfo = ref([])
const itemNotes = ref({}) // { [Ma_hang]: 'ghi chú món' }
const showExportModal = ref(false)
let map = null
let marker = null
const priceSort = ref('all')   // 🔥 mặc định TẤT CẢ
const addedMap = ref({})
const loadingMain = ref(true)
const CACHE_VERSION = 1
const CACHE_TTL = 1000 * 60 * 10 // 10 phút
const showCategoryModal = ref(false)
const showContactModal = ref(false)
const activeMobilePanel = ref(null)
const isMobile = ref(false)
const closingDetailSidebar = ref(false)
const showImageModal = ref(false)
const previewImage = ref('')
// ===== THÔNG TIN CHUYỂN KHOẢN =====
const thongTinChuyenKhoan = ref([])
const showCKModal = ref(false)

const ckList = computed(() =>
  (thongTinChuyenKhoan.value || []).filter(
    (x) =>
      String(x.Ma_nha_cung_cap || '').trim() ===
      String(maNCC || '').trim()
  )
)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}
function openCartMobile() {
  if (isMobile.value) {
    showCart.value = true
  }
}
watch(isMobile, (v) => {
  if (v) {
    showCategories.value = false
  }
})
onMounted(() => {
  const savedLang = localStorage.getItem('APP_LANG')

  // 👉 CHƯA BAO GIỜ CHỌN LANG
  if (!savedLang) {
    showLangModal.value = true
    return
  }

  // 👉 ĐÃ CÓ LANG, nhưng URL KHÁC
  if (route.params.lang !== savedLang) {
    redirectToLang(savedLang)
    return
  }

  reloadData()
})


async function waitForPageLoaded() {
  await nextTick()
  await nextTick()

  if (pagedMenu.value.length === 0) {
    await nextTick()
  }

  await new Promise(r => requestAnimationFrame(r))
}
async function selectLanguage(lang) {
  langLoading.value = true

  localStorage.setItem('APP_LANG', lang)

  locale.value = lang        // 🔥 BẮT BUỘC
  redirectToLang(lang)

  await waitForPageLoaded()

  langLoading.value = false
  showLangModal.value = false
}




function redirectToLang(lang) {
  const isMobile = route.path.includes('/mobile')

  router.replace({
    path: `/${lang}${isMobile ? '/mobile' : ''}`,
    query: route.query, // 🔥 GIỮ ?ncc
  })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 🔥 AUTO BẬT / TẮT GIỎ THEO THIẾT BỊ
  if (isMobile.value) {
    showCart.value = false   // mobile → tắt
  } else {
    showCart.value = true    // desktop → bật
  }
})

watch(isMobile, (val) => {
  if (val) {
    // chuyển sang mobile
    showCart.value = false
  } else {
    // chuyển sang desktop
    showCart.value = true
  }
})

function removeItem(i) {
  delete cart.value[i.Ma_hang]
}

const pages = computed(() => {
  const tp = totalPages.value
  const cp = currentPage.value
  const DOT = '...'
  const WINDOW = 4   // số trang hiển thị liền nhau (desktop + mobile)

  // Ít trang → show hết
  if (tp <= WINDOW + 1) {
    return Array.from({ length: tp }, (_, i) => i + 1)
  }

  // ===== SLIDING WINDOW (CHUNG) =====
  let start = cp
  let end = cp + WINDOW - 1

  if (end >= tp) {
    end = tp
    start = Math.max(1, tp - WINDOW + 1)
  }

  const range = []
  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (end < tp) {
    range.push(DOT, tp)
  }

  return range
})


const menuKey = computed(() => {
  return `${keyword.value}-${currentCategory.value}-${currentPage.value}`
})

const keyword = ref('')
const cart = ref({})
const currentCategory = ref('Tất cả')

const currentPage = ref(1)
const pageSize = 16

const showCategories = ref(true)
const showCart = ref(false)
const currentBannerIndex = ref(0)

/* ===== LOAD ===== */
onMounted(async () => {
  const res = await fetch(`${API_URL}?action=all`)
  const json = await res.json()
thongTinChuyenKhoan.value = json.data.thong_tin_chuyen_khoan || []

menu.value = (json.data.hang_hoa || []).filter(
  (m) =>
    m.Ma_nha_cung_cap === maNCC &&
    m.Lang === currentLang.value &&
    ['Còn hàng', 'Hết hàng'].includes(m.Trang_thai)
)

  // 🔥 KHỞI TẠO TEMP QTY CHUẨN
  menu.value.forEach((m) => {
    tempQty.value[m.Ma_hang] = 1
  })
  shopContacts.value = json.data.shop_contact || []
  thongBao.value = json.data.thong_bao || []
  banners.value = json.data.banner || []
  logos.value = json.data.logo || []
  times.value = json.data.time || []


  footers.value = json.data.footer || []


 startBannerAuto()
  // Auto-rotate banners
  if (bannerList.value.length > 1) {
    setInterval(() => {
      currentBannerIndex.value = 
        (currentBannerIndex.value + 1) % bannerList.value.length
    }, 3000)
  }
  khuyenMaiInfo.value = (json.data.khuyenmai_info || []).filter(
  (k) => k.Ma_nha_cung_cap === maNCC
)

nextTick(() => {
  if (mapRef.value && !map) {
    // 1️⃣ TẠO MAP (GLOBAL VIEW)
    map = L.map(mapRef.value, {
      worldCopyJump: true,
    }).setView([20, 0], 2) // 🌍 view toàn cầu

    // 2️⃣ TILE
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    // 3️⃣ 📍 AUTO LẤY VỊ TRÍ USER (OPTION)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          map.setView([latitude, longitude], 12)
        },
        () => {
          map.setView([20, 0], 2) // fallback global
        }
      )
    }
  }
})


})
function ensureTempQty(m) {
  if (!tempQty.value[m.Ma_hang]) {
    tempQty.value[m.Ma_hang] = 1
  }
}
function addToCartFromModal(m) {
  addToCart(m) // dùng lại logic cũ

  // chạy animation đóng
  closingModal.value = true

  setTimeout(() => {
    closeDetail()
    closingModal.value = false
  }, 220) // khớp với thời gian animation
}

/* ===== COMPUTED ===== */
const categories = computed(() => {
  const list = menu.value.map(m => m.Danh_muc).filter(Boolean)

  // 🔥 kiểm tra có hàng giảm không
  const hasSale = menu.value.some(m => isDiscount(m))

  return [
    'Tất cả',
    ...(hasSale ? ['Sale'] : []), // 👈 CHỈ THÊM DÒNG NÀY
    ...new Set(list)
  ]
})

  const shopContactList = computed(() =>
  shopContacts.value.filter(
    (c) => c.Ma_nha_cung_cap === maNCC
  )
)
const filteredMenu = computed(() => {
  let list = [...menu.value]

  // CATEGORY
 // CATEGORY
if (currentCategory.value === 'Sale') {
  list = list.filter(m => isDiscount(m))
}
else if (currentCategory.value !== 'Tất cả') {
  list = list.filter(m => m.Danh_muc === currentCategory.value)
}


  // SEARCH
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(m =>
      m.Ten_hang.toLowerCase().includes(kw)
    )
  }

  // SORT
if (priceSort.value === 'asc') {
  list.sort((a, b) => finalPrice(a) - finalPrice(b))
} 
else if (priceSort.value === 'desc') {
  list.sort((a, b) => finalPrice(b) - finalPrice(a))
}

  // all → không sort

  return list
})

let sortScrollTimer = null

watch(priceSort, () => {
  currentPage.value = 1

  // 🔥 debounce scroll giống pagination
  clearTimeout(sortScrollTimer)
  sortScrollTimer = setTimeout(() => {
    scrollToTop()
  }, 120) // chỉnh 100–150 tuỳ cảm giác
})


const totalPages = computed(() =>
  Math.ceil(filteredMenu.value.length / pageSize)
)

const pagedMenu = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMenu.value.slice(start, start + pageSize)
})

let searchScrollTimer = null

watch(keyword, () => {
  currentPage.value = 1
  clearTimeout(searchScrollTimer)

  searchScrollTimer = setTimeout(() => {
    scrollToTop()
  }, 120)
})

watch(
  () => totalPages.value,
  (tp) => {
    if (currentPage.value > tp) {
      currentPage.value = tp || 1
    }
  }
)

const cartItems = computed(() => {
  const items = menu.value
    .filter((m) => cart.value[m.Ma_hang])
    .map((m) => {
      const qty = cart.value[m.Ma_hang]
      return {
        ...m,
        qty,
        thanhTien: qty * finalPrice(m), // 🔥 CHỈ DÒNG NÀY
        addedTime: cart.value[m.Ma_hang + '_time'] || 0
      }
    })

  return items.sort((a, b) => a.addedTime - b.addedTime)
})


const totalAmount = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.thanhTien, 0)
)
const exportText = computed(() => {
  const lines = cartItems.value.map((i) => {
    const note = itemNotes.value[i.Ma_hang]
      ? ` (${itemNotes.value[i.Ma_hang]})`
      : ''

    return `${i.qty}x(${i.Ten_hang} ${formatPrice(
      i.Gia_ban,
      i.Don_vi_tien_te
    )}) : ${formatPrice(i.thanhTien, i.Don_vi_tien_te)}${note}`
  })

  return `
${lines.join('\n')}

${t('export.total')}: ${formatPrice(
  totalAmount.value,
  cartItems.value[0]?.Don_vi_tien_te
)}

${t('export.address')}: ${diaChi.value}
${t('export.phone')}: ${sdt.value}
${t('export.time')}: ${thoiGian.value}
${t('export.note')}: ${ghiChu.value}
`.trim()
})

const thongBaoList = computed(() =>
  thongBao.value
    .filter(t => t.Ma_nha_cung_cap === maNCC)
    .sort((a, b) => {
      // NOTI_YYYYMMDD_HHMMSS → mới nhất lên trước
      return String(b.ID).localeCompare(String(a.ID))
    })
)


const bannerList = computed(() =>
  banners.value
    .filter(b => b.Ma_nha_cung_cap === maNCC)
    .sort((a, b) => {
      // ID mới (thời gian lớn hơn) lên trước
      return String(b.ID).localeCompare(String(a.ID))
    })
)


const logo = computed(() =>
  logos.value.find((l) => l.Ma_nha_cung_cap === maNCC)
)
watch(
  logo,
  (val) => {
    if (!val) return

    setTitleAndFavicon(
      val.Name || val.Ten_shop || 'Shop Online',
      val.URL
    )
  },
  { immediate: true }
)

function setTitleAndFavicon(name, iconUrl) {
  // 🧠 TITLE TAB
  document.title = name || 'Shop Online'

  // 🧠 FAVICON TAB
  let link =
    document.querySelector("link[rel~='icon']") ||
    document.createElement('link')

  link.rel = 'icon'
  link.type = 'image/png'
  link.href = iconUrl || '/favicon.png'

  document.head.appendChild(link)
}

const footerList = computed(() =>
  footers.value.filter((f) => f.Ma_nha_cung_cap === maNCC)
)

/* ===== METHODS ===== */
function inc(m) {
  cart.value[m.Ma_hang] = (cart.value[m.Ma_hang] || 0) + 1
}
let searchTimer = null

async function searchAddress() {
  clearTimeout(searchTimer)

  if (addressKeyword.value.length < 3) {
    addressSuggestions.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        addressKeyword.value
      )}`
    )
    addressSuggestions.value = await res.json()
  }, 150)
}

function dec(m) {
  if (!cart.value[m.Ma_hang]) return
  cart.value[m.Ma_hang]--
  if (cart.value[m.Ma_hang] <= 0) delete cart.value[m.Ma_hang]
}

const copied = ref(false)

function copy() {
  navigator.clipboard.writeText(exportText.value)
  copied.value = true

  // optional: reset sau 2s
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function sendToShop(c) {
  const url = buildSendLink(c)
  window.open(url, '_blank')
}


function formatPrice(value, currency) {
  const price = Number(value || 0).toLocaleString('vi-VN')
  return currency ? `${price} ${currency}` : price
}

function startBannerAuto() {
  stopBannerAuto()

  if (bannerList.value.length <= 1) return

  bannerTimer = setInterval(() => {
    nextBanner()
  }, 3000)
}

function stopBannerAuto() {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}
function getStatusKey(raw) {
  if (!raw) return ''
  if (raw === 'Còn hàng') return 'status.in_stock'
  if (raw === 'Hết hàng') return 'status.out_stock'
  return raw
}

function selectAddress(place) {
  diaChi.value = place.display_name
  addressKeyword.value = place.display_name
  addressSuggestions.value = []

  const lat = Number(place.lat)
  const lon = Number(place.lon)

  selectedLatLng.value = { lat, lon }

  if (!marker) {
    marker = L.marker([lat, lon]).addTo(map)
  } else {
    marker.setLatLng([lat, lon])
  }

  map.setView([lat, lon], 16)
}

function nextBanner() {
  currentBannerIndex.value =
    (currentBannerIndex.value + 1) % bannerList.value.length
  startBannerAuto() // reset timer khi user bấm
}

function prevBanner() {
  currentBannerIndex.value =
    (currentBannerIndex.value - 1 + bannerList.value.length) %
    bannerList.value.length
  startBannerAuto()
}
function incTemp(m) {
  tempQty.value[m.Ma_hang]++
}


function getTempQty(m) {
  ensureTempQty(m)
  return tempQty.value[m.Ma_hang]
}

function decTemp(m) {
  if (tempQty.value[m.Ma_hang] > 1) {
    tempQty.value[m.Ma_hang]--
  }
}


const lastAdded = ref(null)

function addToCart(m) {
  addedMap.value[m.Ma_hang] = true
  setTimeout(() => {
    addedMap.value[m.Ma_hang] = false
  }, 500)

  lastAdded.value = m.Ma_hang
  setTimeout(() => {
    lastAdded.value = null
  }, 400)

  const qty = tempQty.value[m.Ma_hang]

if (!cart.value[m.Ma_hang]) {
  cart.value[m.Ma_hang] = qty
  cart.value[m.Ma_hang + '_time'] = Date.now() // 🔥 lưu thời gian lần đầu
} else {
  cart.value[m.Ma_hang] += qty
  cart.value[m.Ma_hang + '_time'] = Date.now() // 🔥 cập nhật thời gian mỗi lần thêm
}
  if (!itemNotes.value[m.Ma_hang]) {
    itemNotes.value[m.Ma_hang] = ''
  }

  tempQty.value[m.Ma_hang] = 1

  // ✅ CHỈ DESKTOP MỚI AUTO MỞ GIỎ
  if (!isMobile.value) {
    showCart.value = true
  }
}



const showDetail = ref(false)
const selectedItem = ref(null)
// sidebar mới (mobile)
const showDetailSidebar = ref(false)

function openDetail(m) {
  selectedItem.value = m

  if (isMobile.value) {
    // 📱 MOBILE → mở sidebar
    showDetailSidebar.value = true
  } else {
    // 🖥 DESKTOP → mở modal như cũ
    showDetail.value = true
  }
}


function closeDetail() {
  showDetail.value = false
  selectedItem.value = null
}

function closeDetailSidebar() {
  showDetailSidebar.value = false
  selectedItem.value = null
}


watch(
  () => cartItems.value.length,
  async () => {
    await nextTick()
    if (cartListRef.value) {
      cartListRef.value.scrollTop =
        cartListRef.value.scrollHeight
    }
  }
)


const khuyenMaiNoiDung = computed(() =>
  [
    ...new Set(
      khuyenMaiInfo.value
        .filter(k => k.Ma_nha_cung_cap === maNCC)
        .map(k => (k.Noi_dung || '').trim())
        .filter(Boolean)
    )
  ]
)

function buildSendLink(c) {
  const text = encodeURIComponent(exportText.value)

  // Telegram
  if (c.PLATFORM_name.toLowerCase().includes('telegram')) {
    // username hoặc link t.me
    return `${c.Direct_link}?text=${text}`
  }

  // Zalo (zalo.me/chat?msg=...)
  if (c.PLATFORM_name.toLowerCase().includes('zalo')) {
    return `${c.Direct_link}?msg=${text}`
  }

  // Facebook Messenger (fallback – chỉ mở chat)
  if (c.PLATFORM_name.toLowerCase().includes('facebook')) {
    return c.Direct_link
  }

  // Mặc định
  return c.Direct_link
}
const menuRef = ref(null)

function scrollToTop() {
  nextTick(() => {
    if (!menuRef.value) return

    const rect = menuRef.value.getBoundingClientRect()

    // 🔥 nếu menu đã gần đầu viewport thì KHÔNG scroll nữa
    if (rect.top >= 0 && rect.top < 30) {
      return
    }

    menuRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  })
}

function getCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const cache = JSON.parse(raw)

    if (cache.version !== CACHE_VERSION) return null
    if (Date.now() - cache.time > CACHE_TTL) return null

    return cache.data
  } catch (e) {
    return null
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: CACHE_VERSION,
        time: Date.now(),
        data
      })
    )
  } catch (e) {}
}


function applyData(data) {
  menu.value = (data.hang_hoa || []).filter(
    m =>
      m.Ma_nha_cung_cap === maNCC &&
      m.Lang === currentLang.value &&
      ['Còn hàng', 'Hết hàng'].includes(m.Trang_thai)
  )

  menu.value.forEach(m => {
    if (!tempQty.value[m.Ma_hang]) {
      tempQty.value[m.Ma_hang] = 1
    }
  })

  banners.value = data.banner || []
  thongBao.value = data.thong_bao || []
  logos.value = data.logo || []
  footers.value = data.footer || []
  shopContacts.value = data.shop_contact || []
  khuyenMaiInfo.value = data.khuyenmai_info || []
  times.value = data.time || []
  thongTinChuyenKhoan.value = data.thong_tin_chuyen_khoan || []
}


onMounted(async () => {
  loadingMain.value = true

  const cacheKey = `MENU_CACHE_${maNCC}_${currentLang.value}`

  const cached = getCache(cacheKey)

  // 🔥 1. LOAD TỨC THÌ TỪ CACHE
  if (cached) {
    applyData(cached)
    loadingMain.value = false
  }

  // 🔄 2. FETCH NGẦM ĐỂ UPDATE
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()
thongTinChuyenKhoan.value = json.data.thong_tin_chuyen_khoan || []

    const freshData = {
      hang_hoa: json.data.hang_hoa || [],
      banner: json.data.banner || [],
      thong_bao: json.data.thong_bao || [],
      logo: json.data.logo || [],
      footer: json.data.footer || [],
      shop_contact: json.data.shop_contact || [],
      khuyenmai_info: json.data.khuyenmai_info || [],
      time: json.data.time || []  ,      // ✅ THÊM
        thong_tin_chuyen_khoan: json.data.thong_tin_chuyen_khoan || [], // ✅ thêm
    }

    setCache(cacheKey, freshData)

    // nếu chưa có cache thì apply ngay
    if (!cached) {
      applyData(freshData)
      loadingMain.value = false
    }
  } catch (e) {
    if (!cached) loadingMain.value = false
  }
})

const currentLangFlagImg = computed(() => {
  const found = languages.find(l => l.code === currentLang.value)
  return found ? found.flagImg : ''
})


function openLangModal() {
  showLangModal.value = true
}

const canFinish = computed(() => {
  return (
    diaChi.value.trim() ||
    sdt.value.trim() ||
    thoiGian.value.trim() ||
    ghiChu.value.trim()
  )
})
function onFinish() {
  if (isMobile.value) {
    showCart.value = false
  }

  nextTick(() => {
    showExportModal.value = true
  })
}
function openMobilePanel(name) {
  if (!isMobile.value) return

  // nếu bấm lại chính nó → đóng
  activeMobilePanel.value =
    activeMobilePanel.value === name ? null : name

  // đồng bộ các state cũ
  showCategoryModal.value = activeMobilePanel.value === 'category'
  showContactModal.value  = activeMobilePanel.value === 'contact'
  showCart.value          = activeMobilePanel.value === 'cart'
  showExportModal.value   = activeMobilePanel.value === 'export'
}
function selectCategory(c) {
  currentCategory.value = c
  currentPage.value = 1

  // mobile thì đóng modal danh mục
  if (isMobile.value) {
    showCategoryModal.value = false
  }

  // đợi DOM update rồi scroll
  nextTick(() => {
    scrollToTop()
  })
}
const bumpCart = ref(false)

watch(
  () =>
    cartItems.value.reduce(
      (sum, i) => sum + i.qty,
      0
    ),
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      bumpCart.value = true
      setTimeout(() => {
        bumpCart.value = false
      }, 300)
    }
  }
)
function closeCartMobile() {
  if (isMobile.value) {
    showCart.value = false
  }
}


async function reloadData() {
  loadingMain.value = true

  const lang = route.params.lang || 'vi'
  const cacheKey = `MENU_CACHE_${maNCC}_${lang}`

  const cached = getCache(cacheKey)
  if (cached) {
    applyData(cached)
    loadingMain.value = false
  }

  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()
    thongTinChuyenKhoan.value = json.data.thong_tin_chuyen_khoan || []

    const freshData = {
      hang_hoa: json.data.hang_hoa || [],
      banner: json.data.banner || [],
      thong_bao: json.data.thong_bao || [],
      logo: json.data.logo || [],
      footer: json.data.footer || [],
      shop_contact: json.data.shop_contact || [],
      khuyenmai_info: json.data.khuyenmai_info || [],
      time: json.data.time || [] ,       // ✅ THÊM
        thong_tin_chuyen_khoan: json.data.thong_tin_chuyen_khoan || [], // ✅ thêm
    }

    setCache(cacheKey, freshData)

    if (!cached) {
      applyData(freshData)
      loadingMain.value = false
    }
  } catch (e) {
    if (!cached) loadingMain.value = false
  }
}
watch(
  () => route.params.lang,
  (lang) => {
    if (!lang) return

    /* 🔥 1. SYNC I18N (QUAN TRỌNG NHẤT) */
    if (locale.value !== lang) {
      locale.value = lang
    }

    /* 2. RESET STATE */
    currentPage.value = 1
    keyword.value = ''

    /* ⚠️ Nếu category là text tĩnh */
    currentCategory.value = 'Tất cả'
    // hoặc nếu mày có biến:
    // currentCategory.value = defaultCategory.value

    /* 3. RELOAD DATA */
    reloadData()
  },
  { immediate: true } // 🔥 BẮT BUỘC
)
function addFromDetailSidebar() {
  if (!selectedItem.value) return

  // 1️⃣ add vào giỏ (dùng lại logic cũ)
  addToCart(selectedItem.value)

  // 2️⃣ kích hoạt animation đóng
  closingDetailSidebar.value = true

  // 3️⃣ đợi animation xong → đóng sidebar
  setTimeout(() => {
    showDetailSidebar.value = false
    closingDetailSidebar.value = false
    selectedItem.value = null
  }, 260) // khớp với CSS
}
function goHomeMobile() {
  // reset filter + state về ban đầu
  activeMobilePanel.value = 'home'
  showCategoryModal.value = false
  showContactModal.value = false
  showCart.value = false
  showExportModal.value = false

  keyword.value = ''
  priceSort.value = 'all'
  currentCategory.value = 'Tất cả'
  currentPage.value = 1

  // scroll lên danh sách sản phẩm (dùng hàm cũ)
  nextTick(() => {
    scrollToTop()
  })
}
function openImageModal(src) {
  previewImage.value = src
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  previewImage.value = ''
}
const times = ref([])



const shopTime = computed(() => {
  if (!logo.value) return ''
  return (
    times.value.find(
      t => t.Ma_nha_cung_cap === logo.value.Ma_nha_cung_cap
    )?.thoi_gian_hoat_dong_shop || ''
  )
})

const showEditQtyModal = ref(false)
const editingItem = ref(null)
const editQty = ref(1)
function openEditQty(item) {
  editingItem.value = item
  editQty.value = item.qty

  if (isMobile.value) {
    showEditQtyModal.value = true
  } else {
    showEditQtyModal.value = true
  }
}

function saveEditQty() {
  if (!editingItem.value) return

  const ma = editingItem.value.Ma_hang
  cart.value[ma] = editQty.value   // 🔥 SỬA ĐÚNG NGUỒN

  showEditQtyModal.value = false
   editingItem.value = null // 👈 QUAN TRỌNG
}
function closeEditQtyModal() {
  showEditQtyModal.value = false
  editingItem.value = null   // 🔥 DÒNG QUYẾT ĐỊNH
}
const soTienChuyenKhoan = (c) => {
  const tong = Number(totalAmount.value || 0)

  const tiGia = Number(c.Ti_gia || 1)
  const donViCK = c.Don_vi_tien_te || ''

  const sauQuyDoi = tong * tiGia

  return `${formatPrice(tong, cartItems.value[0]?.Don_vi_tien_te)} ~ ${formatPrice(sauQuyDoi, donViCK)}`
}

function isDiscount(m) {
  return (
    Number(m.Gia_Giam) > 0 &&
    Number(m.Gia_Giam) < Number(m.Gia_ban)
  )
}

function finalPrice(m) {
  return isDiscount(m)
    ? Number(m.Gia_Giam)
    : Number(m.Gia_ban)
}

function discountPercent(m) {
  if (!isDiscount(m)) return 0

  return Math.round(
    100 - (Number(m.Gia_Giam) / Number(m.Gia_ban)) * 100
  )
}
const hasSale = computed(() =>
  menu.value.some(m => isDiscount(m))
)

</script>

<style scoped>
  
.layout {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  min-height: 100vh;
  background: #f9fafb;
}
.menu {
  scroll-margin-top: 90px; /* = chiều cao search + padding */
}

/* SIDEBAR LEFT */
.sidebar-left {
  border-right: 1px solid rgba(255, 255, 255, 0.25);
  
  background: linear-gradient(
    180deg,
    #22c55e,
    #16a34a,
    #038a47
  );

  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 20;

  box-shadow: 
    6px 0 24px rgba(0, 0, 0, 0.15);
}




.sidebar-left .sidebar-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
}


.sidebar-left .toggle-btn {
  position: absolute;
  top: 12px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  z-index: 10;
}

.logo-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  padding: 14px 10px 18px;
  margin: 8px 6px 18px;

  /* 🌌 GLASS CARD – THEME XANH ĐẬM */
  background: linear-gradient(
    135deg,
    rgba(0, 4, 40, 0.85),   /* #000428 */
    rgba(0, 78, 146, 0.65)  /* #004e92 */
  );

  backdrop-filter: blur(14px) saturate(1.6);
  -webkit-backdrop-filter: blur(14px) saturate(1.6);

  border-radius: 15px;

  /* viền kính nhẹ */
  border: 1px solid rgba(255, 255, 255, 0.35);

  /* chiều sâu */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.35),
    0 10px 28px rgba(0,0,0,0.35);
}




.logo-box img {
  width: 60px;
  height: 60px;

  border-radius: 25px;
  border: 1px solid yellow;



  box-shadow:
    0 8px 20px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.8);
}


.logo-name {
  max-width: 100%;
  text-align: center;
  color: #e5ff00;                 /* vàng chữ */
  
  font-size: 17px;
  font-weight: bold;
  
 
  
  line-height: 1.25;

  display: -webkit-box;
  -webkit-line-clamp: 2;     /* 🔥 tối đa 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.logo-box:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.7),
    0 14px 36px rgba(0,0,0,0.35);
  transform: translateY(-1px);
  transition: all 0.25s ease;
}

.categories .cat {
  padding: 10px 12px;
  margin-bottom: 6px;

  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;

  color: #ffffff;
  cursor: pointer;

  transition: all 0.2s ease;
}
/* hover */
.categories .cat:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* active */
.categories .cat.active {
  background: #ffffff;
  color: #065f46;

  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.15);
}
/* MAIN */
.main {
  padding: 12px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
    background: #0e1729;

  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main::after {
  content: '';
  position: sticky;
  bottom: 0;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(14,23,41,0.85)
  );
  pointer-events: none;
}




.notice-list {
  margin-bottom: 12px;
}

.notice {
  background: #fde68a;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 8px;
  color: #000000;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  border-left: 4px solid #f59e0b;
}

.banner {
  width: 100%;
  aspect-ratio: 21 / 7;   /* 👈 GIỮ KÍCH THƯỚC NHƯ HIỆN TẠI */
  flex-shrink: 0;         /* 🔥 KHÔNG BỊ CO KHI MAIN SCROLL */

  border-radius: 16px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;    /* tách nhẹ với search */

    background: #0e1729;
  

}


.banner img {
  width: 100%;
  height: 100%;
  border-radius: 16px; 
  object-fit: contain;   /* 🔥 KHÔNG CẮT – GIỐNG CARD */
  object-position: center;
border-radius: inherit; /* 👈 bo theo cha */
    background: #0e1729;
  box-shadow: 0 0 24px rgba(168, 250, 168, 0.45);
}



.search input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
}

.menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* ===== CARD ===== */
.card {
  background: #ffffff;
  
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

/* ===== INFO ===== */
.info {
  padding: 10px;
}

.name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}

.desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

/* ===== ROW GIÁ + SL ===== */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price {
  font-size: 16px;
  font-weight: 800;
  color: #15803d; /* xanh đậm */
}

/* ===== QTY ===== */
.qty {
  display: flex;
  align-items: center;
  gap: 4px; /* 👈 gần lại */
}

.qty input {
  width: 42px;
  height: 28px;
  text-align: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

/* NÚT + - */
.btn-qty {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #16a34a;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.btn-qty:active {
  transform: scale(0.92);
}

/* ===== ADD BUTTON ===== */
/* ===== ADD TO CART – PRO ===== */
.add-btn {
  margin-top: 8px;
  width: 100%;
  padding: 10px 0;
transition: background 0.2s ease, transform 0.1s ease;
  border: none;
  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );

  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.3px;

  cursor: pointer;
  user-select: none;

  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
  transition: all 0.2s ease;
}
.add-btn.added {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
}

.add-btn.added i {
  font-size: 18px;
}

.add-btn.added:active {
  transform: scale(0.95);
}
/* hover */
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(22, 163, 74, 0.6);
}

/* click */
.add-btn:active {
  transform: scale(0.97);
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.35);
}

/* HẾT HÀNG */
.add-btn:disabled {
  background: linear-gradient(
    135deg,
    #9ca3af,
    #6b7280
  );
  box-shadow: none;
  cursor: not-allowed;
}


/* PAGINATION */
/* ===== PAGINATION – VIP PRO ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 28px 0;
}

/* nút chung */
.pagination button {
  min-width: 40px;
  height: 40px;
  padding: 0 14px;

  border-radius: 999px;
  border: none;

  background: #ffffff;
  color: #004105;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

/* hover */
.pagination button:hover:not(:disabled):not(.active) {
  background: #ecfdf5;
  color: #065f46;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(22, 163, 74, 0.25);
}

/* ACTIVE */
.pagination button.active {
  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );
  color: #ffffff;

  box-shadow: 0 10px 22px rgba(22, 163, 74, 0.55);
  transform: translateY(-2px);
}

/* nút prev / next */
.pagination button:first-child,
.pagination button:last-child {
  font-size: 18px;
  font-weight: 900;
  padding: 0 16px;
}

/* disabled */
.pagination button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* SIDEBAR RIGHT */
.sidebar-right {
  border-left: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0; /* 👈 dính */
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s;
  z-index: 20;
   font-size: 13px;
  
}




.sidebar-right .sidebar-content {
  padding: 12px;
}

.sidebar-right .toggle-btn {
  position: absolute;
  top: 12px;
   left: auto;
    right: 12px;
  width: 24px;
  height: 24px;
  border: 1px solid #ffffff;
  background: rgb(3, 124, 19);
  color: white;
  cursor: pointer;
  z-index: 10;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

/* ===== EXPORT TEXTAREA – GREEN THEME ===== */
.export {
  width: 100%;
  margin-top: 8px;
  padding: 12px;

  border-radius: 14px;
  border: 2px solid #22c55e;

  background: linear-gradient(
    135deg,
    #ecfdf5,
    #d1fae5
  );

  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.45;

  color: #065f46; /* xanh đậm */

  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.06),
    0 6px 16px rgba(22, 163, 74, 0.25);

  outline: none;
  resize: none;
}
.export:focus {
  border-color: #16a34a;
  box-shadow:
    0 0 0 3px rgba(22, 163, 74, 0.25),
    inset 0 2px 6px rgba(0, 0, 0, 0.05);
}
/* ===== SCROLLBAR GREEN – EXPORT TEXTAREA ===== */

/* Chrome, Edge, Safari */
.export::-webkit-scrollbar {
  width: 8px;
}

.export::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.export::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    #22c55e,
    #16a34a
  );
  border-radius: 999px;
  border: 2px solid #ecfdf5;
}

.export::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    #16a34a,
    #15803d
  );
}

/* Firefox */
.export {
  scrollbar-width: thin;
  scrollbar-color: #22c55e #ecfdf5;
}

.copy-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  background: #16a34a;
  color: white;
  border: none;
}

/* FOOTER */
.footer {
  margin-top: auto; /* 🔥 quan trọng */
  padding: 16px;
  background: #16a34a;
  color: white;
  font-size: 13px;
  font-weight: bold;
  border-radius: 16px;
}


.footer div {
  color: white;
  margin-bottom: 6px;
}

/* ===== TEXT COLOR – FIX DỄ NHÌN ===== */
.layout {
  color: #000000;
}

.main,
.sidebar-left,
.sidebar-right {
  color: #000000;
}

h3, h4, h5, p, span, div {
  color: #000000;
}
/* MẶC ĐỊNH */
.layout {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  min-height: 100vh;
  background: #f9fafb;
  transition: grid-template-columns 0.3s ease;
}

/* ẨN LEFT */
.layout.hide-left {
  grid-template-columns: 40px 1fr 320px;
}

/* ẨN RIGHT */
.layout.hide-right {
  grid-template-columns: 220px 1fr 40px;
}

/* ẨN CẢ HAI */
.layout.hide-left.hide-right {
  grid-template-columns: 40px 1fr 40px;
}
.sidebar-left.collapsed .sidebar-content,
.sidebar-right.collapsed .sidebar-content {
  display: none;
}
.empty-menu {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  padding: 40px 0;
}
/* ===== SEARCH WRAPPER ===== */
.search-wrapper {
  position: sticky;
  top: 0;
  z-index: 15;
  padding: 12px 10px;
 backdrop-filter: blur(4px);
  background: transparent;   /* ❌ bỏ nền */
}

/* ===== SEARCH BOX ===== */
.search-box {
  max-width: 420px;
  margin: 0 auto;

  display: flex;
  align-items: center;

  background: #ffffff;
  border-radius: 999px;
  padding: 6px;

  /* 🔥 VIỀN XANH TEMPLATE */
  border: 2px solid #22c55e;

  /* 🔥 BÓNG XANH NHẸ */
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.25),
    0 8px 20px rgba(22, 163, 74, 0.35);
}


.search-box:focus-within {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px rgba(22, 163, 74, 0.25),
    0 10px 26px rgba(22, 163, 74, 0.45);
}

/* INPUT */
.search-input {
  flex: 1;
  border: none;
  outline: none;

  padding: 10px 14px;
  font-size: 14px;

  border-radius: 999px;
  background: transparent;
}

/* BUTTON SEARCH */
.search-btn {
  width: 36px;
  height: 36px;

  border: none;
  border-radius: 50%;

  background: #16a34a; /* xanh Grab */
  color: #ffffff;

  font-size: 16px;
  font-weight: bold;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.5);
  transition: all 0.2s ease;
}

/* hover */
.search-btn:hover {
  background: #15803d;
  transform: scale(1.05);
}

/* click */
.search-btn:active {
  transform: scale(0.95);
}

.banner {
  position: relative; /* 👈 bắt buộc */
}

.banner-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;

  /* 🌱 Grab green */
  background: #00b14f; /* xanh Grab chuẩn */
  color: #ffffff;

  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 12px rgba(0, 177, 79, 0.45);
  transition: all 0.2s ease;
}

.banner-btn.prev {
  left: 10px;
}

.banner-btn.next {
  right: 10px;
}

.banner-btn:hover {
  background: #009e47; /* đậm hơn tí */
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 18px rgba(0, 177, 79, 0.6);
}

.banner-btn:active {
  transform: translateY(-50%) scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 177, 79, 0.4);
}
/* GIÁ BÊN PHẢI */
.price-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.price {
  font-size: 16px;
  font-weight: 800;
  color: #15803d;
}

/* SỐ LƯỢNG BÊN DƯỚI */
/* ===== QTY CONTROLS – PRO ===== */
.qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* input số */
.qty-row input {
  width: 52px;
  height: 34px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #d1fae5;
  background: #ecfdf5;
  font-size: 15px;
  font-weight: 700;
  color: #065f46;

  outline: none;
  transition: all 0.2s ease;
}

.qty-row input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
}

/* nút + - */
.btn-qty {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;

  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-size: 18px;
  font-weight: 900;
  line-height: 1;

  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.4);
  transition: all 0.15s ease;
}

.btn-qty:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.55);
}

.btn-qty:active {
  transform: scale(0.9);
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
}


/* ===== TAG TRẠNG THÁI ===== */
/* ===== STATUS TAG – PRO ===== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 3px 10px;
  margin-bottom: 6px;

  font-size: 11px;
  font-weight: 700;
  line-height: 1;

  border-radius: 999px; /* pill */
  width: fit-content;

  letter-spacing: 0.3px;
  text-transform: uppercase;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  user-select: none;
}

/* ===== CÒN HÀNG ===== */
.status-tag.available {
  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );
  color: #fef08a; /* vàng nhạt dễ nhìn */
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* chấm trạng thái */
.status-tag.available::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fef08a;
  box-shadow: 0 0 6px rgba(254, 240, 138, 0.9);
}

/* ===== HẾT HÀNG ===== */
.status-tag.out {
  background: linear-gradient(
    135deg,
    #ef4444,
    #dc2626
  );
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-tag.out::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0.9;
}

/* ===== HOVER NHẸ ===== */
.card:hover .status-tag {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.25s ease;
  cursor: pointer;
}
.card:has(.status-tag.out) {
  opacity: 0.7;
}


/* ===== LINK XEM CHI TIẾT ===== */
.detail-link {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  cursor: pointer;
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
}

/* ===== MODAL OVERLAY ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* ===== MODAL CARD ===== */
.modal-card {
  background: #ffffff;
  border-radius: 16px;
  position: relative;

  border: 2px solid #22c55e;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.25),
    0 0 0 3px rgba(34, 197, 94, 0.15);
}

@keyframes modalPopFast {
  from {
    transform: scale(0.97);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes modalPop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* CLOSE */
.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: rgb(255, 82, 82);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

/* IMAGE */
/* ===== MODAL IMAGE – FIX KHÔNG CẮT ===== */
.modal-left {
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgb(28, 160, 28);
}

.modal-left .modal-img {
  width: 100%;
  height: auto;          /* 🔥 KHÔNG ÉP CAO */
  max-height: 340px;     /* 🔥 GIỚI HẠN HỢP LÝ */
  min-height: unset;     /* 🔥 BỎ min-height */
  object-fit: contain;   /* 🔥 KHÔNG CẮT ẢNH */
  background: #f9fafb;
}


/* BODY */
.modal-body {
  padding: 16px;
  text-align: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  margin: 6px 0;
}

.modal-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.modal-price {
  font-size: 20px;
  font-weight: 900;
  color: #15803d;
  margin-bottom: 12px;
}
/* ===== MODAL CARD – WIDE ===== */
.modal-card.modal-wide {
  width: 720px;
  max-width: 95%;
  border-radius: 16px;
}

/* layout trái phải */
.modal-content {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 14px;
}
/* LEFT */
.modal-left {
  background: #f9fafb;
}



/* RIGHT */
.modal-right {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* TITLE */
.modal-title {
  font-size: 20px;
  font-weight: 900;
  margin-top: 4px;
}

/* DESC */
.modal-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* PRICE */
/* MODAL – đẩy giá sang phải */
.modal-price {
  display: flex;
  justify-content: flex-end; /* 👈 đẩy sang phải */
  align-items: center;
  gap: 10px;

  margin-top: 8px;
  margin-bottom: 12px;
}

/* TAG DANH MỤC / SIZE */
.meta-tag {
  display: inline-block;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #bbf7d0;
}



.price .unit {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280; /* xám nhẹ */
  margin-left: 4px;
}
.modal-unit {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-left: 6px;
}



/* ===== CART BOX ===== */
.cart-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ===== LIST ===== */
.cart-list {
  max-height: 280px;
  overflow-y: auto;
}

/* ITEM */
.cart-row {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr 90px 32px;
  gap: 8px;
  padding: 8px 8px 8px 12px;

  border-bottom: 1px dashed #e5e7eb;
}

.cart-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 4px;

  background: linear-gradient(
    180deg,
    #22c55e,
    #16a34a
  );
  border-radius: 4px;
}


/* STT */
.cart-col.stt {
  text-align: center;
  font-weight: 700;
}

/* INFO (TÊN + GIÁ) */
.cart-col.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-name {
   font-size: 12.5px;
  font-weight: 700;
  line-height: 1.3;
}

.cart-price {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
}

/* QTY */
.cart-col.qty {
  text-align: center;
  font-weight: 700;
}

/* ACTION */
.cart-col.action {
  text-align: center;
}

.remove-btn {
  border: none;
  background: rgb(209, 4, 4);
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  border-radius: 12px;
}

/* ===== FORM ===== */
.cart-form input {
  width: 100%;
  margin-bottom: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 13px;
}

/* TEXTAREA */
.export {
  margin-top: 8px;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
font-size: 11px;
  line-height: 1.35;
  background: #f9fafb;
}

/* COPY */
.copy-btn {
  margin-top: 8px;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-weight: 800;
  cursor: pointer;
}


.cart-col.subtotal {
  text-align: right;
    font-size: 12.5px;
  font-weight: 800;
  color: #047857;
}

.cart-total {
  margin-top: 5px;
  margin-bottom: 10px;
  padding: 5px 6px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background: linear-gradient(135deg, #22c55e, #16a34a);

  border-radius: 12px;

  font-size: 14px;
  font-weight: 900;
}

/* ÉP TRẮNG + ĐẬM CHO TẤT CẢ CON */
.cart-total,
.cart-total span,
.cart-total strong,
.cart-total div {
  color: #e0dd07 !important;
  font-weight: bold;
   font-size: 14px;
}

.cart-qty {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

/* ===== FORM FIELD ===== */
.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.form-field label {
  font-size: 11.5px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #065f46; /* xanh đậm dễ nhìn */
}

/* INPUT + TEXTAREA CHUNG */
.form-field input,
.form-field textarea {
  width: 100%;
  padding: 7px 9px;

  border-radius: 8px;
  border: 1px solid #d1d5db;

  font-size: 12px;
  font-weight: 500;

  background: #ffffff;
  outline: none;
  resize: none;
}

/* FOCUS */
.form-field input:focus,
.form-field textarea:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
}

/* ===== MAP ===== */
.mini-map {
  height: 160px;
  margin-top: 6px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d1fae5;
}

/* ===== ADDRESS SUGGEST ===== */
.address-suggest {
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  max-height: 160px;
  overflow-y: auto;
  z-index: 50;
}

.address-suggest li {
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
}

.address-suggest li:hover {
  background: #ecfdf5;
}
.khuyenmai-box {
  margin: 4px 2px 8px;
  text-align: right;
}

.khuyenmai-item {
  font-size: 10px;
  font-weight: bold;
  color: #dc2626;
  line-height: 1.4;
  font-style: italic;
}

.cart-item-note {
  font-size: 10.5px;
  line-height: 1.3;
  font-style: italic;
  color: #374151;
  margin-top: 2px;
}
/* ===== MODAL QTY – GIỐNG CARD BÊN NGOÀI ===== */
.modal-qty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 8px 0 12px;
}

/* INPUT SỐ */
.modal-qty input {
  width: 52px;
  height: 34px;
  text-align: center;

  border-radius: 10px;
  border: 1px solid #d1fae5;

  background: #ecfdf5;
  font-size: 15px;
  font-weight: 700;
  color: #065f46;

  outline: none;
  transition: all 0.2s ease;
}

.modal-qty input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
}

/* NÚT + - */
.modal-qty button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;

  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-size: 18px;
  font-weight: 900;
  line-height: 1;

  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.4);
  transition: all 0.15s ease;
}

.modal-qty button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.55);
}

.modal-qty button:active {
  transform: scale(0.9);
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
}
/* ===== MODAL CLOSE ANIMATION ===== */
.modal-card.closing {
  animation: modalClose 0.22s ease forwards;
}

@keyframes modalClose {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.92);
    opacity: 0;
  }
}

/* ===== SHOP CONTACT ===== */
.shop-contact {
  margin-top: auto;        /* 🔥 đẩy xuống đáy */
  padding: 8px 4px;

  background: transparent; /* ❌ bỏ nền */
  box-shadow: none;
  border-radius: 0;
}


.contact-title {
  color: #ffffff;
  font-weight: 900;
  margin-bottom: 6px;
}

/* item */
.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 6px 8px;
  border-radius: 10px;

  color: #ffffff;
  background: transparent;
  transition: background 0.2s ease;
}
.contact-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.contact-icon {
  width: 36px;
  height: 36px;

  border-radius: 10px;
  border: 2px solid #ffffff;
  background: #ffffff;
}


.contact-name {
  color: #fbff00;
  font-weight: 800;
}

.contact-desc {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-style: italic;
}


.categories {
  flex: 1;                 /* 🔥 chiếm phần còn lại */
  overflow-y: auto;        /* 🔥 scroll tại đây */
  min-height: 0;           /* 🔥 fix bug flex scroll */

  margin-bottom: 12px;
  padding: 12px;

  background: #ffffff;
  border-radius: 16px;
  scrollbar-width: thin;                 /* Firefox */
  scrollbar-color: #22c55e transparent;  /* thumb | track */
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.15);
}
.categories::-webkit-scrollbar {
  width: 8px;
}

.categories::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.categories::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    #22c55e,
    #16a34a
  );
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.6); /* viền sáng nhẹ */
}
.categories::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    #16a34a,
    #15803d
  );
}

.categories::-webkit-scrollbar-thumb {
  opacity: 0.6;
}

.categories:hover::-webkit-scrollbar-thumb {
  opacity: 1;
}

.categories h4 {
  color: #047857;
  font-weight: 900;
}

.categories .cat {
  color: #047857;
  font-weight: 700;
}

/* hover */
.categories .cat:hover {
  background: #ecfdf5;
}

/* active */
.categories .cat.active {
  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );
  color: #ffffff;
}


/* thanh indicator bên trái */
.categories .cat.active::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);

  width: 4px;
  height: 18px;
  border-radius: 4px;
  background: #fef08a;
}
/* KHUNG THÔNG BÁO */
.notice {
  overflow: hidden;        /* ❗ bắt buộc */
  white-space: nowrap;
  position: relative;
}

/* KHUNG CHẠY */
.notice-marquee {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
}

.notice-text {
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
 animation-delay: -10s; /* 🔥 CHẠY NGAY */
  animation: notice-move 12s linear infinite;
}

/* CHẠY NGAY LẬP TỨC */
@keyframes notice-move {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}

/* hover pause */
.notice-bar:hover .notice-text {
  animation-play-state: paused;
}



/* PAUSE KHI HOVER (RẤT APP) */
.notice:hover .notice-text {
  animation-play-state: paused;
}

/* ===============================
   LIQUID GLASS – NOTICE BAR
   =============================== */
.notice-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 5px;
  padding: 12px 16px;
  margin-bottom: 14px;

  /* 🌿 GLASS TRONG SUỐT */
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.18),
    rgba(255, 255, 255, 0.06)
  );

  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);

  border-radius: 18px;

  /* viền kính mỏng */
  border: 1px solid rgba(255, 255, 255, 0.28);

  /* chiều sâu */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.45),
    0 10px 26px rgba(0,0,0,0.28);

  overflow: hidden;
}


.notice-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;

  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.75),
    rgba(255,255,255,0.15),
    rgba(255,255,255,0.55)
  );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;

  pointer-events: none;
}

.notice-bar::after {
  content: "";
  position: absolute;
  top: -40%;
  left: -30%;
  width: 60%;
  height: 160%;

  background: radial-gradient(
    ellipse at center,
    rgba(255,255,255,0.35),
    transparent 70%
  );

  transform: rotate(18deg);
  pointer-events: none;
}


/* ICON */
.notice-icon {
  font-size: 20px;
  color: #ecfdf5;
  text-shadow: 0 2px 6px rgba(0,0,0,0.45);
}


/* KHUNG CHẠY */
.notice-marquee {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
}

/* TEXT CHẠY */

.notice-text {
  font-size: 14px;
  font-weight: 600;
  color: #ecfdf5;

  text-shadow:
    0 1px 3px rgba(0,0,0,0.45);

  animation: notice-move 12s linear infinite;
}

/* PAUSE KHI HOVER */
.notice-bar:hover .notice-text {
  animation-play-state: paused;
}
.notice-bar:hover {
  backdrop-filter: blur(22px) saturate(1.8);
  -webkit-backdrop-filter: blur(22px) saturate(1.8);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.55),
    0 14px 32px rgba(0,0,0,0.35);
}


/* ANIMATION */
@keyframes notice-move {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}

/* ===== CONTACT ICON – RUNG + TỎA LIÊN TỤC ===== */
.contact-icon-wrap {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* ICON */
.contact-icon {
  width: 36px;
  height: 36px;

  border-radius: 10px;
  border: 2px solid #ffffff;
  background: #ffffff;

  z-index: 2;

  /* 🔥 RUNG LIÊN TỤC */
  animation: shake-hard 0.45s linear infinite;
  will-change: transform;
}

/* ===== VÒNG TỎA SÓNG ===== */
.contact-icon-wrap::before,
.contact-icon-wrap::after {
  content: '';
  position: absolute;
  inset: 0;

  border-radius: 14px;
  background: rgba(255, 251, 16, 0.979);

  z-index: 1;
  animation: ripple-hard 1.2s ease-out infinite;
}

/* lệch pha để tỏa liên tục */
.contact-icon-wrap::after {
  animation-delay: 0.6s;
}
@keyframes shake-hard {
   0%   { transform: translate(0, 0) rotate(0); }
  15%  { transform: translate(-1px, 0) rotate(-1deg); }
  30%  { transform: translate(1px, 0) rotate(1deg); }
  45%  { transform: translate(-1px, 1px) rotate(-1deg); }
  60%  { transform: translate(1px, -1px) rotate(1deg); }
  75%  { transform: translate(-1px, 0) rotate(-0.5deg); }
  100% { transform: translate(0, 0) rotate(0); }
}
@keyframes ripple-hard {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  70% {
    transform: scale(1.6);
    opacity: 0.2;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}
/* ===== ẨN SCROLLBAR CỦA SIDEBAR LEFT (TỔNG) ===== */

/* Chrome, Edge, Safari */
.sidebar-left::-webkit-scrollbar {
  display: none;
}

/* Firefox */
.sidebar-left {
  scrollbar-width: none;
}

/* IE / Edge cũ */
.sidebar-left {
  -ms-overflow-style: none;
}
.finish-btn {
  margin-top: 10px;
  width: 100%;
  padding: 12px 0;

  border: none;
  border-radius: 14px;

  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.3px;

  cursor: pointer;
  box-shadow: 0 8px 18px rgba(22,163,74,0.45);
}

.finish-btn:active {
  transform: scale(0.97);
}
.finish-btn:hover {
  transform: scale(0.97);
  background: white;
  color: #009e47;
}
.export-title {
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 8px;
  color: #065f46;
  text-align: center;
}

.modal-card {
  width: 360px;
  max-width: 92%;
  padding: 14px;
}

/* ===== SEND SHOP ===== */
.send-shop-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.send-btn {
  width: 100%;
  padding: 10px;

  border: none;
  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #0ea5e9,
    #2563eb
  );

  color: #ffffff;
  font-size: 14px;
  font-weight: 800;

  cursor: pointer;

  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.45);
  transition: all 0.2s ease;
}

.send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.6);
}

.send-btn:active {
  transform: scale(0.96);
}

/* ===== COPY BTN ===== */
.copy-btn {
  margin-top: 10px;
  width: 100%;
  padding: 10px;

  border-radius: 12px;
  border: none;

  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );

  color: #ffffff;
  font-weight: 900;
  font-size: 14px;

  cursor: pointer;
  transition: all 0.2s ease;
}

/* trạng thái đã copy */
.copy-btn.copied {
  background: linear-gradient(
    135deg,
    #10b981,
    #059669
  );
}
/* ===== SCROLLBAR GREEN – CART LIST (CHI TIẾT ĐƠN) ===== */

/* Chrome, Edge, Safari */
.cart-list::-webkit-scrollbar {
  width: 8px;
}

.cart-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.cart-list::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    #22c55e,
    #16a34a
  );
  border-radius: 999px;
  border: 2px solid #ecfdf5;
}

.cart-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    #16a34a,
    #15803d
  );
}

/* Firefox */
.cart-list {
  scrollbar-width: thin;
  scrollbar-color: #22c55e #ecfdf5;
}

/* ===== SCROLL TO TOP BUTTON ===== */
.scroll-top-btn {
  width: 36px;
  height: 36px;

  margin-left: 6px;

  border: none;
  border-radius: 50%;

  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );

  color: #ffffff;
  font-size: 16px;
  font-weight: 900;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.5);
  transition: all 0.2s ease;
}

/* ===== SEARCH WRAPPER ===== */
.search-wrapper {
  position: sticky;
  top: 0;
  z-index: 15;

  padding: 12px 10px;
  backdrop-filter: blur(4px);
}

/* ===== SCROLL TO TOP FLOAT BUTTON ===== */
/* ===== SCROLL TO TOP – GLOBAL FLOAT ===== */
.scroll-top-fab {
  position: fixed;
  right: 14px;

  /* desktop */
  bottom: 24px;

  width: 44px;
  height: 44px;

  border-radius: 50%;
  border: 3px solid rgb(255, 166, 31);

  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-size: 18px;
  font-weight: 900;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  z-index: 1200;

  box-shadow:
    0 6px 16px rgba(22, 163, 74, 0.55),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15);

  transition: transform 0.2s ease, opacity 0.2s ease;
}
/* ===== CARD IMAGE – KHÔNG CẮT ===== */
.card-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;        /* 🔥 giữ khung đều */
  background: #f9fafb;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  
}
.card-img-wrap::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 0;

  height: 3px;
  border-radius: 999px;

  background: linear-gradient(
    90deg,
    transparent,
    #22c55e,
    #16a34a,
    #22c55e,
    transparent
  );
}
.card-img-wrap img {
  width: 100%;
  height: 100%;

  object-fit: contain;        /* 🔥 KHÔNG CẮT ẢNH */
  padding: 8px;               /* 🔥 thở ảnh */
}
.card:hover .card-img-wrap img {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
.scroll-top-fab:hover {
  transform: scale(1.08);
  background: #15803d;
  box-shadow: 0 8px 22px rgba(22, 163, 74, 0.7);
}

.scroll-top-fab:active {
  transform: scale(0.94);
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.45);
}

/* ===== FILTER BAR ===== */
.filter-bar {
  margin-top: 8px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  justify-content: center; /* 🔥 BẮT BUỘC */
}


/* SELECT */
.filter-select {
  padding: 8px 12px;
  border-radius: 999px;
  border: 2px solid #22c55e;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  background: #ffffff;
}

/* PRICE RANGE */
.price-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-range input {
  width: 90px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 2px solid #22c55e;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  text-align: center;
}

.price-range span {
  font-weight: 900;
  color: #16a34a;
}
.filter-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 2px solid #22c55e;
  background: #ffffff;

  font-size: 13px;
  font-weight: 700;
  color: #065f46;

  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #ecfdf5;
}

.filter-btn.active {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(22,163,74,0.45);
}
.toggle-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;

  background: #ffffff;
  color: #16a34a;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toggle-icon {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

/* hover */
.toggle-btn:hover .toggle-icon {
  transform: scale(1.15);
}

/* click */
.toggle-btn:active .toggle-icon {
  transform: scale(0.9);
}
/* khi item mới xuất hiện */
.cart-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.cart-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.cart-enter-active {
  transition: all 0.4s ease;
}

/* khi item bị xóa */
.cart-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.cart-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.cart-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}
.cart-row.highlight {
  background: #ecfdf5;
  box-shadow: inset 0 0 0 1px #04a83e;
  transition: background 1s ease;
}
/* ===== SKELETON BASE ===== */
.main-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.main-skeleton > div {
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 37%,
    #e5e7eb 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
  border-radius: 14px;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ===== BLOCKS ===== */
.sk-notice {
  height: 46px;
}

.sk-banner {
  height: 160px;
}

.sk-search {
  height: 48px;
  max-width: 420px;
  margin: 0 auto;
}

.sk-filter {
  height: 42px;
  max-width: 480px;
  margin: 0 auto;
}

/* ===== GRID ===== */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* ===== CARD ===== */
.sk-card {
  background: none !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-card > div {
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 37%,
    #e5e7eb 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
  border-radius: 10px;
}

.sk-img {
  height: 140px;
}

.sk-line {
  height: 14px;
}

.sk-line.short {
  width: 60%;
}

.sk-btn {
  height: 36px;
  margin-top: auto;
}


/*mobileeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee*/
/* =========================================================
   MOBILE FIX – CHỈ DÀNH CHO <= 768px
   COPY NGUYÊN KHỐI – KHÔNG CHỈNH
========================================================= */
@media (max-width: 768px) {

  /* ===== TẮT GRID DESKTOP ===== */
  .layout {
    display: block !important;
  }

  .layout.hide-left,
  .layout.hide-right,
  .layout.hide-left.hide-right {
    grid-template-columns: none !important;
  }

  /* ===== MAIN FULL WIDTH ===== */
  .main {
    width: 100% !important;
    max-width: 100% !important;
    padding-bottom: 90px; /* chừa chỗ bottom bar */
     padding-top: 0;
     
  }
    .pagination {
    margin-bottom: calc(40px + env(safe-area-inset-bottom));
  }
 .banner {
  width: 100%;                /* hoặc 100% tuỳ mày */
  aspect-ratio: 16 / 9;
  margin: 0 auto 12px;

  border-radius: 20px;
  overflow: hidden;

  box-shadow: 0 0 24px rgba(168, 250, 168, 0.45);

}

/* 🔥 DÒNG QUAN TRỌNG NHẤT */
.banner img {
  width: 100%;
  height: 100%;
  display: block;
  
  object-fit: cover;        /* ❗ fill kín, không chừa trống */
  object-position: center;
}

  /* =====================================================
     SIDEBAR LEFT – DANH MỤC / LIÊN HỆ (TỪ PHẢI)
  ===================================================== */
  .sidebar-left {
    position: fixed !important;
    top: 0;
    right: 0;
    bottom: 0;

    width: 85%;
    max-width: 320px;

    transform: translateX(100%);
    transition: transform 0.3s ease;

    z-index: 1000;
  }
.mh-time {
  margin-left: auto;       /* 🔥 đẩy badge về bên phải */
  transform: scale(0.9);
  flex-shrink: 0;
}
  .sidebar-left:not(.collapsed) {
    transform: translateX(0);
  }
 .scroll-top-fab {
    bottom: 96px; /* né bottom bar */
  }
  /* =====================================================
     SIDEBAR RIGHT – GIỎ HÀNG (FULL MÀN – TỪ TRÁI)
  ===================================================== */
/* =====================================================
   SIDEBAR RIGHT – GIỎ HÀNG (FULL MÀN – TỪ PHẢI → TRÁI)
===================================================== */
.sidebar-right {
  position: fixed !important;
  top: 0;
  right: 0;          /* 👈 neo bên phải */
  left: auto;        /* 👈 bỏ left */
  bottom: 0;

  width: 100vw;
  max-width: 100vw;

  transform: translateX(100%); /* 👈 nằm ngoài bên phải */
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  z-index: 1000;
}

.sidebar-right:not(.collapsed) {
  transform: translateX(0); /* 👈 trượt vào từ phải */
}


  /* ===== MOBILE KHÔNG DÙNG display:none ===== */
  .sidebar-left.collapsed .sidebar-content,
  .sidebar-right.collapsed .sidebar-content {
    display: block;
  }

  /* ===== MENU GRID 2x2 ===== */
  .menu {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px;
  }

  /* ===== BOTTOM BAR ===== */
  .mobile-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: 70px;
    background: #ffffff;

    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;

    border-top: 2px solid #22c55e;
    z-index: 1100;
  }

  .mobile-bottom-bar button {
    background: none;
    border: none;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    font-size: 18px;
    font-weight: 800;
    color: #16a34a;
  }

  .mobile-bottom-bar span {
    font-size: 11px;
    margin-top: 2px;
  }
  /* giới hạn chiều cao modal */
.detail-back {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;

  background: rgb(255, 255, 255);
  color: #13a100;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  cursor: pointer;
}

.detail-back:active {
  transform: scale(0.9);
}

  .modal-card {
    max-height: 80vh;        /* 👈 modal không cao quá */
    display: flex;
    flex-direction: column;
  }

  /* tiêu đề modal đứng yên */
  .modal-card .export-title {
    flex-shrink: 0;
  }

  /* KHUNG DANH MỤC SCROLL RIÊNG */
  .modal-card .categories {
    flex: 1;                /* chiếm phần còn lại */
    overflow-y: auto;       /* 👈 scroll ở đây */
    min-height: 0;          /* 🔥 FIX flex scroll bug */

    padding: 12px;
    margin-top: 8px;

    border-radius: 14px;
    background: #f9fafb;
  }
  
 /* header modal */
  .modal-card .export-title {
    background: linear-gradient(
      135deg,
      #22c55e,
      #16a34a
    );

    color: #ffffff;
    font-weight: 900;

    padding: 14px 16px;
    margin: -14px -14px 10px -14px; /* ăn sát viền modal */

    border-top-left-radius: 16px;
    border-top-right-radius: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
  }

  /* nút đóng (X) nổi trên nền xanh */
  .modal-card .modal-close {
    top: 10px;
    right: 10px;

    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;

    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }

  .modal-card .modal-close:hover {
    background: rgba(255, 255, 255, 0.4);
  }
   /* === HEADER (TIÊU ĐỀ) === */
  .modal-card .export-title {
    background: #ffffff;
    color: #16a34a; /* xanh lá */

    font-weight: 900;
    padding: 14px 16px;

    margin: -14px -14px 0 -14px; /* ăn sát viền trên */
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-bottom: 2px solid #22c55e;
  }

  /* nút đóng (X) */
  .modal-card .modal-close {
    background: #16a34a;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }

  /* === PHẦN CONTENT (NỀN XANH) === */
  .modal-card .shop-contact {
    background: linear-gradient(
      135deg,
      #22c55e,
      #16a34a
    );

    padding: 16px 12px;
    margin: 0 -14px -14px -14px; /* ăn sát viền modal */

    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }

  /* từng item liên hệ */
  .modal-card .shop-contact .contact-item {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    padding: 10px 12px;
    margin-bottom: 10px;

    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* text */
  .modal-card .shop-contact .contact-name {
    color: #fef08a; /* vàng nhạt nổi */
    font-weight: 900;
  }

  .modal-card .shop-contact .contact-desc {
    color: rgba(255,255,255,0.9);
    font-size: 12px;
    font-style: italic;
  }
  .modal-card .shop-contact .contact-item {
  animation: pulse 1.2s ease infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
/* ===== MOBILE MODAL ANIMATION ===== */
.mobile-modal-enter-from {
  opacity: 0;
}
.mobile-modal-enter-to {
  opacity: 1;
}
.mobile-modal-leave-from {
  opacity: 1;
}
.mobile-modal-leave-to {
  opacity: 0;
}
.mobile-modal-enter-active,
.mobile-modal-leave-active {
  transition: opacity 0.25s ease;
}

/* CARD */
.mobile-modal-enter-from .modal-card {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}
.mobile-modal-enter-to .modal-card {
  transform: translateY(0) scale(1);
  opacity: 1;
}
.mobile-modal-leave-from .modal-card {
  transform: translateY(0) scale(1);
  opacity: 1;
}
.mobile-modal-leave-to .modal-card {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}
.mobile-modal-enter-active .modal-card,
.mobile-modal-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
/* ===== CART ICON ===== */
.cart-icon-wrap {
  position: relative;
  font-size: 22px;
}

/* BADGE */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;

  min-width: 18px;
  height: 18px;
  padding: 0 5px;

  background: #ef4444;
  color: #ffffff;

  font-size: 11px;
  font-weight: 900;

  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

/* BUMP ANIMATION */
.cart-badge.bump {
  animation: cart-bump 0.3s ease;
}

@keyframes cart-bump {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.back-btn {
  margin-top: 8px;
  width: 100%;
  padding: 11px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  border-radius: 14px;
  border: 2px solid #22c55e;

  background: #ffffff;
  color: #16a34a;

  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.3px;

  cursor: pointer;

  transition: all 0.2s ease;
}

/* hover */
.back-btn:hover {
  background: #ecfdf5;
}
.detail-title{
  font-weight: bold;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
}
/* active */
.back-btn:active {
  transform: scale(0.97);
}
/* ================= FIX NÚT X MODAL MOBILE ================= */

/* Header chỉ là nền – không che X */
.modal-card .export-title {
  position: relative;
  z-index: 1;
}

/* Ép nút X luôn nổi */
.modal-card .modal-close {
  position: absolute;
  top: 10px;
  right: 10px;

  z-index: 9999; /* 🔥 QUAN TRỌNG */

  width: 28px;
  height: 28px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #16a34a;
  color: #ffffff;

  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.detail-image-wrap {
  position: relative;
  padding-bottom: 12px;
}

.detail-image-wrap::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 0;

  height: 3px;
  border-radius: 999px;

  background: linear-gradient(
    90deg,
    transparent,
    #22c55e,
    #16a34a,
    #22c55e,
    transparent
  );
}

/* ================= MOBILE BOTTOM BAR – FINAL VIP ================= */

.mobile-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  height: 70px;
  background: #ffffff;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;

  border-top: 2px solid #22c55e;
  z-index: 1100;
}

.mobile-bottom-bar button {
  position: relative;
  background: transparent;
  border: none;
  height: 100%;
}

/* ===== NỀN TRÒN ACTIVE (KHÔNG SCALE) ===== */
.mobile-bottom-bar button::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 999px;

  background: linear-gradient(135deg, #22c55e, #16a34a);

  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.mobile-bottom-bar button.active::before {
  opacity: 1;
}

/* ===== KHUNG GIỮ SIZE ===== */
.mobile-bottom-bar .btn-inner {
  position: relative;
  z-index: 1;

  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== SCALE CHỈ ICON + TEXT ===== */
.mobile-bottom-bar .btn-scale {
  display: flex;
  flex-direction: column;
  align-items: center;

  transition: transform 0.25s ease;
}

.mobile-bottom-bar button.active .btn-scale {
  transform: scale(1.18);
}

/* ICON */
.mobile-bottom-bar button i {
  font-size: 22px;
  color: #16a34a;
  transition: color 0.25s ease;
  animation: icon-wiggle 3.5s ease-in-out infinite;
  transform-origin: center;
}
@keyframes icon-wiggle {
  0%, 90%, 100% {
    transform: rotate(0deg);
  }
  92% {
    transform: rotate(-4deg);
  }
  96% {
    transform: rotate(4deg);
  }
}
.mobile-bottom-bar button.active i {
  animation: icon-wiggle-active 1.2s ease-in-out infinite;
}

@keyframes icon-wiggle-active {
  0%   { transform: rotate(0deg) scale(1); }
  25%  { transform: rotate(-8deg) scale(1.05); }
  50%  { transform: rotate(8deg) scale(1.05); }
  75%  { transform: rotate(-6deg) scale(1.03); }
  100% { transform: rotate(0deg) scale(1); }
}
/* LABEL */
.mobile-bottom-bar .btn-label {
  font-size: 11px;
  margin-top: 2px;
  color: #16a34a;
  transition: color 0.25s ease;
  font-weight: bold;
}

/* ACTIVE → ICON + TEXT TRẮNG */
.mobile-bottom-bar button.active i,
.mobile-bottom-bar button.active .btn-label {
  color: #ffffff;
}

/* PRESS FEEDBACK */
.mobile-bottom-bar button:active .btn-scale {
  transform: scale(1.08);
}

/* ===== CART ICON + BADGE ===== */
.mobile-bottom-bar .cart-icon-wrap {
  position: relative;
}

.mobile-bottom-bar .cart-icon-wrap i {
  color: inherit;
}

/* BADGE */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;

  min-width: 18px;
  height: 18px;
  padding: 0 5px;

  background: #ef4444;
  color: #ffffff;

  font-size: 11px;
  font-weight: 900;

  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

/* BUMP */
.cart-badge.bump {
  animation: cart-bump 0.3s ease;
}

@keyframes cart-bump {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
  /* ===== MODAL CHI TIẾT MOBILE – NHỎ LẠI ===== */
.modal-card.modal-wide {
  width: 620px;
  max-width: 92%;
  border-radius: 16px;
}


.modal-left {
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.modal-left .modal-img {
  width: 100%;
  height: auto;
  max-height: 340px;
  min-height: unset;
  object-fit: contain;
}
 .detail-sidebar {
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: 2000;
    display: flex;
    flex-direction: column;
  }

  .detail-header {
    height: 56px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 14px;
  }

  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .detail-img {
    width: 100%;
    max-height: 320px;
    object-fit: contain;
  }
   .detail-slide-enter-from {
    transform: translateX(-100%);
  }
  .detail-slide-enter-to {
    transform: translateX(0);
  }
  .detail-slide-leave-from {
    transform: translateX(0);
  }
  .detail-slide-leave-to {
    transform: translateX(-100%);
  }

  .detail-slide-enter-active,
  .detail-slide-leave-active {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
   .filter-bar {
    flex-wrap: nowrap !important;     /* 🔥 KHÔNG CHO XUỐNG DÒNG */
    justify-content: space-between;   /* hoặc center */
    gap: 8px;
    overflow-x: auto;                 /* 🔥 phòng màn siêu nhỏ */
    -webkit-overflow-scrolling: touch;
  }

  /* Ẩn scrollbar ngang cho đẹp */
  .filter-bar::-webkit-scrollbar {
    display: none;
  }
  .filter-bar {
    scrollbar-width: none;
  }

  /* Nút filter co lại chút */
  .filter-btn {
    white-space: nowrap;              /* 🔥 KHÔNG XUỐNG DÒNG CHỮ */
    padding: 6px 10px;
    font-size: 12px;
    flex-shrink: 0;                   /* 🔥 không bị ép */
  }

  /* Nút cờ */
  .filter-btn.lang-filter {
    width: 36px;
    height: 36px;
    padding: 0;
    flex-shrink: 0;
  }
  /* ===== ĐÓNG MƯỢT DETAIL SIDEBAR ===== */
.detail-sidebar {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
}

.detail-sidebar .add-btn.closing {
  transform: scale(0.96);
  opacity: 0.85;
}

/* khi đóng */
.detail-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* ===== MOBILE HEADER – CLEAN VERSION ===== */
.mobile-header-clean {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0 !important;
  height: 52px;
  padding: 0 14px;
  margin-bottom: 10px;

  background: linear-gradient(
    135deg,
    #16a34a,
    #22c55e
  );

  border-radius: 14px;

  box-shadow:
    0 4px 14px rgba(22, 163, 74, 0.35);
}

/* LOGO – GỌN */
.mh-logo {
  width: 34px;
  height: 34px;

  border-radius: 8px;
  background: #ffffff;
  padding: 2px;

  object-fit: contain;
}

/* TÊN SHOP – APP STYLE */
.mh-name {
  font-size: 15px;
  font-weight: 800;

  color: #fef9c3; /* vàng nhạt, sang */
  letter-spacing: 0.2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 768px) {

  /* ===== FIX HEADER MOBILE FULL WIDTH ===== */
  .mobile-header-clean {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);

    height: 52px;
    padding: 14px;

    background: linear-gradient(135deg, #16a34a, #22c55e);

    border-radius: 0;            /* ❌ bỏ bo góc */
    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);

    display: flex;
    align-items: center;
    gap: 10px;
  }
  .image-modal-card {
    max-width: 92vw;
    max-height: 70vh; /* 👈 mobile thấp hơn để dễ đóng */
    padding: 8px;
  }
}

}
/* =========================
   FIX MODAL DANH MỤC MOBILE
========================= */

@media (max-width: 360px) {
  .menu { gap: 6px; }
  .mobile-bottom-bar { height: 60px; }

  .btn-label { font-size: 10px; }
  .mobile-bottom-bar i { font-size: 20px; }

  .sidebar-left { width: 92%; }
}
@media (min-width: 361px) and (max-width: 430px) {
  .menu { gap: 8px; }
  .mobile-bottom-bar { height: 66px; }

  .btn-label { font-size: 11px; }
  .mobile-bottom-bar i { font-size: 21px; }
}
@media (min-width: 431px) and (max-width: 480px) {
  .menu { gap: 10px; }
  .mobile-bottom-bar { height: 70px; }

  .mobile-bottom-bar i { font-size: 22px; }
}
@media (min-width: 481px) and (max-width: 600px) {
  .menu {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .sidebar-left { width: 75%; }
}
@media (min-width: 600px) and (max-width: 900px) and (min-aspect-ratio: 3/4) {
  .menu {
    grid-template-columns: repeat(3, 1fr);
  }

  .mobile-bottom-bar {
    height: 72px;
  }
}
@media (min-width: 768px) and (max-width: 1024px) {
  /* TẮT MOBILE BAR */
  .mobile-bottom-bar { display: none; }

  .layout {
    display: grid;
    grid-template-columns: 260px 1fr;
  }

  .menu {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .sidebar-left,
  .sidebar-right {
    position: relative !important;
    transform: none !important;
  }
}
@media (min-width: 1025px) and (max-width: 1280px) {
  .menu {
    grid-template-columns: repeat(4, 1fr);
  }

  .sidebar-left { width: 260px; }
  .sidebar-right { width: 360px; }
}

.lang-modal {
  width: 320px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}
.lang-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.lang-title {
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
}
.lang-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}
.lang-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: rotate(90deg);
}
.lang-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lang-item {
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 12px 16px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.6);

  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;

  font-size: 15px;
  font-weight: 800;
  cursor: pointer;

  transition: all 0.2s ease;
}

.lang-flag {
  width: 26px;
  height: 18px;
  border-radius: 4px;
  object-fit: cover;
}

.lang-label {
  color: #ffffff;
  line-height: 1;
}
.lang-item:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(1.03);
  font-weight: bold;
}
.flag {
  font-size: 20px;
}

.lang-switch-btn {
  margin: 8px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  padding: 8px 14px;
  border-radius: 999px;
  border: 2px solid #22c55e;

  background: #ffffff;
  color: #065f46;

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;
  box-shadow: 0 4px 10px rgba(22,163,74,0.35);
  transition: all 0.2s ease;
}

.lang-switch-btn:hover {
  background: #ecfdf5;
  transform: scale(1.05);
}

.lang-switch-btn:active {
  transform: scale(0.95);
}
.flag-img {
  width: 24px;
  height: 18px;
  border-radius: 4px;
  object-fit: cover;
}
.lang-flag-only {
  font-size: 22px;
  line-height: 1;

  font-family:
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji",
    system-ui,
    sans-serif;
}
.lang-flag-img-only {
  width: 26px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
}
/* ===== FILTER + LANGUAGE ROW ===== */
.filter-lang-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: nowrap;
}

/* FILTER BAR giữ nguyên */
.filter-lang-row .filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

/* NÚT CỜ */
.lang-switch-btn.lang-only {
  width: 40px;
  height: 40px;

  padding: 0;
  border-radius: 50%;
  border: 2px solid #22c55e;
  background: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 4px 10px rgba(22,163,74,0.35);
}

.lang-switch-btn.lang-only:hover {
  background: #ecfdf5;
  transform: scale(1.08);
}

.lang-switch-btn.lang-only:active {
  transform: scale(0.95);
}
.lang-loading {
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 20px;
  z-index: 5;
}

.spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  animation: spin 0.9s linear infinite;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.card-border {
  --angle: 0deg;

  position: relative;
  padding: 2.5px;            /* viền dày hơn chút */
  border-radius: 16px;
filter: saturate(1.15);
  background: conic-gradient(
    from var(--angle),
    transparent 0deg,
    #22c55e 70deg,
    #fef08a 140deg,
    #22c55e 210deg,
    #16a34a 280deg,
    transparent 360deg
  );

  animation: border-spin 1.6s linear infinite; /* 🚀 nhanh hơn */
  
  /* glow mạnh hơn */

}

/* card bên trong */
.card-border > .card {
  background: #ffffff;
  border-radius: 14px;
  height: 100%;
}

/* chỉ xoay gradient */
@keyframes border-spin {
  to {
    --angle: 360deg;
  }
}
.page-dots{
  color:#fff;
  font-weight:900;
  padding:0 6px;
  opacity:.8;
  user-select:none;
}
/* ===== IMAGE MODAL ===== */
.image-modal {
  z-index: 3000; /* cao hơn modal chi tiết */
}

.image-modal-card {
  max-width: 92vw;
  max-height: 92vh;

  background: #1b5302;
  border-radius: 16px;
  padding: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.image-preview {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
}

/* con trỏ cho ảnh */
.clickable {
  cursor: zoom-in;
}
.logo-time.badge-online {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  margin-top: 8px;
  padding: 4px 12px;

  font-size: 12px;
  font-weight: 800;

  /* 🌟 VÀNG NGẢ XANH – KHỚP NỀN */
  background: linear-gradient(
    180deg,
    #FFF9CC 0%,
    #FFE066 50%,
    #FACC15 100%
  );

  color: #0f5132; /* xanh cùng hệ với nền */

  border-radius: 999px;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.7),
    0 1px 3px rgba(0,0,0,0.18);

  white-space: nowrap;
}

.dot-online {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 0 2px rgba(34,197,94,0.25);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34,197,94,0.85);
  }

  30% {
    box-shadow: 0 0 0 4px rgba(34,197,94,0.55);
  }

  55% {
    box-shadow: 0 0 0 6px rgba(34,197,94,0.25);
  }

  75% {
    box-shadow: 0 0 0 4px rgba(34,197,94,0.15);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(34,197,94,0);
  }
}


.dot-online {
  animation: pulse 1.8s infinite;
}
.logo-time {
  transform: scale(0.95);
}
@media (max-width: 360px) {
  .mh-time {
    font-size: 11px;
    padding: 3px 10px;
  }
}
/* ===== MODAL EDIT QTY ===== */
.qty-modal {
  width: 320px;
  max-width: 90%;
  padding: 18px;
  text-align: center;
}

.qty-title {
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 14px;
  color: #065f46;
}

.save-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px 0;

  border: none;
  border-radius: 12px;

  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.save-btn:active {
  transform: scale(0.96);
}
.cart-inline-editor {
  margin: 8px 6px 12px;
  padding: 12px;

  border-radius: 14px;
  background: #ecfdf5;
  border: 2px solid #22c55e;

  box-shadow: 0 6px 18px rgba(22,163,74,0.25);
  animation: slideDown 0.25s ease;
}

.inline-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.inline-actions button {
  flex: 1;
}

.cancel-btn {
  border: 2px solid #22c55e;
  background: #ffffff;
  color: #16a34a;
  font-weight: 800;
  border-radius: 12px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.cart-row {
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

/* hover */
.cart-row:hover {
  background: rgba(34, 197, 94, 0.08);
}

/* item đang được click / đang mở modal */
.cart-row.active {
  background: #ecfdf5;
  box-shadow: inset 0 0 0 2px #22c55e;
}

/* nếu vừa add vào giỏ */
.cart-row.highlight {
  animation: flash 0.6s ease;
}

@keyframes flash {
  0% {
    background: #bbf7d0;
  }
  100% {
    background: transparent;
  }
}
.qty-dvt {
  margin-left: 8px;
  font-weight: 700;
  color: #16a34a;
  white-space: nowrap;
}
.modal-qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.modal-overlay.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* chỉ 1 số, không đụng modal khác */
}

.image-modal-card {
  max-width: min(800px, 90vw);   /* 👈 desktop không quá to */
  max-height: min(600px, 85vh);  /* 👈 không chiếm hết chiều cao */
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}


.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 👈 giữ tỉ lệ, không crop */
  border-radius: 8px;
}

.ck-btn{
  width: 100%;
  margin-top: 10px;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #16a34a;
  color: #fff;
}
.ck-btn:disabled{
  opacity: .5;
}

.ck-modal{
  width: min(980px, 94vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* set chiều cao 1 card để tính đúng 2 hàng */
  --ck-row-h: 300px;   /* chỉnh 280–320 tuỳ card của mày */
}




.ck-title{
  font-weight: 900;
  font-size: 15px;
  margin-bottom: 6px;
}

.ck-info{
  white-space: pre-line;
  font-size: 14px;
  line-height: 1.45;
  font-weight: bold;
 
}

.ck-qr{
  width: 100%;
  max-width: 260px;
  margin: 12px auto 0;
  display: block;
  border-radius: 14px;
}

.ck-shop{
  margin-top: 10px;
  font-weight: 700;
  opacity: .8;
  text-align: center;
}

.ck-empty{
  padding: 14px;
  border-radius: 14px;
  background: #fff7ed;
  border: 1px solid rgba(0,0,0,.08);
}
/* ===== THEME CK (tone xanh giống template) ===== */
.ck-modal {
  border-radius: 18px;
  border: 1px solid rgba(22, 163, 74, 0.25);
  box-shadow: 0 18px 40px rgba(2, 44, 15, 0.18);
  background: linear-gradient(180deg, #f0fff5 0%, #ffffff 55%);
}

/* title trên modal */
.ck-modal .export-title{
  color:#0f7a2a;
  font-weight:900;
  flex: 0 0 auto;
}
.ck-modal .export-title i{
  color:#16a34a;
  margin-right:6px;
}

/* ===== GRID 2x2 khi có nhiều card ===== */
.ck-list{
  flex: 1 1 auto;
  overflow-y: auto;          /* ✅ scroll trong modal */
  padding-right: 6px;        /* chừa chỗ scrollbar */
  margin-top: 12px;

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* ✅ 3 cột */
  gap: 12px;

  /* ✅ giới hạn để nhìn giống "2 hàng" rồi mới scroll */
  max-height: 62vh;          /* tuỳ máy sẽ ra ~2 hàng */
}

/* Mobile: 1 cột cho dễ đọc */
@media (max-width: 560px){
  .ck-list{
    grid-template-columns: 1fr;
  }
}



/* viền nhấn xanh bên trái giống template */
.ck-card::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:5px;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  border-top-left-radius:18px;
  border-bottom-left-radius:18px;
}

/* (1) pill góc phải */
.ck-title{
  position:absolute;
  top:10px;
  right:12px;

  font-size:12px;
  font-weight:900;
  letter-spacing:.3px;
box-shadow: 0 4px 10px rgba(239, 243, 16, 0.45);
 background: linear-gradient(
    180deg,
    #FFF9CC 0%,
    #FFE066 50%,
    #FACC15 100%
  );

  color: #0f5132; /* xanh cùng hệ với nền */
  border:1px solid rgba(22,163,74,.25);

  padding:5px 10px;
  border-radius:999px;

  max-width:70%;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}


/* (2) NCC giữa trên */



/* (3) QR giữa */
.ck-qr-wrap{
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 12px 0;
  margin: 6px 0;

  /* khung đỡ – KHÔNG scale */
  background: transparent;
}

.ck-qr{
  width: min(220px, 70vw);   /* 🔥 co theo màn hình */
  aspect-ratio: 1 / 1;      /* 🔥 giữ QR vuông */

  height: auto;

  border-radius: 16px;
  background: #ffffff;

  /* viền + chiều sâu GỌN */
  border: 1.5px solid rgba(22,163,74,0.35);
  outline: 6px solid rgb(6, 207, 80);

  box-shadow:
    0 8px 18px rgba(16, 243, 99, 0.28);

  transition: transform 0.2s ease;
}
.ck-qr:hover{
  transform: scale(1.04);   /* 👈 scale QR, KHÔNG scale wrapper */
}

/* (4) Thông tin */
.ck-info{
  margin-top: auto;

  font-size: 13px;
  line-height: 1.45;

  color: #065f46;

  background: #f6fffa;
  border: 1px dashed rgba(22,163,74,.35);
  border-radius: 14px;

  padding: 10px 12px;
  white-space: pre-line;
}
.ck-card{
  position: relative;
  border-radius: 20px;
  padding: 16px 14px 14px;

  /* 🎨 NỀN GRADIENT THEME */
  background: linear-gradient(
    180deg,
    #000428 0%,
    #004e92 100%
  );

  /* viền sáng nhẹ để tách nền */
  border: 1px solid rgba(255,255,255,0.18);

  /* chiều sâu – KHÔNG blur to */
  box-shadow:
    0 14px 30px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.12);

  display: flex;
  flex-direction: column;
  gap: 8px;

  overflow: hidden;
}


.ck-info{
  margin-top:auto; /* kéo info xuống dưới, QR ở giữa nhìn gọn */
}
@media (max-width: 980px){
  .ck-list{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px){
  .ck-list{ grid-template-columns: 1fr; max-height: 70vh; }
}

/* optional: scrollbar nhìn gọn (chrome) */
.ck-list::-webkit-scrollbar{ width: 8px; }
.ck-list::-webkit-scrollbar-thumb{
  background: rgba(22,163,74,0.35);
  border-radius: 999px;
}
.ck-list::-webkit-scrollbar-track{ background: transparent; }
/* ===== HÀNG NÚT CK + KHUYẾN MÃI ===== */
.cart-ck-km-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

/* NÚT CK VÀNG KIM - GIỐNG ẢNH */
.ck-btn-inline{
  flex-shrink: 0;
  width: auto;

  border: none;
  border-radius: 999px;
  padding: 6px 14px 6px 10px;

  font-weight: bold;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  

  display: inline-flex;
  align-items: center;
  gap: 6px;

  /* 🎨 MÀU Y CHANG BADGE 7H–21H */
  background: linear-gradient(
    180deg,
    #FFF9CC 0%,
    #FFE066 50%,
    #FACC15 100%
  );

  color: #0f5132; /* xanh cùng hệ với nền */
  border: solid 0.5px rgb(176, 214, 4);
  box-shadow: 0 4px 10px rgba(239, 243, 16, 0.45);
  cursor: pointer;
  transition: all 0.18s ease;
}
.ck-btn-inline i {
  font-size: 15px;
}

.ck-btn-inline:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(22,163,74,0.5);
}

.ck-btn-inline:active {
  transform: scale(0.96);
}

.ck-btn-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* KHUYẾN MÃI BÊN PHẢI */
.km-inline {
  flex: 1;
  margin: 0;
  text-align: right;
}
.ck-amount{
  margin: 6px auto 4px;
  padding: 8px 18px;

  display: inline-block;
  text-align: center;

  font-size: 15px;
  font-weight: 900;
  letter-spacing: .3px;

  color: #ffffff; /* chữ trắng */

  /* 🌿 NỀN XANH VIP */
  background: linear-gradient(
    135deg,
    #22c55e,
    #16a34a
  );

  border-radius: 999px;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.25),
    0 6px 16px rgba(22,163,74,0.55);

  white-space: nowrap;
}


.ck-note{
  display: block;
  margin-top: 4px;

  font-size: 11.5px;
  font-weight: 700;

  color: #ecfdf5; /* trắng ngả xanh */
  opacity: .9;
}
.categories .cat{
  position: relative;
  padding-left: 28px; /* 👈 chừa chỗ cho dot */
}

/* DOT */
.categories .cat::before{
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);

  width: 6px;
  height: 6px;
  border-radius: 50%;

  background: #16a34a; /* xanh cùng hệ */
  opacity: 0.9;
}
.categories .cat.active::before{
  width: 8px;
  height: 8px;

  background: #ffffff;
  box-shadow:
    0 0 0 3px rgba(34,197,94,0.35);
}
.categories .cat::before{
  width: 4px;
  height: 16px;
  border-radius: 4px;
}
/* ===== NCC NAME + LOGO (HÀNG NGANG CHUẨN) ===== */
.ck-ncc-wrap{
  margin-top: 34px;                 /* chừa pill phía trên */
  display: inline-flex;
  align-items: center;              /* 🔥 căn logo + chữ cùng trục */
  justify-content: center;
  gap: 8px;

  width: 100%;
  text-align: center;
}

/* LOGO NHỎ BÊN TRÁI */
.ck-ncc-logo{
  width: 30px;
  height: 30px;
  object-fit: contain;

  flex-shrink: 0;                   /* 🔥 không méo khi zoom */

  border-radius: 30%;
  
  padding: 2px;

  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  
  /* tinh chỉnh trục chữ in hoa */
  transform: translateY(1px);
}

/* TÊN NHÀ CUNG CẤP */
.ck-ncc{
  margin: 0;                        /* 🔥 tránh lệch ngầm */
  font-size: 16px;
  font-weight: 900;

  color: #07fc1b;                   /* xanh light trên nền tối */

  line-height: 1;                   /* 🔥 thẳng hàng logo */
  white-space: nowrap;              /* không xuống dòng */
}

/* ===== TẮT XOAY VIỀN KHI HẾT HÀNG ===== */
.card-border.out{
  animation: none !important;     /* ❌ tắt xoay */
  background: #124592;            /* xám nền viền */
  filter: grayscale(1);
}
.card-img-wrap {
  position: relative;
}

/* TAG % */
.discount-tag {
  position: absolute;
  top: 0;
  right: 0;

  width: 0;
  height: 0;

  border-top: 70px solid #dc2626;
  border-left: 70px solid transparent;

  z-index: 3;
}

/* TEXT % TRONG TAM GIÁC */
.discount-tag span {
  position: absolute;
  top: -55px;
  right: 5px;

  transform: rotate(45deg);

  color: #fff;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;

  text-shadow:
    0 1px 2px rgba(0,0,0,0.35),
    0 0 6px rgba(255,255,255,0.35);
}

/* GIÁ */
.price-discount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-old {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
}
.modal-price.price-discount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-price .price-old {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}
/* ===== SALE CATEGORY – SIMPLE ===== */
.cat.sale {
  background: #dc2626;
  color: #ffffff;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 999px;
  padding: 6px 14px;
  line-height: 1;

  /* ✨ ánh đèn chữ */
  text-shadow:
    0 0 2px rgba(255,255,255,0.6),
    0 0 6px rgba(255,255,255,0.35);
}



.cat.sale:hover {
  background: #b91c1c;
}

.cat.sale.active {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}
/* ===== SALE BADGE (MOBILE CATEGORY) ===== */
.category-btn-wrap {
  position: relative;
}

.sale-badge {
  position: absolute;
  top: -4px;
  right: -6px;

  background: #dc2626;
  color: #fff;

  font-size: 8px;        /* 👈 nhỏ nữa */
  font-weight: 700;

  padding: 1px 4px;      /* 👈 rất gọn */
  border-radius: 999px;

  line-height: 1;
  letter-spacing: 0.2px;

  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}


</style>