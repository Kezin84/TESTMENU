<template>
  
  <div class="page" @scroll.passive="handleScroll">
<h1 style="color: rgb(134, 239, 172); text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);font-weight: bold;"><i class="ri-archive-fill"></i> KHO HÀNG</h1>
   <!-- ===== MOBILE STICKY SEARCH ===== -->
<div v-if="isMobile" class="mobile-sticky-search">
  <div class="mobile-sticky-search-inner">
    <div class="search-container">
      <div class="search-icon"><i class="ri-search-line" ></i></div>
      <input
        v-model="keyword"
        placeholder="Tìm kiếm tên hàng"
        class="search-input"
        @input="handleSearch"
      />
      <button v-if="keyword" @click="clearSearch" class="search-clear">✕</button>
    </div>
  </div>
</div>


    <!-- ===== FILTER SECTION ===== -->
    <section class="filter-section">

      <div class="search-container">
        <div class="search-icon"><i class="ri-search-line"></i></div>
        <input
          v-model="keyword"
          placeholder="Tìm kiếm theo mã hàng hoặc tên sản phẩm..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="keyword" @click="clearSearch" class="search-clear">✕</button>
      </div>
      
  <!-- ===== 6 BUTTONS GRID: 3 x 2 ===== -->
<div class="action-grid-6">
  <!-- 1) Danh mục -->
  <button
    class="btn-filter"
    :class="{ active: showCategoryFilter }"
    @click="showCategoryFilter = !showCategoryFilter"
  >
    <span class="btn-icon"><i class="ri-list-check"></i></span>
    <span class="btn-text">Danh mục</span>
    <span v-if="selectedCategory" class="filter-badge">1</span>
  </button>

  <!-- 2) Khuyến mãi -->
  <button
    class="btn-filter"
    :class="{ active: filterPromotion }"
    @click="togglePromotionFilter"
  >
    <span class="btn-icon"><i class="ri-price-tag-3-fill"></i></span>
    <span class="btn-text">Khuyến mãi</span>
  </button>

  <!-- 3) Trạng thái -->
  <button
    class="btn-filter"
    :class="{ active: filterStatus !== 'all' }"
    @click="cycleStatusFilter"
  >
 <span class="btn-icon">
  <i
    v-if="filterStatus === 'available'"
    class="ri-verified-badge-fill"
  ></i>

  <span v-else-if="filterStatus === 'out'"><i class="ri-close-circle-fill"></i></span>

  <span v-else><i class="ri-box-3-fill"></i></span>
</span>

    <span class="btn-text">{{ getStatusLabel() }}</span>
  </button>

  <!-- 4) Export: Tên : Giá -->
  <button class="btn-export" @click="exportText">
    
    <span class="btn-text">Xuất Tên : Giá</span>
  </button>

  <!-- 5) Export: Tên hàng -->
  <button class="btn-export" @click="exportTen">
    
    <span class="btn-text">Xuất Tên hàng</span>
  </button>

  <!-- 6) Export: Giá bán -->
  <button class="btn-export" @click="exportGia">
    
    <span class="btn-text">Xuất Giá bán</span>
  </button>
</div>

<!-- Category dropdown (GIỮ NGUYÊN) -->
<transition name="slide-down">
  <div v-if="showCategoryFilter" class="category-dropdown">
    <div class="category-grid">
     <button
  class="category-item"
  :class="{ active: !selectedCategory }"
  @click="
    selectedCategory = '';
    showCategoryFilter = false;
    currentPage = 1;
  "
>

        <span class="category-name">Tất cả</span>
        <span class="category-count">{{ list.length }}</span>
      </button>

  <button
  v-for="cat in categories"
  :key="cat.name"
  class="category-item"
  :class="{ active: selectedCategory === cat.name }"
  @click="
    selectedCategory = cat.name;
    showCategoryFilter = false;
    currentPage = 1;
  "
>

        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }}</span>
      </button>
    </div>
  </div>
</transition>

<!-- Xóa bộ lọc để riêng (không tính vào 6 nút) -->
<div class="clear-filter-row">
  <button
    v-if="hasActiveFilters"
    class="btn-clear-filters"
    @click="clearAllFilters"
  >
    <span class="btn-icon"><i class="ri-refresh-fill"></i></span>
    <span class="btn-text">Xóa bộ lọc</span>
  </button>
</div>

    </section>

    <!-- ===== DESKTOP TABLE ===== -->
    <section class="content-section desktop-view">
       <div v-if="tableLoading" class="table-loading-container">
    <div class="table-loading">
      <div class="table-loading-spinner"></div>
      <div class="table-loading-text">Đang tải dữ liệu...</div>
    </div>
  </div>
   <template v-else>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px" class="text-center">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                />
              </th>
              <th style="width: 60px" class="text-center">STT</th>
              <th style="width: 80px" class="text-center">Ảnh</th>
              <th style="width: 120px" class="text-center">Mã hàng</th>
              <th style="width: 200px" class="text-center">Tên sản phẩm</th>
              <th style="width: 120px" class="text-center">Danh mục</th>
              <th style="width: 80px" class="text-center">Size</th>
              <th style="width: 70px" class="text-center">ĐVT</th>
              <th style="width: 100px" class="text-center">Giá gốc</th>
              <th style="width: 100px" class="text-center">Giá bán</th>
              <th style="width: 100px" class="text-center">Giá giảm</th>
              <th style="width: 80px" class="text-center">Tiền tệ</th>
              <th style="width: 70px" class="text-center">Lang</th>
              <th style="width: 120px" class="text-center">Trạng thái</th>
              <th style="width: 150px" class="text-center">Mô tả</th>
              <th style="width: 120px" class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in paginatedData"
              :key="item.Ma_hang"
              class="table-row"
              @click="openEdit(item)"
            >
              <td @click.stop class="text-center">
                <input
                  type="checkbox"
                  v-model="selected"
                  :value="item.Ma_hang"
                  class="checkbox"
                />
              </td>
              <td class="text-center">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td class="text-center">
                <div class="product-image-cell">
                  <img
                    v-if="item.Main_img"
                    :src="item.Main_img"
                    :alt="item.Ten_hang"
                    class="product-thumbnail"
                  />
                  <div v-else class="product-thumbnail-empty"><i class="ri-file-image-fill"></i></div>
                </div>
              </td>
              <td class="text-center text-mono">{{ item.Ma_hang }}</td>
              <td class="text-center product-name-cell">{{ item.Ten_hang }}</td>
              <td class="text-center">{{ item.Danh_muc }}</td>
              <td class="text-center">{{ item.Size }}</td>
              <td class="text-center">{{ item.Dvt }}</td>
              <td class="text-center text-number">{{ formatNumber(item.Gia_goc) }}</td>
              <td class="text-center text-number text-bold">{{ formatNumber(item.Gia_ban) }}</td>
              <td class="text-center text-number">
                <span v-if="item.Gia_Giam && item.Gia_Giam > 0" class="price-sale">
                  {{ formatNumber(item.Gia_Giam) }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="text-center">
                <span class="badge badge-currency">{{ item.Don_vi_tien_te || 'VND' }}</span>
              </td>
              <td class="text-center">
                <span class="badge badge-lang">{{ item.Lang || 'vi' }}</span>
              </td>
              <td class="text-center">
                <span 
                  class="badge" 
                  :class="item.Trang_thai === 'Còn hàng' ? 'badge-success' : 'badge-danger'"
                >
                  {{ item.Trang_thai }}
                </span>
              </td>
              <td class="text-center text-muted text-truncate">{{ item.Mo_ta }}</td>
              <td @click.stop class="text-center">
                <button class="btn-action-discount" @click="openDiscount(item)">
                   GIẢM GIÁ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
</template>
      <!-- Desktop Pagination -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Hiển thị <strong>{{ startIndex }}-{{ endIndex }}</strong> / <strong>{{ ordered.length }}</strong> sản phẩm

        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === 1"
            @click="goToPage(1)"
            title="Trang đầu"
          >
            ⏮
          </button>
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            title="Trang trước"
          >
            ◀
          </button>
          
          <template v-for="page in displayPages" :key="page">
            <button 
              v-if="typeof page === 'number'"
              class="pagination-btn pagination-number" 
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">...</span>
          </template>
          
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            title="Trang sau"
          >
            ▶
          </button>
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
            title="Trang cuối"
          >
            ⏭
          </button>
        </div>
      </div>
    </section>

    <!-- ===== MOBILE CARDS ===== -->
    <section class="content-section mobile-view">
       <!-- TABLE LOADING -->
  <div v-if="tableLoading" class="table-loading-container">
    <div class="table-loading">
      <div class="table-loading-spinner"></div>
      <div class="table-loading-text">Đang tải dữ liệu...</div>
    </div>
  </div>
  <template v-else>
      <div class="cards-container">
        <div
          v-for="item in paginatedData"
          :key="item.Ma_hang"
          class="product-card"
          @click="openEdit(item)"
        >
          <div class="card-header">
            <div class="card-image-wrapper">
              <img
                v-if="item.Main_img"
                :src="item.Main_img"
                :alt="item.Ten_hang"
                class="card-image"
              />
              <div v-else class="card-image-empty"><i class="ri-file-image-fill"></i></div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ item.Ten_hang }}</h3>
              <div class="card-meta">
                <span class="badge" :class="item.Trang_thai === 'Còn hàng' ? 'badge-success' : 'badge-danger'">
                  {{ item.Trang_thai }}
                </span>
                <span class="card-code">{{ item.Ma_hang }}</span>
              </div>
            </div>
            <input
              type="checkbox"
              v-model="selected"
              :value="item.Ma_hang"
              class="checkbox"
              @click.stop
            />
          </div>

          <div class="card-pricing">
            <div class="price-row">
              <span class="price-label">Giá bán</span>
              <span class="price-value primary">{{ formatNumber(item.Gia_ban) }}</span>
            </div>
            <div v-if="item.Gia_Giam && item.Gia_Giam > 0" class="price-row">
              <span class="price-label">Giá giảm</span>
              <span class="price-value sale">{{ formatNumber(item.Gia_Giam) }}</span>
            </div>
            <div class="price-badges">
              <span class="badge badge-currency">{{ item.Don_vi_tien_te || 'VND' }}</span>
              <span class="badge badge-lang">{{ item.Lang || 'vi' }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="card-action-btn btn-edit" @click.stop="openEdit(item)">
              <span class="btn-icon"><i class="ri-edit-box-line"></i></span>
              <span class="btn-text">Sửa</span>
            </button>
            <button class="card-action-btn btn-delete" @click.stop="confirmDelete(item)">
              <span class="btn-icon"><i class="ri-delete-bin-fill"></i></span>
              <span class="btn-text">Xóa</span>
            </button>
            <button class="card-action-btn btn-discount" @click.stop="openDiscount(item)">
              <span class="btn-icon"><i class="ri-price-tag-3-line"></i></span>
              <span class="btn-text">Giảm giá</span>
            </button>
          </div>
        </div>
      </div>
</template>
      <!-- Mobile Pagination -->
      <div class="pagination-wrapper mobile-pagination">
        <div class="pagination-info">
          Trang <strong>{{ currentPage }}</strong> / <strong>{{ totalPages }}</strong>
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            ⏮
          </button>
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ◀
          </button>
          
          <template v-for="page in displayPages" :key="page">
            <button 
              v-if="typeof page === 'number'"
              class="pagination-btn pagination-number" 
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">...</span>
          </template>
          
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            ▶
          </button>
          <button 
            class="pagination-btn pagination-arrow" 
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            ⏭
          </button>
        </div>
      </div>
    </section>

    <!-- ===== MOBILE SIDEBAR ===== -->
    <transition name="slide-left">
      <div v-if="showSidebar && isMobile" class="sidebar-overlay" @click="attemptCloseSidebar">
        <div class="sidebar-panel" @click.stop>
   <div class="sidebar-header">
  <div class="sidebar-header-left">
    <h2 class="sidebar-title"> Chỉnh sửa sản phẩm <i class="ri-edit-box-fill"></i></h2>
    <div v-if="edit && edit.Ten_hang" class="sidebar-subtitle">
      {{ edit.Ten_hang }}
    </div>
  </div>

  <div class="sidebar-header-actions">
    <button
  v-if="hasUnsavedChanges"
  class="btn-save-inline"
  :class="{ 'is-loading': saving }"
  @click="saveEdit"
  :disabled="saving || uploading"
>
  <span v-if="saving" class="btn-spinner"></span>
  <span v-else><i class="ri-save-3-fill"></i></span>
  <span>{{ saving ? 'Loading...' : 'Lưu' }}</span>
</button>


    <button class="btn-close-sidebar" @click="attemptCloseSidebar">✕</button>
  </div>
</div>


          <div class="sidebar-body">
            <div class="edit-content">
              <!-- Lang -->
              <div class="form-section">
                <div class="form-group">
                  <label class="form-label">Ngôn ngữ</label>
                  <select v-model="edit.Lang" class="form-control" @change="markAsEdited">
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="zh-CN">🇨🇳 中文</option>
                    <option value="fil">🇵🇭 Filipino</option>
                  </select>
                </div>
              </div>

              <!-- Image Upload -->
              <div class="form-section">
                <label class="form-label">Hình ảnh sản phẩm</label>
                <div class="image-upload-area">
                  <div class="image-preview-container">
                    <img v-if="edit.Main_img" :src="edit.Main_img" class="image-preview" />
                    <div v-else class="image-preview-empty">
                      <span class="empty-icon"><i class="ri-file-image-line"></i></span>
                      <span class="empty-text">Chưa có ảnh</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleImageUpload"
                    accept="image/*"
                    style="display: none"
                  />
                  <button 
                    class="btn-upload-image" 
                    @click="$refs.fileInput.click()" 
                    :disabled="uploading"
                  >
                    <span v-if="uploading"> Đang tải...</span>
                    <span v-else><i class="ri-chat-upload-fill"></i>Upload ảnh</span>
                  </button>
                </div>
              </div>

              <!-- Ma hang & Ten hang -->
              <div class="form-section">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Mã hàng</label>
                    <input v-model="edit.Ma_hang" disabled class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tên sản phẩm</label>
                    <input v-model="edit.Ten_hang" class="form-control" @input="markAsEdited" />
                  </div>
                </div>
              </div>

              <!-- Trang thai, Danh muc, Size, DVT -->
              <div class="form-section">
                <div class="form-row form-row-4">
                  <div class="form-group">
                    <label class="form-label">Trạng thái</label>
                    <select v-model="edit.Trang_thai" class="form-control" @change="markAsEdited">
                      <option>Còn hàng</option>
                      <option>Hết hàng</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Danh mục</label>
                    <input v-model="edit.Danh_muc" class="form-control" @input="markAsEdited" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Size</label>
                    <input v-model="edit.Size" class="form-control" @input="markAsEdited" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">ĐVT</label>
                    <input v-model="edit.Dvt" class="form-control" @input="markAsEdited" />
                  </div>
                </div>
              </div>

              <!-- Tien te, Gia goc, Gia ban, Gia giam -->
              <div class="form-section">
                <div class="form-row form-row-4">
                  <div class="form-group">
                    <label class="form-label">Tiền tệ</label>
                    <input v-model="edit.Don_vi_tien_te" placeholder="VND" class="form-control" @input="markAsEdited" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Giá gốc</label>
                    <input
  type="text"
  inputmode="numeric"
  autocomplete="off"
  class="form-control"
  :value="fmtMoney(edit.Gia_goc)"
  @input="onMoneyInput($event, 'Gia_goc')"
/>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Giá bán</label>
                    <!-- Giá bán -->
<input
  type="text"
  inputmode="numeric"
  autocomplete="off"
  class="form-control"
  :value="fmtMoney(edit.Gia_ban)"
  @input="onMoneyInput($event, 'Gia_ban')"
/>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Giá giảm</label>
                <input
  type="text"
  inputmode="numeric"
  autocomplete="off"
  class="form-control"
  :class="{ 'form-control-highlight': isDiscountMode }"
  :value="fmtMoney(edit.Gia_Giam)"
  @input="onMoneyInput($event, 'Gia_Giam')"
/>
                  </div>
                </div>
              </div>

              <!-- Mo ta -->
              <div class="form-section">
                <div class="form-group">
                  <label class="form-label">Mô tả sản phẩm</label>
                  <textarea v-model="edit.Mo_ta" class="form-control form-textarea" rows="3" @input="markAsEdited"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-footer">
            <button class="btn-sidebar btn-danger" @click="deleteHang">
              <span class="btn-icon"><i class="ri-delete-bin-2-fill"></i></span>
              <span class="btn-text">Xóa</span>
            </button>
            <button class="btn-sidebar btn-secondary" @click="attemptCloseSidebar">
              <span class="btn-text">Hủy</span>
            </button>
          <button
  v-if="hasUnsavedChanges"
  class="btn-save-inline"
  :class="{ 'is-loading': saving }"
  @click="saveEdit"
  :disabled="saving || uploading"
>
  <span v-if="saving" class="btn-spinner"></span>
  <span v-else><i class="ri-save-3-fill"></i></span>
  <span>{{ saving ? 'Loading...' : 'Lưu' }}</span>
</button>

          </div>
        </div>
      </div>
    </transition>

    <!-- ===== DESKTOP MODAL ===== -->
    <transition name="fade-scale">
      <div v-if="showModal && !isMobile" class="modal-overlay" @click="attemptCloseModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Chỉnh sửa sản phẩm <i class="ri-edit-box-fill"></i></h2>
            <button class="btn-close-modal" @click="attemptCloseModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- Lang -->
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Ngôn ngữ</label>
                <select v-model="edit.Lang" class="form-control" @change="markAsEdited">
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="zh-CN">🇨🇳 中文</option>
                  <option value="fil">🇵🇭 Filipino</option>
                </select>
              </div>
            </div>

            <!-- Image | Upload | Ma hang | Ten hang -->
            <div class="form-section">
              <div class="form-row form-row-image">
                <div class="form-group">
                  <label class="form-label">Hình ảnh</label>
                  <div class="image-upload-area">
                    <div class="image-preview-container">
                      <img v-if="edit.Main_img" :src="edit.Main_img" class="image-preview" />
                      <div v-else class="image-preview-empty">
                        <span class="empty-icon"><i class="ri-file-image-line"></i></span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref="fileInputModal"
                      @change="handleImageUpload"
                      accept="image/*"
                      style="display: none"
                    />
                    <button 
                      class="btn-upload-image" 
                      @click="$refs.fileInputModal.click()" 
                      :disabled="uploading"
                    >
                      {{ uploading ? 'Đang tải lên...' : 'Đổi ảnh' }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Mã hàng</label>
                  <input v-model="edit.Ma_hang" disabled class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label">Tên sản phẩm</label>
                  <input v-model="edit.Ten_hang" class="form-control" @input="markAsEdited" />
                </div>
              </div>
            </div>

            <!-- Trang thai | Danh muc | Size | DVT -->
            <div class="form-section">
              <div class="form-row form-row-4">
                <div class="form-group">
                  <label class="form-label">Trạng thái</label>
                  <select v-model="edit.Trang_thai" class="form-control" @change="markAsEdited">
                    <option>Còn hàng</option>
                    <option>Hết hàng</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Danh mục</label>
                  <input v-model="edit.Danh_muc" class="form-control" @input="markAsEdited" />
                </div>
                <div class="form-group">
                  <label class="form-label">Size</label>
                  <input v-model="edit.Size" class="form-control" @input="markAsEdited" />
                </div>
                <div class="form-group">
                  <label class="form-label">ĐVT</label>
                  <input v-model="edit.Dvt" class="form-control" @input="markAsEdited" />
                </div>
              </div>
            </div>

            <!-- Tien te | Gia goc | Gia ban | Gia giam -->
            <div class="form-section">
              <div class="form-row form-row-4">
                <div class="form-group">
                  <label class="form-label">Tiền tệ</label>
                  <input v-model="edit.Don_vi_tien_te" placeholder="VND" class="form-control" @input="markAsEdited" />
                </div>
                <div class="form-group">
                  <label class="form-label">Giá gốc</label>
                  <input
  type="text"
  inputmode="numeric"
  autocomplete="off"
  class="form-control"
  :value="fmtMoney(edit.Gia_goc)"
  @input="onMoneyInput($event, 'Gia_goc')"
/>

                </div>
                <div class="form-group">
                  <label class="form-label">Giá bán</label>
                <input
  type="text"
  inputmode="numeric"
  autocomplete="off"
  class="form-control"
  :value="fmtMoney(edit.Gia_ban)"
  @input="onMoneyInput($event, 'Gia_ban')"
/>
                </div>
                <div class="form-group">
                  <label class="form-label">Giá giảm</label>
              <!-- Giá giảm -->
<input
  ref="discountInputModal"
  type="text"
  inputmode="numeric"
  autocomplete="off"
  placeholder="0"
  class="form-control"
  :class="{ 'form-control-highlight': isDiscountMode }"
  :value="fmtMoney(edit.Gia_Giam)"
  @input="onMoneyInput($event, 'Gia_Giam')"
/>
                </div>
              </div>
            </div>

            <!-- Mo ta -->
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Mô tả sản phẩm</label>
                <textarea v-model="edit.Mo_ta" class="form-control form-textarea" rows="2" @input="markAsEdited"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-modal btn-danger" @click="deleteHang">
              
              <span class="btn-text">Xóa</span>
            </button>
            <div class="modal-footer-right">
              <button class="btn-modal btn-secondary" @click="attemptCloseModal">
                <span class="btn-text">Hủy</span>
              </button>
     <button
  class="btn-modal btn-primary"
  :class="{ 'is-loading': saving }"
  @click="saveEdit"
  :disabled="saving || uploading"
>
  <span v-if="saving" class="btn-spinner"></span>
  
  <span class="btn-text">{{ saving ? 'Loading...' : 'Lưu' }}</span>
</button>

            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== SCROLL TO TOP BUTTON ===== -->
   <!-- ===== SCROLL TO TOP BUTTON (MOBILE) ===== -->
<transition name="fade-scale">
  <button
    v-if="showScrollTop && isMobile"
    class="scroll-to-top"
    @click="scrollToTop"
    title="Lên đầu trang"
    aria-label="Lên đầu trang"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  </button>
</transition>


    <!-- ===== NOTIFICATION MODAL ===== -->
    <transition name="fade-scale">
      <div v-if="alertMessage" class="notification-overlay" @click="alertMessage = ''">
        <div class="notification-box" @click.stop :class="`notification-${alertType}`">
          <div class="notification-icon">
            <span v-if="alertType === 'success'">✅</span>
            <span v-else-if="alertType === 'error'">❌</span>
            <span v-else>ℹ️</span>
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ alertMessage }}</p>
          </div>
          <button class="btn-notification-close" @click="alertMessage = ''">Đóng</button>
        </div>
      </div>
    </transition>

    <!-- ===== CONFIRM MODAL ===== -->
    <transition name="fade-scale">
    <div v-if="confirmData" class="notification-overlay" @click="!confirmBusy && (confirmData = null)">
  <div class="confirm-box" @click.stop>
    <div class="confirm-icon">⚠️</div>
    <div class="confirm-content">
      <h3 class="confirm-title">{{ confirmData.title || 'Xác nhận thao tác' }}</h3>
      <p class="confirm-message">{{ confirmData.message }}</p>
    </div>

    <div class="confirm-actions">
      <button class="btn-confirm btn-secondary" :disabled="confirmBusy" @click="confirmData = null">
        Hủy
      </button>

      <button class="btn-confirm btn-danger" :disabled="confirmBusy" @click="confirmAction">
        <span v-if="confirmBusy" class="spinner"></span>
        <span>
          {{
            confirmBusy
              ? (confirmData.loadingText || 'Đang xử lý...')
              : (confirmData.confirmText || 'Xác nhận')
          }}
        </span>
      </button>
    </div>
  </div>
</div>

    </transition>

  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzZLlPqjwNuAhRbkZ_UqeJCHQw4TxRQY4d7r-mejYhupfrFanyJcb9EFwvb30X5gqkQ/exec'
const IMGBB_API_KEY = 'b202a4bdc79bf1dc72f6f6ded6b74501'
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

const list = ref([])
const keyword = ref('')
const selected = ref([])

// Filter states
const selectedCategory = ref('')
const filterPromotion = ref(false)
const filterStatus = ref('all') // 'all', 'available', 'out'
const showCategoryFilter = ref(false)

const showModal = ref(false)
const showSidebar = ref(false)
const edit = ref({})
const originalEdit = ref({})
const hasUnsavedChanges = ref(false)
const discountInput = ref(null)
const discountInputModal = ref(null)
const isDiscountMode = ref(false)

const alertMessage = ref('')
const alertType = ref('info')
const confirmData = ref(null)
const confirmBusy = ref(false)

const isMobile = ref(window.innerWidth <= 768)
const showScrollTop = ref(false)

const fileInput = ref(null)
const fileInputModal = ref(null)
const uploading = ref(false)
const saving = ref(false) // ✅ thêm
const currentPage = ref(1)
const pageSize = 10
const tableLoading = ref(true) 
async function loadData() {
  tableLoading.value = true // ✅ dùng tableLoading
  try {
    const res = await fetch(`${GAS_URL}?action=sheet&sheet=hang_hoa`)
    const json = await res.json()
    list.value = json.data || []
  } catch (error) {
    console.error('Load data error:', error)
    showAlert('Không thể tải dữ liệu', 'error')
  } finally {
    tableLoading.value = false // ✅ tắt loading
  }
}
/* ===== LIFECYCLE ===== */


onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})


function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

function handleScroll(e) {
  const y =
    (e && e.target && typeof e.target.scrollTop === 'number' ? e.target.scrollTop : 0) ||
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0

  showScrollTop.value = y > 300
}


function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ===== CATEGORIES ===== */
const categories = computed(() => {
  const catMap = {}
  list.value.forEach(item => {
    const cat = item.Danh_muc || 'Khác'
    catMap[cat] = (catMap[cat] || 0) + 1
  })
  return Object.keys(catMap)
    .sort()
    .map(name => ({ name, count: catMap[name] }))
})

/* ===== FILTER FUNCTIONS ===== */
function togglePromotionFilter() {
  filterPromotion.value = !filterPromotion.value
  currentPage.value = 1
}

function cycleStatusFilter() {
  if (filterStatus.value === 'all') {
    filterStatus.value = 'available'
  } else if (filterStatus.value === 'available') {
    filterStatus.value = 'out'
  } else {
    filterStatus.value = 'all'
  }
  currentPage.value = 1
}

function getStatusLabel() {
  if (filterStatus.value === 'available') return 'Còn hàng'
  if (filterStatus.value === 'out') return 'Hết hàng'
  return 'Còn hàng / Hết hàng'
}

const hasActiveFilters = computed(() => {
  return selectedCategory.value || filterPromotion.value || filterStatus.value !== 'all'
})

function clearAllFilters() {
  selectedCategory.value = ''
  filterPromotion.value = false
  filterStatus.value = 'all'
  currentPage.value = 1
}

/* ===== SEARCH ===== */
function handleSearch() {
  currentPage.value = 1
}

function clearSearch() {
  keyword.value = ''
  currentPage.value = 1
}

/* ===== IMAGE UPLOAD ===== */
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showAlert('Vui lòng chọn file hình ảnh', 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showAlert('Kích thước ảnh tối đa 5MB', 'error')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (result.success) {
      edit.value.Main_img = result.data.url
      markAsEdited()
      showAlert('Upload ảnh thành công', 'success')
    } else {
      throw new Error('Upload failed')
    }
  } catch (error) {
    console.error('Upload error:', error)
    showAlert('Upload ảnh thất bại', 'error')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
    if (fileInputModal.value) fileInputModal.value.value = ''
  }
}

/* ===== COMPUTED ===== */
const filtered = computed(() =>
  list.value.filter(item => {
    // Keyword search
    if (keyword.value) {
      const searchTerm = keyword.value.toLowerCase()
      const matchKeyword = 
        (item.Ma_hang || '').toLowerCase().includes(searchTerm) ||
        (item.Ten_hang || '').toLowerCase().includes(searchTerm)
      if (!matchKeyword) return false
    }

    // Category filter
    if (selectedCategory.value) {
      if ((item.Danh_muc || 'Khác') !== selectedCategory.value) return false
    }

    // Promotion filter
    if (filterPromotion.value) {
      if (!item.Gia_Giam || item.Gia_Giam <= 0) return false
    }

    // Status filter
    if (filterStatus.value !== 'all') {
      if (filterStatus.value === 'available' && item.Trang_thai !== 'Còn hàng') return false
      if (filterStatus.value === 'out' && item.Trang_thai !== 'Hết hàng') return false
    }

    return true
  })
)
const ordered = computed(() => {
  // copy rồi đảo để không làm bẩn filtered/list
  return [...filtered.value].reverse()
})

const totalPages = computed(() => Math.ceil(ordered.value.length / pageSize) || 1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return ordered.value.slice(start, start + pageSize)
})

const displayPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current <= 3) {
      pages.push(2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push('...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push('...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

const startIndex = computed(() => {
  if (ordered.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize + 1
})
const endIndex = computed(() => Math.min(currentPage.value * pageSize, ordered.value.length))

const isAllSelected = computed(() =>
  paginatedData.value.length > 0 && 
  paginatedData.value.every(item => selected.value.includes(item.Ma_hang))
)

watch(filtered, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

/* ===== PAGINATION ===== */
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  scrollToTop()
}

/* ===== EDIT TRACKING ===== */
function markAsEdited() {
  hasUnsavedChanges.value = true
}

function resetEditTracking() {
  hasUnsavedChanges.value = false
  originalEdit.value = {}
}

/* ===== ACTIONS ===== */
function toggleSelectAll(e) {
  if (e.target.checked) {
    const currentIds = paginatedData.value.map(item => item.Ma_hang)
    selected.value = [...new Set([...selected.value, ...currentIds])]
  } else {
    const currentIds = paginatedData.value.map(item => item.Ma_hang)
    selected.value = selected.value.filter(id => !currentIds.includes(id))
  }
}

function exportText() {
  if (!selected.value.length) {
    showAlert('Vui lòng chọn sản phẩm để xuất', 'error')
    return
  }

  const text = list.value
    .filter(item => selected.value.includes(item.Ma_hang))
    .map(item => `${item.Ten_hang} : ${item.Gia_ban}`)
    .join('\n')

  navigator.clipboard.writeText(text)
  showAlert(`Đã sao chép ${selected.value.length} sản phẩm`, 'success')
}

function exportTen() {
  if (!selected.value.length) {
    showAlert('Vui lòng chọn sản phẩm để xuất', 'error')
    return
  }

  const text = list.value
    .filter(item => selected.value.includes(item.Ma_hang))
    .map(item => item.Ten_hang)
    .join('\n')

  navigator.clipboard.writeText(text)
  showAlert(`Đã sao chép ${selected.value.length} tên hàng`, 'success')
}

function exportGia() {
  if (!selected.value.length) {
    showAlert('Vui lòng chọn sản phẩm để xuất', 'error')
    return
  }

  const text = list.value
    .filter(item => selected.value.includes(item.Ma_hang))
    .map(item => item.Gia_ban)
    .join('\n')

  navigator.clipboard.writeText(text)
  showAlert(`Đã sao chép ${selected.value.length} giá bán`, 'success')
}

function openEdit(item) {
  edit.value = { ...item }
  originalEdit.value = { ...item }
  isDiscountMode.value = false
  resetEditTracking()
  
  if (isMobile.value) {
    showSidebar.value = true
  } else {
    showModal.value = true
  }
}

function openDiscount(item) {
  edit.value = { ...item }
  originalEdit.value = { ...item }
  isDiscountMode.value = true
  resetEditTracking()
  
  if (isMobile.value) {
    showSidebar.value = true
  } else {
    showModal.value = true
  }
  
  nextTick(() => {
    const input = isMobile.value ? discountInput.value : discountInputModal.value
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function attemptCloseModal() {
  if (hasUnsavedChanges.value) {
    confirmData.value = {
      title: '⚠️ Chưa lưu thay đổi',
      message: 'Bạn có thay đổi chưa được lưu. Vui lòng nhấn nút "Lưu" để lưu thay đổi hoặc "Hủy" để bỏ qua.',
      confirmText: 'Đóng lại',
      action: () => {
        closeModal()
      }
    }
  } else {
    closeModal()
  }
}

function attemptCloseSidebar() {
  if (hasUnsavedChanges.value) {
    confirmData.value = {
      title: '⚠️ Chưa lưu thay đổi',
      message: 'Bạn có thay đổi chưa được lưu. Vui lòng nhấn nút "Lưu" để lưu thay đổi hoặc "Hủy" để bỏ qua.',
      confirmText: 'Đóng lại',
      action: () => {
        closeSidebar()
      }
    }
  } else {
    closeSidebar()
  }
}

function closeModal() {
  showModal.value = false
  isDiscountMode.value = false
  resetEditTracking()
}

function closeSidebar() {
  showSidebar.value = false
  isDiscountMode.value = false
  resetEditTracking()
}

async function saveEdit() {
  if (saving.value) return // chặn spam click

  saving.value = true
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'updateHangHoa',
        data: edit.value,
      }),
    })

    showAlert('Cập nhật thành công', 'success')
    resetEditTracking()

    // đóng UI
    closeModal()
    closeSidebar()

    await loadData()
  } catch (error) {
    console.error('Save error:', error)
    showAlert('Cập nhật thất bại', 'error')
  } finally {
    saving.value = false
  }
}


function deleteHang() {
  confirmData.value = {
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa sản phẩm "${edit.value.Ten_hang}"?`,
    confirmText: 'Xóa',
    loadingText: 'Đang xóa...',
    action: async () => {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'deleteHangHoa',
            Ma_hang: edit.value.Ma_hang,
          }),
        })

        showAlert('Đã xóa sản phẩm', 'success')
        resetEditTracking()
        closeModal()
        closeSidebar()
        await loadData()
      } catch (error) {
        console.error('Delete error:', error)
        showAlert('Xóa thất bại', 'error')
      }
    }
  }
}


function confirmDelete(item) {
  confirmData.value = {
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa sản phẩm "${item.Ten_hang}"?`,
    confirmText: 'Xóa',
    loadingText: 'Đang xóa...',
    action: async () => {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'deleteHangHoa',
            Ma_hang: item.Ma_hang,
          }),
        })

        showAlert('Đã xóa sản phẩm', 'success')
        await loadData()
      } catch (error) {
        console.error('Delete error:', error)
        showAlert('Xóa thất bại', 'error')
      }
    }
  }
}


async function confirmAction() {
  if (confirmBusy.value) return
  if (!confirmData.value?.action) {
    confirmData.value = null
    return
  }

  confirmBusy.value = true
  try {
    await confirmData.value.action()
  } finally {
    confirmBusy.value = false
    confirmData.value = null
  }
}


function showAlert(message, type = 'info') {
  alertMessage.value = message
  alertType.value = type
  setTimeout(() => {
    alertMessage.value = ''
  }, 3000)
}

function formatNumber(num) {
  if (!num && num !== 0) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtMoney(val) {
  const n = Number(val || 0)
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}


function parseMoney(str) {
  const digits = (str || '').toString().replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

function onMoneyInput(e, key) {
  const el = e.target
  const raw = el.value
  const caret = el.selectionStart || 0

  // số lượng chữ số ở bên trái caret (để giữ vị trí sau khi format)
  const digitsLeft = raw.slice(0, caret).replace(/[^\d]/g, '').length

  // parse -> lưu number vào edit
  const num = parseMoney(raw)
  edit.value[key] = num
  markAsEdited()

  // format lại để hiển thị
  const formatted = fmtMoney(num)
  el.value = formatted

  // đặt lại caret đúng vị trí tương ứng
  let pos = 0, seen = 0
  while (pos < formatted.length && seen < digitsLeft) {
    if (/\d/.test(formatted[pos])) seen++
    pos++
  }
  requestAnimationFrame(() => el.setSelectionRange(pos, pos))
}

</script>
<style scoped>
/* ===== RESET & BASE ===== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page {
  min-height: 100vh;
  background: rgb(15, 23, 42);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ===== PAGE HEADER ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.5px;
}

.page-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #60a5fa;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== FILTER SECTION ===== */
.filter-section {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-section.sticky {
  position: sticky;
  top: 16px;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.search-container {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 48px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  font-size: 15px;
  color: #f8fafc;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  background: rgba(15, 23, 42, 0.8);
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(148, 163, 184, 0.2);
  border: none;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.search-clear:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* ===== FILTER BUTTONS ===== */
.filter-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.btn-filter {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-filter:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-filter.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
  color: #93c5fd;
}

.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  border: 2px solid rgb(15, 23, 42);
}

.btn-clear-filters {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-filters:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  transform: translateY(-2px);
}

/* ===== CATEGORY DROPDOWN ===== */
.category-dropdown {
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.category-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
}

.category-item.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
  color: #93c5fd;
}

.category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  font-size: 11px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.5);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}

.category-item.active .category-count {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.2);
}

.export-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.btn-export {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-export .btn-icon {
  font-size: 18px;
}

/* ===== CONTENT SECTION ===== */
.content-section {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 20px;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

/* ===== TABLE ===== */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.data-table thead th {
  position: sticky;
  top: 0;
  padding: 14px 12px;
  background: rgba(15, 23, 42, 0.95);
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  white-space: nowrap;
  z-index: 10;
}

.data-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: #e2e8f0;
}

.table-row {
  cursor: pointer;
  transition: all 0.2s;
}

.table-row:hover {
  background: rgba(59, 130, 246, 0.08);
}

.product-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-thumbnail {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(148, 163, 184, 0.1);
}

.product-thumbnail-empty {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 8px;
  font-size: 24px;
}

.product-name-cell {
  font-weight: 500;
  color: #f8fafc;
}

.text-center {
  text-align: center;
}

.text-mono {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #94a3b8;
}

.text-number {
  font-variant-numeric: tabular-nums;
}

.text-bold {
  font-weight: 600;
  color: #f8fafc;
}

.text-muted {
  color: #64748b;
}

.text-truncate {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-sale {
  color: #f87171;
  font-weight: 600;
}

/* ===== BADGES ===== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-currency {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-lang {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* ===== ACTION BUTTONS ===== */
.btn-action-discount {
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: #fcd34d;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-discount:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  transform: translateY(-2px);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* ===== PAGINATION ===== */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  color: #94a3b8;
  font-size: 14px;
}

.pagination-info strong {
  color: #f8fafc;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pagination-arrow {
  min-width: 36px;
}

.pagination-ellipsis {
  padding: 0 8px;
  color: #64748b;
  font-size: 14px;
  user-select: none;
}

/* ===== MOBILE CARDS ===== */
.cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.product-card {
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.product-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-header {
  padding: 12px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.card-image-wrapper {
  flex-shrink: 0;
}

.card-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(148, 163, 184, 0.1);
}

.card-image-empty {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 8px;
  font-size: 28px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.card-code {
  font-size: 11px;
  color: #64748b;
  font-family: 'Monaco', 'Courier New', monospace;
}

.card-pricing {
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.price-row:last-of-type {
  margin-bottom: 8px;
}

.price-label {
  font-size: 12px;
  color: #ece8e8;
}

.price-value {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.price-value.primary {
  color: #60a5fa;
}

.price-value.sale {
  color: #f87171;
}

.price-badges {
  display: flex;
  gap: 6px;
}

.card-actions {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.card-action-btn {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.card-action-btn:nth-child(3) {
  grid-column: 1 / -1;
}

.btn-edit {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-edit:hover {
  background: rgba(34, 197, 94, 0.25);
}

.btn-discount {
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.btn-discount:hover {
  background: rgba(251, 191, 36, 0.25);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.25);
}
/* ===== MOBILE SIDEBAR ===== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.sidebar-panel {
  width: 100%;
  max-width: 100%;
  height: 100%;
  background: rgb(15, 23, 42);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(30, 41, 59, 0.8);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
}

.btn-close-sidebar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.5);
  border: none;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-sidebar:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(30, 41, 59, 0.8);
  display: flex;
  gap: 12px;
}

/* ===== FORM ===== */
.edit-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  gap: 12px;
}

.form-row-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-row-4 {
  grid-template-columns: repeat(2, 1fr);
}

.form-row-image {
  grid-template-columns: 160px 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control {
  height: 44px;
  padding: 0 14px;
  background: rgba(51, 65, 85, 0.3);
  border: 2px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control::placeholder {
  color: #475569;
}

.form-control:focus {
  outline: none;
  background: rgba(51, 65, 85, 0.5);
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-control:disabled {
  background: rgba(30, 41, 59, 0.5);
  opacity: 0.6;
  cursor: not-allowed;
}

.form-control-highlight {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
}

.form-textarea {
  height: auto;
  padding: 12px 14px;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

/* ===== IMAGE UPLOAD ===== */
.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.5);
  border: 2px dashed rgba(148, 163, 184, 0.2);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.empty-text {
  font-size: 12px;
  color: #64748b;
}

.btn-upload-image {
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.15);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #93c5fd;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload-image:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
}

.btn-upload-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== SIDEBAR BUTTONS ===== */
.btn-sidebar {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sidebar.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-sidebar.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.btn-sidebar.btn-secondary {
  background: rgba(71, 85, 105, 0.5);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-sidebar.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.7);
}

.btn-sidebar.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-sidebar.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

/* ===== DESKTOP MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-container {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: rgb(15, 23, 42);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(30, 41, 59, 0.8);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #f8fafc;
}

.btn-close-modal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.5);
  border: none;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(30, 41, 59, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer-right {
  display: flex;
  gap: 12px;
}

.btn-modal {
  height: 44px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-modal.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.btn-modal.btn-secondary {
  background: rgba(71, 85, 105, 0.5);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-modal.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.7);
}

.btn-modal.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-modal.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

/* ===== SCROLL TO TOP ===== */
.scroll-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
}

.scroll-to-top:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
}

/* ===== NOTIFICATIONS ===== */
.notification-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.notification-box {
  min-width: 320px;
  max-width: 400px;
  background: rgb(30, 41, 59);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.notification-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.notification-content {
  margin-bottom: 20px;
}

.notification-message {
  font-size: 16px;
  color: #e2e8f0;
  line-height: 1.5;
}

.btn-notification-close {
  width: 100%;
  height: 44px;
  background: #3b82f6;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-notification-close:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.notification-success {
  border-color: rgba(34, 197, 94, 0.3);
}

.notification-error {
  border-color: rgba(239, 68, 68, 0.3);
}

/* ===== CONFIRM MODAL ===== */
.confirm-box {
  min-width: 360px;
  max-width: 440px;
  background: rgb(30, 41, 59);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.confirm-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.confirm-content {
  margin-bottom: 24px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 8px;
}

.confirm-message {
  font-size: 15px;
  color: #cbd5e1;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-confirm {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm.btn-secondary {
  background: rgba(71, 85, 105, 0.5);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-confirm.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.7);
}

.btn-confirm.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-confirm.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

/* ===== ANIMATIONS ===== */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-stats {
    width: 100%;
    justify-content: space-between;
  }

  .export-actions {
    grid-template-columns: 1fr;
  }

  .cards-container {
    grid-template-columns: 1fr;
  }

  .mobile-pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .form-row-4 {
    grid-template-columns: 1fr;
  }

  .scroll-to-top {
    width: 48px;
    height: 48px;
    bottom: 24px;
    right: 24px;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .form-row-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row-image {
    grid-template-columns: 1fr;
  }
}

/* ===== SCROLLBAR STYLING ===== */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
/* ===== MOBILE STICKY SEARCH ===== */
.mobile-sticky-search {
  display: none;
}

@media (max-width: 768px) {
  .mobile-sticky-search {
    display: block;
    position: sticky;
    top: calc(env(safe-area-inset-top) + 10px);
    z-index: 150;
    margin-bottom: 12px;
  }

  .mobile-sticky-search-inner {
    background: rgba(30, 41, 59, 0.78);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  }

  /* Ẩn search cũ trong filter-section */
  .filter-section .search-container {
    display: none;
  }
}
/* ===== SIDEBAR HEADER SAVE INLINE ===== */
.sidebar-header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.sidebar-subtitle {
  font-size: 12px;
  font-weight: 800;
  color: #93c5fd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 58vw;
  opacity: 0.95;
}

.sidebar-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-save-inline {
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.25);
}

.btn-save-inline:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-save-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
/* ===== LOADING SPINNER FOR SAVE BUTTONS ===== */
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: btnSpin 0.8s linear infinite;
}

@keyframes btnSpin {
  to { transform: rotate(360deg); }
}

.is-loading {
  opacity: 0.9;
}

.is-loading:disabled {
  cursor: not-allowed;
}
/* ===== 6 BUTTONS: 3x2 GRID ===== */
.action-grid-6 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

/* ép 6 nút đều nhau */
.action-grid-6 .btn-filter,
.action-grid-6 .btn-export {
  width: 100%;
  height: 44px;              /* đồng bộ chiều cao */
  justify-content: center;   /* canh giữa */
  padding: 0 12px;
}

/* làm text/icon gọn hơn để fit đều */
.action-grid-6 .btn-icon {
  font-size: 16px;
}
.action-grid-6 .btn-text {
  font-size: 13px;
  font-weight: 600;
}

/* Xóa bộ lọc nằm riêng, canh phải */
.clear-filter-row {
  display: flex;
  justify-content: flex-end;
}

/* MOBILE: vẫn 3 cột x 2 hàng (nếu muốn) */
@media (max-width: 768px) {
  .action-grid-6 {
    gap: 10px;
  }

  .action-grid-6 .btn-filter,
  .action-grid-6 .btn-export {
    height: 42px;
    padding: 0 10px;
  }

  .action-grid-6 .btn-text {
    font-size: 12px;
  }
}

/* Nếu màn hình quá nhỏ bị chật -> bật cái này để chuyển 2 cột (OPTIONAL)
@media (max-width: 380px) {
  .action-grid-6 { grid-template-columns: repeat(2, 1fr); }
}
*/
.scroll-to-top {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 18px);
  right: 18px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.25s ease;
  z-index: 999;
}

.scroll-to-top:active {
  transform: translateY(-2px) scale(0.98);
}

@media (max-width: 768px) {
  .scroll-to-top {
    width: 48px;
    height: 48px;
    right: 14px;
    bottom: calc(env(safe-area-inset-bottom) + 14px);
  }
}
/* DESKTOP: đưa pagination-controls ra giữa */
@media (min-width: 769px) {
  .pagination-wrapper {
    display: grid;
    grid-template-columns: 1fr auto 1fr; /* trái | giữa | phải */
    align-items: center;
    gap: 16px;
  }

  .pagination-info {
    justify-self: start; /* nằm trái */
  }

  .pagination-controls {
    justify-self: center; /* nằm giữa */
  }
}
/* ===== TABLE LOADING ===== */
.table-loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.table-loading-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(59, 130, 246, 0.15);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.table-loading-text {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.ri-search-line{
  color: white;
}
</style>