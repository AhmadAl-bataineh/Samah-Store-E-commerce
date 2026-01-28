import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import { ProductCard } from '../components/products/ProductCard';
import FiltersSidebar from '../components/products/FiltersSidebar';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { productsApi } from '../services/productsApi';
import { useToast } from '../context/ToastContext';
import { Search, SlidersHorizontal } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const { error } = useToast();

  // SEO: Update page meta
  useEffect(() => {
    const q = searchParams.get('q');
    updatePageMeta({
      title: q ? `نتائج البحث: ${q}` : 'جميع المنتجات',
      description: q
        ? `نتائج البحث عن "${q}" في سماح ستور - تسوقي أزياء نسائية عصرية`
        : 'تصفحي جميع منتجات سماح ستور - أزياء نسائية عصرية وأنيقة بأفضل الأسعار',
      url: `/products${window.location.search}`,
    });
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 12,
      };

      const q = searchParams.get('q');
      const categoryId = searchParams.get('categoryId');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const sort = searchParams.get('sort');

      if (q) params.q = q;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (sort) params.sort = sort;

      const data = await productsApi.getProducts(params);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      error('فشل في تحميل المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchParams.set('q', searchQuery.trim());
      } else {
        searchParams.delete('q');
      }
      setSearchParams(searchParams);
      setCurrentPage(0);
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSortChange = (sortValue) => {
    if (sortValue) {
      searchParams.set('sort', sortValue);
    } else {
      searchParams.delete('sort');
    }
    setSearchParams(searchParams);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-8" data-ui="products-page-root">
      <Container>
        <SectionTitle>المنتجات</SectionTitle>

        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحثي عن المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 input-field"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-outline flex items-center gap-2 justify-center"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>فلاتر</span>
          </button>
          <select
            onChange={(e) => handleSortChange(e.target.value)}
            defaultValue={searchParams.get('sort') || ''}
            className="input-field md:w-64"
          >
            <option value="">الترتيب الافتراضي</option>
            <option value="createdAt,desc">الأحدث</option>
            <option value="minVariantPrice,asc">السعر: من الأقل للأعلى</option>
            <option value="minVariantPrice,desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${showFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}
            data-ui="filters-drawer-root"
          >
            <FiltersSidebar
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onFilterChange={() => setCurrentPage(0)}
            />
            <button
              onClick={() => setShowFilters(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              إغلاق
            </button>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] sm:aspect-[4/5] rounded-xl sm:rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <EmptyState
                title="لا توجد منتجات"
                message="لم نجد أي منتجات تطابق معايير البحث. جربي البحث بكلمات مختلفة."
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductsPage;
