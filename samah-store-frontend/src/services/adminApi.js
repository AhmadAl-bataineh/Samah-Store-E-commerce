import api from './api';

export const adminApi = {
  // ==================== METRICS ====================

  getMetrics: () => {
    return api.get('/api/admin/metrics');
  },

  resetRevenue: () => {
    return api.post('/api/admin/metrics/revenue-reset');
  },

  // ==================== USERS & ADMINS ====================

  // List all admins (includes ADMIN and EMPLOYEE roles - they have same access now)
  listAdmins: () => {
    return api.get('/api/admin/admins');
  },

  // Create new admin user
  createAdmin: (data) => {
    return api.post('/api/admin/users/admins', data);
  },

  // DEPRECATED: Keep for backward compatibility
  listEmployees: () => {
    return api.get('/api/admin/employees');
  },

  // DEPRECATED: Keep for backward compatibility - now routes to createAdmin
  createEmployee: (data) => {
    return api.post('/api/admin/users/employees', data);
  },

  disableUser: (userId) => {
    return api.patch(`/api/admin/users/${userId}/disable`);
  },

  enableUser: (userId) => {
    return api.patch(`/api/admin/users/${userId}/enable`);
  },

  updateUserRole: (userId, role) => {
    return api.patch(`/api/admin/users/${userId}/role`, null, { params: { role } });
  },

  // Promote a user to admin role
  promoteToAdmin: (userId) => {
    return api.patch(`/api/admin/users/${userId}/role`, null, { params: { role: 'ADMIN' } });
  },

  // ==================== ORDERS ====================

  listAllOrders: (params = {}) => {
    return api.get('/api/admin/orders', { params });
  },

  updateOrderStatus: (orderId, status) => {
    return api.patch(`/api/admin/orders/${orderId}/status`, { status });
  },

  assignOrder: (orderId, employeeId) => {
    return api.patch(`/api/admin/orders/${orderId}/assign`, { employeeId });
  },

  // ==================== CATEGORIES ====================

  /**
   * List categories (paginated, includes inactive)
   * GET /api/admin/categories
   * @param {object} params - { page, size, sort }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number, number: number, size: number}>}
   */
  listCategories: (params = {}) => {
    return api.get('/api/admin/categories', { params });
  },

  /**
   * Get single category by ID
   * GET /api/admin/categories/{id}
   * @param {number} id - Category ID
   * @returns {Promise<{id: number, name: string, slug: string, active: boolean}>}
   */
  getCategory: (id) => {
    return api.get(`/api/admin/categories/${id}`);
  },

  /**
   * Create new category
   * POST /api/admin/categories
   * @param {object} data - { name: string, slug: string, active?: boolean }
   * @returns {Promise<{id: number, name: string, slug: string, active: boolean}>}
   */
  createCategory: (data) => {
    return api.post('/api/admin/categories', data);
  },

  /**
   * Update category
   * PUT /api/admin/categories/{id}
   * @param {number} id - Category ID
   * @param {object} data - { name: string, slug: string, active?: boolean }
   * @returns {Promise<{id: number, name: string, slug: string, active: boolean}>}
   */
  updateCategory: (id, data) => {
    return api.put(`/api/admin/categories/${id}`, data);
  },

  /**
   * Delete category (soft delete)
   * DELETE /api/admin/categories/{id}
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  deleteCategory: (id) => {
    return api.delete(`/api/admin/categories/${id}`);
  },

  /**
   * Delete category permanently (hard delete)
   * DELETE /api/admin/categories/{id}/permanent
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  deleteCategoryPermanently: (id) => {
    return api.delete(`/api/admin/categories/${id}/permanent`);
  },

  /**
   * Toggle category active status
   * PATCH /api/admin/categories/{id}/status
   * @param {number} id - Category ID
   * @param {boolean} active - New active status
   * @returns {Promise<{id: number, name: string, slug: string, active: boolean}>}
   */
  toggleCategoryStatus: (id, active) => {
    return api.patch(`/api/admin/categories/${id}/status`, null, { params: { active } });
  },

  // ==================== PRODUCTS ====================

  /**
   * List products with filters (paginated)
   * GET /api/admin/products
   * @param {object} params - { categoryId?, q?, active?, page?, size?, sort? }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  listProducts: (params = {}) => {
    return api.get('/api/admin/products', { params });
  },

  /**
   * Get single product by ID
   * GET /api/admin/products/{id}
   * @param {number} id - Product ID
   * @returns {Promise<{id: number, name: string, slug: string, description: string, categoryId: number, categoryName: string, active: boolean, deleted: boolean}>}
   */
  getProduct: (id) => {
    return api.get(`/api/admin/products/${id}`);
  },

  /**
   * Create new product
   * POST /api/admin/products
   * @param {object} data - { name: string, slug: string, description?: string, categoryId: number, active?: boolean }
   * @returns {Promise<AdminProductResponse>}
   */
  createProduct: (data) => {
    return api.post('/api/admin/products', data);
  },

  /**
   * Update product
   * PUT /api/admin/products/{id}
   * @param {number} id - Product ID
   * @param {object} data - { name: string, slug: string, description?: string, categoryId: number, active?: boolean }
   * @returns {Promise<AdminProductResponse>}
   */
  updateProduct: (id, data) => {
    return api.put(`/api/admin/products/${id}`, data);
  },

  /**
   * Delete product (soft delete)
   * DELETE /api/admin/products/{id}
   * @param {number} id - Product ID
   * @returns {Promise<void>}
   */
  deleteProduct: (id) => {
    return api.delete(`/api/admin/products/${id}`);
  },

  /**
   * Delete product permanently (hard delete)
   * DELETE /api/admin/products/{id}/permanent
   * @param {number} id - Product ID
   * @returns {Promise<void>}
   */
  deleteProductPermanently: (id) => {
    return api.delete(`/api/admin/products/${id}/permanent`);
  },

  /**
   * Toggle product active status
   * PATCH /api/admin/products/{id}/status
   * @param {number} id - Product ID
   * @param {boolean} active - New active status
   * @returns {Promise<AdminProductResponse>}
   */
  toggleProductStatus: (id, active) => {
    return api.patch(`/api/admin/products/${id}/status`, null, { params: { active } });
  },

  // ==================== VARIANTS ====================

  /**
   * List variants for a product
   * GET /api/admin/products/{productId}/variants
   * @param {number} productId - Product ID
   * @returns {Promise<Array<{id: number, sku: string, size: string, color: string, price: number, stockQuantity: number, active: boolean, deleted: boolean}>>}
   */
  listVariants: (productId) => {
    return api.get(`/api/admin/products/${productId}/variants`);
  },

  /**
   * Create new variant for a product
   * POST /api/admin/products/{productId}/variants
   * @param {number} productId - Product ID
   * @param {object} data - { sku?: string, size?: string, color?: string, price: number, stockQuantity: number, active?: boolean }
   * @returns {Promise<AdminVariantResponse>}
   */
  createVariant: (productId, data) => {
    return api.post(`/api/admin/products/${productId}/variants`, data);
  },

  /**
   * Update variant
   * PUT /api/admin/variants/{variantId}
   * @param {number} variantId - Variant ID
   * @param {object} data - { sku?: string, size?: string, color?: string, price: number, stockQuantity: number, active?: boolean }
   * @returns {Promise<AdminVariantResponse>}
   */
  updateVariant: (variantId, data) => {
    return api.put(`/api/admin/variants/${variantId}`, data);
  },

  /**
   * Delete variant (soft delete)
   * DELETE /api/admin/variants/{variantId}
   * @param {number} variantId - Variant ID
   * @returns {Promise<void>}
   */
  deleteVariant: (variantId) => {
    return api.delete(`/api/admin/variants/${variantId}`);
  },

  /**
   * Update variant stock quantity only
   * PATCH /api/admin/variants/{variantId}/stock
   * @param {number} variantId - Variant ID
   * @param {number} stockQuantity - New stock quantity (min 0)
   * @returns {Promise<AdminVariantResponse>}
   */
  updateVariantStock: (variantId, stockQuantity) => {
    return api.patch(`/api/admin/variants/${variantId}/stock`, { stockQuantity });
  },

  // ==================== PRODUCT IMAGES ====================

  /**
   * List images for a product
   * GET /api/admin/products/{productId}/images
   * @param {number} productId - Product ID
   * @returns {Promise<Array<{id: number, url: string, sortOrder: number}>>}
   */
  listImages: (productId) => {
    return api.get(`/api/admin/products/${productId}/images`);
  },

  /**
   * Add image to product
   * POST /api/admin/products/{productId}/images
   * @param {number} productId - Product ID
   * @param {object} data - { url: string, sortOrder?: number }
   * @returns {Promise<{id: number, url: string, sortOrder: number}>}
   */
  addImage: (productId, data) => {
    return api.post(`/api/admin/products/${productId}/images`, data);
  },

  /**
   * Delete product image
   * DELETE /api/admin/products/{productId}/images/{imageId}
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID
   * @returns {Promise<void>}
   */
  deleteImage: (productId, imageId) => {
    return api.delete(`/api/admin/products/${productId}/images/${imageId}`);
  },

  // ==================== SHIPPING ZONES ====================

  /**
   * List shipping zones (paginated)
   * GET /api/admin/shipping-zones
   * @param {object} params - { page?, size?, sort? }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  listShippingZones: (params = {}) => {
    return api.get('/api/admin/shipping-zones', { params });
  },

  /**
   * Get single shipping zone by ID
   * GET /api/admin/shipping-zones/{id}
   * @param {number} id - Shipping Zone ID
   * @returns {Promise<{id: number, city: string, shippingFee: number}>}
   */
  getShippingZone: (id) => {
    return api.get(`/api/admin/shipping-zones/${id}`);
  },

  /**
   * Create new shipping zone
   * POST /api/admin/shipping-zones
   * @param {object} data - { city: string, shippingFee: number }
   * @returns {Promise<{id: number, city: string, shippingFee: number}>}
   */
  createShippingZone: (data) => {
    return api.post('/api/admin/shipping-zones', data);
  },

  /**
   * Update shipping zone
   * PUT /api/admin/shipping-zones/{id}
   * @param {number} id - Shipping Zone ID
   * @param {object} data - { city: string, shippingFee: number }
   * @returns {Promise<{id: number, city: string, shippingFee: number}>}
   */
  updateShippingZone: (id, data) => {
    return api.put(`/api/admin/shipping-zones/${id}`, data);
  },

  /**
   * Delete shipping zone
   * DELETE /api/admin/shipping-zones/{id}
   * @param {number} id - Shipping Zone ID
   * @returns {Promise<void>}
   */
  deleteShippingZone: (id) => {
    return api.delete(`/api/admin/shipping-zones/${id}`);
  },

  // ==================== COUPONS ====================

  /**
   * List coupons (paginated)
   * GET /api/admin/coupons
   * @param {object} params - { page?, size?, sort? }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  listCoupons: (params = {}) => {
    return api.get('/api/admin/coupons', { params });
  },

  /**
   * Get single coupon by ID
   * GET /api/admin/coupons/{id}
   * @param {number} id - Coupon ID
   * @returns {Promise<AdminCouponResponse>}
   */
  getCoupon: (id) => {
    return api.get(`/api/admin/coupons/${id}`);
  },

  /**
   * Create new coupon
   * POST /api/admin/coupons
   * @param {object} data - { code: string, type: 'PERCENT'|'FIXED', value: number, minOrderTotal?: number, startAt?: string, endAt?: string, usageLimitTotal?: number, usageLimitPerUser?: number, active?: boolean }
   * @returns {Promise<AdminCouponResponse>}
   */
  createCoupon: (data) => {
    return api.post('/api/admin/coupons', data);
  },

  /**
   * Update coupon
   * PUT /api/admin/coupons/{id}
   * @param {number} id - Coupon ID
   * @param {object} data - Same as createCoupon
   * @returns {Promise<AdminCouponResponse>}
   */
  updateCoupon: (id, data) => {
    return api.put(`/api/admin/coupons/${id}`, data);
  },

  /**
   * Delete coupon (soft delete)
   * DELETE /api/admin/coupons/{id}
   * @param {number} id - Coupon ID
   * @returns {Promise<void>}
   */
  deleteCoupon: (id) => {
    return api.delete(`/api/admin/coupons/${id}`);
  },

  // ==================== FILE UPLOAD ====================

  /**
   * Upload image file
   * POST /api/admin/upload/image
   * @param {File} file - Image file (jpg, png, webp)
   * @returns {Promise<{url: string, filename: string}>}
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

