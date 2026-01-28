import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { productsApi } from '../../services/productsApi';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getImageUrl } from '../../utils/imageUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [expandedActionsId, setExpandedActionsId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    active: true,
  });
  const [productFormErrors, setProductFormErrors] = useState({});

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [permanentDeletingProduct, setPermanentDeletingProduct] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Management modal (variants + images)
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingProduct, setManagingProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [manageTab, setManageTab] = useState('variants'); // 'variants' | 'images'

  // Variant modal (single variant creation/edit)
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantFormData, setVariantFormData] = useState({
    sku: '',
    size: '',
    color: '',
    price: '',
    stockQuantity: '',
    active: true,
  });
  const [variantFormErrors, setVariantFormErrors] = useState({});

  // Image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFormData, setImageFormData] = useState({
    url: '',
    sortOrder: '0',
    file: null,
    previewUrl: '',
    uploadMode: 'file', // 'file' or 'url'
  });
  const [imageFormErrors, setImageFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // Delete modals for variants/images
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState(null);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, searchQuery, categoryFilter, activeFilter]);

  const loadCategories = async () => {
    try {
      const cats = await productsApi.getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { page, size: 10 };
      if (searchQuery) params.q = searchQuery;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (activeFilter !== '') params.active = activeFilter === 'true';

      const response = await adminApi.listProducts(params);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      showToast('فشل تحميل المنتجات', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== PRODUCT CRUD ==========

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      slug: '',
      description: '',
      categoryId: '',
      active: true,
    });
    setProductFormErrors({});
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.categoryId?.toString() || '',
      active: product.active,
    });
    setProductFormErrors({});
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductFormData({ name: '', slug: '', description: '', categoryId: '', active: true });
    setProductFormErrors({});
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productFormData.name.trim()) errors.name = 'الاسم مطلوب';
    if (!productFormData.slug.trim()) errors.slug = 'الرابط مطلوب';
    if (!productFormData.categoryId) errors.categoryId = 'الفئة مطلوبة';
    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: productFormData.name,
        slug: productFormData.slug,
        description: productFormData.description || null,
        categoryId: parseInt(productFormData.categoryId),
        active: productFormData.active,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        await adminApi.createProduct(payload);
        showToast('تم إضافة المنتج بنجاح', 'success');
      }
      handleCloseProductModal();
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'فشل حفظ المنتج';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteProduct = async () => {
    try {
      setSubmitting(true);
      await adminApi.deleteProduct(deletingProduct.id);
      showToast('تم حذف المنتج بنجاح', 'success');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'فشل حذف المنتج';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      setTogglingId(product.id);
      const newActive = !product.active;
      await adminApi.toggleProductStatus(product.id, newActive);
      showToast(`تم ${newActive ? 'تفعيل' : 'تعطيل'} المنتج بنجاح`, 'success');
      // Update local state immediately
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, active: newActive } : p
      ));
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تحديث حالة المنتج';
      showToast(message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenPermanentDeleteProduct = (product) => {
    setPermanentDeletingProduct(product);
    setShowPermanentDeleteModal(true);
  };

  const handleConfirmPermanentDeleteProduct = async () => {
    try {
      setSubmitting(true);
      await adminApi.deleteProductPermanently(permanentDeletingProduct.id);
      showToast('تم حذف المنتج نهائيًا من قاعدة البيانات', 'success');
      setShowPermanentDeleteModal(false);
      setPermanentDeletingProduct(null);
      // Remove from local state immediately
      setProducts(prev => prev.filter(p => p.id !== permanentDeletingProduct.id));
    } catch (error) {
      const message = error.response?.data?.message || 'فشل الحذف النهائي';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== MANAGE MODAL (Variants + Images) ==========

  const handleOpenManage = async (product) => {
    setManagingProduct(product);
    setManageTab('variants');
    setShowManageModal(true);
    await loadVariants(product.id);
    await loadImages(product.id);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setManagingProduct(null);
    setVariants([]);
    setImages([]);
    setManageTab('variants');
  };

  const loadVariants = async (productId) => {
    try {
      const response = await adminApi.listVariants(productId);
      setVariants(response.data || []);
    } catch (error) {
      console.error('Failed to load variants:', error);
    }
  };

  const loadImages = async (productId) => {
    try {
      const response = await adminApi.listImages(productId);
      setImages(response.data || []);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  // ========== VARIANT CRUD ==========

  const handleOpenCreateVariant = () => {
    setEditingVariant(null);
    setVariantFormData({
      sku: '',
      size: '',
      color: '',
      price: '',
      stockQuantity: '',
      active: true,
    });
    setVariantFormErrors({});
    setShowVariantModal(true);
  };

  const handleOpenEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantFormData({
      sku: variant.sku || '',
      size: variant.size || '',
      color: variant.color || '',
      price: variant.price.toString(),
      stockQuantity: variant.stockQuantity.toString(),
      active: variant.active,
    });
    setVariantFormErrors({});
    setShowVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
    setEditingVariant(null);
    setVariantFormData({ sku: '', size: '', color: '', price: '', stockQuantity: '', active: true });
    setVariantFormErrors({});
  };

  const validateVariantForm = () => {
    const errors = {};
    if (!variantFormData.price || isNaN(variantFormData.price) || parseFloat(variantFormData.price) <= 0) {
      errors.price = 'السعر يجب أن يكون رقم موجب';
    }
    if (!variantFormData.stockQuantity || isNaN(variantFormData.stockQuantity) || parseInt(variantFormData.stockQuantity) < 0) {
      errors.stockQuantity = 'الكمية يجب أن تكون رقم غير سالب';
    }
    setVariantFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    if (!validateVariantForm()) return;

    try {
      setSubmitting(true);
      // SKU logic: if empty, auto-generate from product slug/name + size + color
      const base = (managingProduct?.slug || managingProduct?.name || 'product').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
      const sizePart = variantFormData.size ? variantFormData.size.toString().trim().toLowerCase().replace(/\s+/g, '-') : '';
      const colorPart = variantFormData.color ? variantFormData.color.toString().trim().toLowerCase().replace(/\s+/g, '-') : '';

      let sku = variantFormData.sku ? variantFormData.sku.trim() : '';
      if (!sku) {
        // generate candidate
        sku = [base, sizePart, colorPart].filter(Boolean).join('-');
      }

      // Ensure uniqueness among current variants for this product
      const exists = variants.some(v => v.sku && v.sku.toLowerCase() === sku.toLowerCase() && (!editingVariant || v.id !== editingVariant.id));
      if (exists) {
        setVariantFormErrors({ ...variantFormErrors, sku: 'SKU موجود بالفعل لهذا المنتج' });
        setSubmitting(false);
        return;
      }

      // If SKU still empty (no base parts), keep null
      const finalSku = sku || null;

      const payload = {
        sku: finalSku,
        size: variantFormData.size || null,
        color: variantFormData.color || null,
        price: parseFloat(variantFormData.price),
        stockQuantity: parseInt(variantFormData.stockQuantity, 10),
        active: variantFormData.active,
      };

      if (editingVariant) {
        await adminApi.updateVariant(editingVariant.id, payload);
        showToast('تم تحديث المقاس بنجاح', 'success');
      } else {
        await adminApi.createVariant(managingProduct.id, payload);
        showToast('تم إضافة المقاس بنجاح', 'success');
      }
      handleCloseVariantModal();
      await loadVariants(managingProduct.id);
    } catch (error) {
      const message = error.response?.data?.message || 'فشل حفظ المقاس';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };


  const handleOpenDeleteVariant = (variant) => {
    setDeletingVariant(variant);
    setShowDeleteVariantModal(true);
  };

  const handleConfirmDeleteVariant = async () => {
    try {
      setSubmitting(true);
      await adminApi.deleteVariant(deletingVariant.id);
      showToast('تم حذف المقاس بنجاح', 'success');
      setShowDeleteVariantModal(false);
      setDeletingVariant(null);
      await loadVariants(managingProduct.id);
    } catch (error) {
      const message = error.response?.data?.message || 'فشل حذف المقاس';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (variantId, currentStock) => {
    const newStock = prompt('أدخل الكمية الجديدة:', currentStock);
    if (newStock === null) return;

    const stockNum = parseInt(newStock);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('الكمية يجب أن تكون رقم غير سالب', 'error');
      return;
    }

    try {
      await adminApi.updateVariantStock(variantId, stockNum);
      showToast('تم تحديث المخزون بنجاح', 'success');
      await loadVariants(managingProduct.id);
    } catch (error) {
      showToast('فشل تحديث المخزون', 'error');
    }
  };

  // ========== IMAGE CRUD ==========

  const handleOpenAddImage = () => {
    setImageFormData({ url: '', sortOrder: '0', file: null, previewUrl: '', uploadMode: 'file' });
    setImageFormErrors({});
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageFormData({ url: '', sortOrder: '0', file: null, previewUrl: '', uploadMode: 'file' });
    setImageFormErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setImageFormErrors({ file: 'نوع الملف غير مدعوم. يجب أن يكون jpg, png, أو webp' });
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setImageFormErrors({ file: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImageFormData({ ...imageFormData, file, previewUrl });
      setImageFormErrors({});
    }
  };

  const validateImageForm = () => {
    const errors = {};
    if (imageFormData.uploadMode === 'url') {
      if (!imageFormData.url.trim()) errors.url = 'رابط الصورة مطلوب';
    } else {
      if (!imageFormData.file) errors.file = 'يرجى اختيار صورة';
    }
    setImageFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!validateImageForm()) return;

    try {
      setSubmitting(true);
      let imageUrl = imageFormData.url;

      // If file mode, upload file first
      if (imageFormData.uploadMode === 'file' && imageFormData.file) {
        setUploading(true);
        try {
          const uploadResponse = await adminApi.uploadImage(imageFormData.file);
          imageUrl = uploadResponse.data.url;
        } catch (uploadError) {
          const message = uploadError.response?.data?.message || 'فشل رفع الصورة';
          showToast(message, 'error');
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        url: imageUrl,
        sortOrder: parseInt(imageFormData.sortOrder) || 0,
      };

      await adminApi.addImage(managingProduct.id, payload);
      showToast('تم إضافة الصورة بنجاح', 'success');
      handleCloseImageModal();
      await loadImages(managingProduct.id);
      // Also refresh the products list to show updated primary image
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'فشل إضافة الصورة';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteImage = (image) => {
    setDeletingImage(image);
    setShowDeleteImageModal(true);
  };

  const handleConfirmDeleteImage = async () => {
    try {
      setSubmitting(true);
      await adminApi.deleteImage(managingProduct.id, deletingImage.id);
      showToast('تم حذف الصورة بنجاح', 'success');
      setShowDeleteImageModal(false);
      setDeletingImage(null);
      await loadImages(managingProduct.id);
      // Also refresh the products list to update primary image
      loadProducts();
    } catch (error) {
      showToast('فشل حذف الصورة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== RENDER ==========

  if (loading && page === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-12">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-ink">المنتجات</h1>
          <Button onClick={handleOpenCreateProduct}>
            إضافة منتج جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="بحث بالاسم..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
            />

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option value="">كل الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-brand-border">
            <p className="text-gray-500">لا توجد منتجات</p>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="space-y-4 sm:hidden">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-brand-border rounded-2xl p-4 flex items-start gap-4">
                  <img
                    src={getImageUrl(product.primaryImageUrl) || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-24 h-28 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.jpg'; }}
                  />
                  <div className="flex-1 text-right">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium leading-snug truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600 mt-1 truncate">{product.categoryName || '-'}</p>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-berry-500 tabular-nums">{product.minPrice ? `${product.minPrice} د.أ` : '-'}</div>
                      <button
                        onClick={() => setExpandedActionsId(expandedActionsId === product.id ? null : product.id)}
                        aria-expanded={expandedActionsId === product.id}
                        className="h-11 min-h-[44px] px-3 rounded-md bg-ivory-50 text-sm text-brand-ink flex items-center gap-2"
                      >
                        إجراءات
                        <span className="leading-none">⋯</span>
                      </button>
                    </div>

                    {expandedActionsId === product.id && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => handleOpenManage(product)} className="h-11 w-full bg-white border rounded-md text-sm">إدارة</button>
                        <button onClick={() => handleOpenEditProduct(product)} className="h-11 w-full bg-white border rounded-md text-sm">تعديل</button>
                        <button onClick={() => handleToggleProductStatus(product)} className="h-11 w-full bg-white border rounded-md text-sm">{product.active ? 'تعطيل' : 'تفعيل'}</button>
                        <button onClick={() => handleOpenDeleteProduct(product)} className="h-11 w-full bg-white border rounded-md text-sm text-red-600">حذف</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: existing table (hidden on small) */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden">
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead className="bg-brand-soft border-b border-brand-border">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">ID</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">الفئة</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">أدنى سعر</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">المقاسات</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-ink">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">#{product.id}</td>
                        <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName || '-'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-berry-500">{product.minPrice ? `${product.minPrice} دينار` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.variantCount || 0}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.active ? 'نشط' : 'غير نشط'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleOpenManage(product)} className="text-sm text-purple-600 hover:underline disabled:opacity-50" disabled={togglingId === product.id}>إدارة المقاسات والألوان</button>
                            <button onClick={() => handleOpenEditProduct(product)} className="text-sm text-blue-600 hover:underline disabled:opacity-50" disabled={togglingId === product.id}>تعديل</button>
                            <button onClick={() => handleToggleProductStatus(product)} className={`text-sm hover:underline disabled:opacity-50 ${product.active ? 'text-orange-600' : 'text-green-600'}`} disabled={togglingId === product.id}>{togglingId === product.id ? 'جاري...' : product.active ? 'تعطيل' : 'تفعيل'}</button>
                            <button onClick={() => handleOpenDeleteProduct(product)} className="text-sm text-gray-600 hover:underline disabled:opacity-50" disabled={togglingId === product.id}>حذف</button>
                            <button onClick={() => handleOpenPermanentDeleteProduct(product)} className="text-sm text-red-600 hover:underline font-semibold disabled:opacity-50" disabled={togglingId === product.id}>حذف نهائي</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
             {totalPages > 1 && (
               <div className="flex justify-center gap-2">
                 <Button
                   variant="outline"
                   onClick={() => setPage(page - 1)}
                   disabled={page === 0}
                   size="small"
                 >
                   السابق
                 </Button>
                 <span className="px-4 py-2 text-sm text-gray-600">
                   صفحة {page + 1} من {totalPages}
                 </span>
                 <Button
                   variant="outline"
                   onClick={() => setPage(page + 1)}
                   disabled={page >= totalPages - 1}
                   size="small"
                 >
                   التالي
                 </Button>
               </div>
             )}
          </>
         )}
      </div>

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCloseProductModal} disabled={submitting}>
              إلغاء
            </Button>
            <Button onClick={handleSubmitProduct} disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <Input
            label="اسم المنتج"
            value={productFormData.name}
            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
            error={productFormErrors.name}
            placeholder="مثال: فستان صيفي"
            disabled={submitting}
          />

          <Input
            label="الرابط (Slug)"
            value={productFormData.slug}
            onChange={(e) => setProductFormData({ ...productFormData, slug: e.target.value })}
            error={productFormErrors.slug}
            placeholder="مثال: summer-dress"
            hint="يستخدم في عنوان URL"
            disabled={submitting}
          />

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              value={productFormData.description}
              onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
              placeholder="وصف المنتج..."
              rows={3}
              disabled={submitting}
              className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              الفئة
            </label>
            <select
              value={productFormData.categoryId}
              onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
              disabled={submitting}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-50 ${
                productFormErrors.categoryId ? 'border-berry-300' : 'border-charcoal-200 focus:border-rose-300'
              }`}
            >
              <option value="">اختر الفئة</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {productFormErrors.categoryId && (
              <p className="text-berry-500 text-xs mt-1.5">{productFormErrors.categoryId}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="product-active"
              checked={productFormData.active}
              onChange={(e) => setProductFormData({ ...productFormData, active: e.target.checked })}
              className="w-4 h-4 text-berry-500 rounded focus:ring-2 focus:ring-rose-100"
              disabled={submitting}
            />
            <label htmlFor="product-active" className="text-sm text-gray-700">
              منتج نشط (يظهر في الموقع)
            </label>
          </div>
        </form>
      </Modal>

      {/* Product Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteProduct}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المنتج "${deletingProduct?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDestructive={true}
        isLoading={submitting}
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showPermanentDeleteModal}
        onClose={() => setShowPermanentDeleteModal(false)}
        onConfirm={handleConfirmPermanentDeleteProduct}
        title="⚠️ تحذير: حذف نهائي من قاعدة البيانات"
        message={
          <div className="space-y-2">
            <p className="font-semibold text-red-600">
              هل أنت متأكد من الحذف النهائي للمنتج "{permanentDeletingProduct?.name}"؟
            </p>
            <p className="text-sm text-gray-600">
              هذا الإجراء سيحذف المنتج وجميع مقاساته والصور المرتبطة به نهائيًا من قاعدة البيانات ولا يمكن التراجع عنه أبدًا.
            </p>
            <p className="text-sm text-red-500 font-medium">
              تحذير: قد يفشل الحذف إذا كان المنتج مرتبطًا بطلبات أو عربات شراء.
            </p>
          </div>
        }
        confirmText="نعم، احذف نهائيًا"
        cancelText="إلغاء"
        isDestructive={true}
        isLoading={submitting}
      />

      {/* Management Modal (Variants + Images) */}
      <Modal
        isOpen={showManageModal}
        onClose={handleCloseManageModal}
        title={`إدارة المقاسات والألوان: ${managingProduct?.name}`}
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setManageTab('variants')}
              className={`px-4 py-2 text-sm font-medium transition ${
                manageTab === 'variants'
                  ? 'border-b-2 border-berry-500 text-berry-600'
                  : 'text-gray-600 hover:text-berry-500'
              }`}
            >
              المقاسات والألوان ({variants.length})
            </button>
            <button
              onClick={() => setManageTab('images')}
              className={`px-4 py-2 text-sm font-medium transition ${
                manageTab === 'images'
                  ? 'border-b-2 border-berry-500 text-berry-600'
                  : 'text-gray-600 hover:text-berry-500'
              }`}
            >
              الصور ({images.length})
            </button>
          </div>

          {/* Variants Tab - Single variant creation (NO bulk/comma-separated) */}
          {manageTab === 'variants' && (
            <div className="space-y-4">
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">المتغيرات (المقاسات والألوان)</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    أضف كل متغير على حدة. كل متغير = لون واحد + مقاس واحد + سعر + كمية.
                  </p>
                </div>
                <Button onClick={handleOpenCreateVariant} size="small">
                  + إضافة متغير
                </Button>
              </div>

              {/* Variants Table */}
              {variants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">لا توجد متغيرات</p>
                  <p className="text-gray-400 text-xs mt-1">أضف متغيرات للمنتج (لون + مقاس + سعر)</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">اللون</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">المقاس</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">السعر</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">المخزون</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">الحالة</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">SKU</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5">
                              {variant.color ? (
                                <>
                                  <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: variant.color.toLowerCase().includes('أسود') || variant.color.toLowerCase().includes('black') ? '#171717' : variant.color.toLowerCase().includes('أبيض') || variant.color.toLowerCase().includes('white') ? '#fff' : undefined }} />
                                  <span className="font-medium text-purple-700">{variant.color}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {variant.size ? (
                              <span className="font-medium text-berry-600">{variant.size}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-semibold text-gray-900">{variant.price} د.أ</td>
                          <td className="px-3 py-2">
                            <span className={`font-medium ${variant.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {variant.stockQuantity}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              variant.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {variant.active ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 font-mono">{variant.sku || '-'}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdateStock(variant.id, variant.stockQuantity)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                مخزون
                              </button>
                              <button
                                onClick={() => handleOpenEditVariant(variant)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => handleOpenDeleteVariant(variant)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {manageTab === 'images' && (
            <div className="space-y-4">
              <Button onClick={handleOpenAddImage} size="small">
                إضافة صورة
              </Button>

              {images.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">لا توجد صور</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-2">
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                      />
                      <p className="text-xs text-gray-500 mb-1 truncate">{image.url}</p>
                      <p className="text-xs text-gray-500 mb-2">ترتيب: {image.sortOrder}</p>
                      <button
                        onClick={() => handleOpenDeleteImage(image)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Variant Create/Edit Modal */}
      <Modal
        isOpen={showVariantModal}
        onClose={handleCloseVariantModal}
        title={editingVariant ? 'تعديل المقاس' : 'إضافة مقاس جديد'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCloseVariantModal} disabled={submitting}>
              إلغاء
            </Button>
            <Button onClick={handleSubmitVariant} disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitVariant} className="space-y-4">
          <Input
            label="SKU (اختياري)"
            value={variantFormData.sku}
            onChange={(e) => {
              setVariantFormData({ ...variantFormData, sku: e.target.value });
              // clear SKU validation error when user edits
              if (variantFormErrors?.sku) setVariantFormErrors({ ...variantFormErrors, sku: undefined });
            }}
            placeholder="مثال: DRESS-S-RED"
            error={variantFormErrors.sku}
            disabled={submitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="المقاس (اختياري)"
              value={variantFormData.size}
              onChange={(e) => setVariantFormData({ ...variantFormData, size: e.target.value })}
              placeholder="مثال: S"
              disabled={submitting}
            />

            <Input
              label="اللون (اختياري)"
              value={variantFormData.color}
              onChange={(e) => setVariantFormData({ ...variantFormData, color: e.target.value })}
              placeholder="مثال: أحمر"
              disabled={submitting}
            />
          </div>

          <Input
            label="السعر"
            type="number"
            step="0.01"
            min="0"
            value={variantFormData.price}
            onChange={(e) => setVariantFormData({ ...variantFormData, price: e.target.value })}
            error={variantFormErrors.price}
            placeholder="مثال: 50.00"
            disabled={submitting}
          />

          <Input
            label="الكمية في المخزون"
            type="number"
            min="0"
            value={variantFormData.stockQuantity}
            onChange={(e) => setVariantFormData({ ...variantFormData, stockQuantity: e.target.value })}
            error={variantFormErrors.stockQuantity}
            placeholder="مثال: 100"
            disabled={submitting}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="variant-active"
              checked={variantFormData.active}
              onChange={(e) => setVariantFormData({ ...variantFormData, active: e.target.checked })}
              className="w-4 h-4 text-berry-500 rounded focus:ring-2 focus:ring-rose-100"
              disabled={submitting}
            />
            <label htmlFor="variant-active" className="text-sm text-gray-700">
              مقاس نشط (متاح للشراء)
            </label>
          </div>
        </form>
      </Modal>

      {/* Variant Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteVariantModal}
        onClose={() => setShowDeleteVariantModal(false)}
        onConfirm={handleConfirmDeleteVariant}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف هذا المقاس؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDestructive={true}
        isLoading={submitting}
      />

      {/* Image Add Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={handleCloseImageModal}
        title="إضافة صورة"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCloseImageModal} disabled={submitting || uploading}>
              إلغاء
            </Button>
            <Button onClick={handleSubmitImage} disabled={submitting || uploading}>
              {uploading ? 'جاري الرفع...' : submitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitImage} className="space-y-4">
          {/* Upload Mode Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setImageFormData({ ...imageFormData, uploadMode: 'file', url: '' })}
              className={`px-4 py-2 text-sm font-medium transition ${
                imageFormData.uploadMode === 'file'
                  ? 'border-b-2 border-berry-500 text-berry-600'
                  : 'text-gray-600 hover:text-berry-500'
              }`}
            >
              رفع ملف
            </button>
            <button
              type="button"
              onClick={() => setImageFormData({ ...imageFormData, uploadMode: 'url', file: null, previewUrl: '' })}
              className={`px-4 py-2 text-sm font-medium transition ${
                imageFormData.uploadMode === 'url'
                  ? 'border-b-2 border-berry-500 text-berry-600'
                  : 'text-gray-600 hover:text-berry-500'
              }`}
            >
              رابط URL
            </button>
          </div>

          {/* File Upload Mode */}
          {imageFormData.uploadMode === 'file' && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                اختر صورة
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                disabled={submitting || uploading}
                className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-berry-50 file:text-berry-600 hover:file:bg-berry-100"
              />
              <p className="text-xs text-gray-500 mt-1">الحد الأقصى 5 ميجابايت. الأنواع المدعومة: jpg, png, webp</p>
              {imageFormErrors.file && (
                <p className="text-berry-500 text-xs mt-1.5">{imageFormErrors.file}</p>
              )}

              {/* File Preview */}
              {imageFormData.previewUrl && (
                <div className="border border-gray-200 rounded-lg p-2 mt-3">
                  <p className="text-xs text-gray-600 mb-2">معاينة:</p>
                  <img
                    src={imageFormData.previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Mode */}
          {imageFormData.uploadMode === 'url' && (
            <>
              <Input
                label="رابط الصورة"
                value={imageFormData.url}
                onChange={(e) => setImageFormData({ ...imageFormData, url: e.target.value })}
                error={imageFormErrors.url}
                placeholder="https://example.com/image.jpg"
                disabled={submitting}
              />

              {imageFormData.url && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-600 mb-2">معاينة:</p>
                  <img
                    src={imageFormData.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'; }}
                  />
                </div>
              )}
            </>
          )}

          <Input
            label="الترتيب"
            type="number"
            min="0"
            value={imageFormData.sortOrder}
            onChange={(e) => setImageFormData({ ...imageFormData, sortOrder: e.target.value })}
            placeholder="0"
            hint="الصور ذات الترتيب الأقل تظهر أولاً"
            disabled={submitting || uploading}
          />
        </form>
      </Modal>

      {/* Image Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
        onConfirm={handleConfirmDeleteImage}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه الصورة؟"
        confirmText="حذف"
        cancelText="إلغاء"
        isDestructive={true}
        isLoading={submitting}
      />
    </AdminLayout>
  );
};

export default AdminProducts;

