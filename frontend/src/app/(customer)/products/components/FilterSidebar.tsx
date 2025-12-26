// frontend/src/app/(customer)/products/components/FilterSidebar.tsx
"use client";

import React, { useState } from "react";
import CircleCheckbox from "@/components/ui/CircleCheckbox";

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface FilterState {
  selectedCategories: string[];
  selectedSuppliers: string[];
  minPrice: string;
  maxPrice: string;
  searchQuery: string;
}

interface FilterSidebarProps {
  categories: Category[];
  suppliers: Supplier[];
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  suppliers,
  filterState,
  onFilterChange,
  onClearFilters,
}) => {
  const [showPromotionDetail, setShowPromotionDetail] = useState(false);

  const handleCategorySelect = (categoryName: string) => {
    const newCategories = filterState.selectedCategories.includes(categoryName)
      ? filterState.selectedCategories.filter((cat) => cat !== categoryName)
      : [...filterState.selectedCategories, categoryName];

    onFilterChange({ selectedCategories: newCategories });
  };

  const handleSupplierSelect = (supplierName: string) => {
    const newSuppliers = filterState.selectedSuppliers.includes(supplierName)
      ? filterState.selectedSuppliers.filter((sup) => sup !== supplierName)
      : [...filterState.selectedSuppliers, supplierName];

    onFilterChange({ selectedSuppliers: newSuppliers });
  };

  const handleApplyPriceFilter = () => {
    onFilterChange({
      minPrice: filterState.minPrice,
      maxPrice: filterState.maxPrice,
    });
  };

  const hasActiveFilters =
    filterState.selectedCategories.length > 0 ||
    filterState.selectedSuppliers.length > 0 ||
    filterState.minPrice ||
    filterState.maxPrice;

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* Categories Filter */}
      <div className="bg-white rounded-[25px] shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
        <ul className="space-y-3">
          <li>
            <CircleCheckbox
              label="Tất cả"
              checked={filterState.selectedCategories.length === 0}
              onChange={() => onFilterChange({ selectedCategories: [] })}
            />
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <CircleCheckbox
                label={cat.name}
                checked={filterState.selectedCategories.includes(cat.name)}
                onChange={() => handleCategorySelect(cat.name)}
              />
            </li>
          ))}
        </ul>
        {filterState.selectedCategories.length > 0 && (
          <div className="mt-3 text-sm text-green-600">
            Đã chọn: {filterState.selectedCategories.length} danh mục
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="bg-white rounded-[25px] p-6 shadow space-y-4">
        <h3 className="font-semibold">Khoảng giá</h3>
        <div className="flex gap-2">
          <input
            placeholder="$Min"
            className="w-1/2 border rounded-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={filterState.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            type="number"
            min="0"
          />
          <input
            placeholder="$Max"
            className="w-1/2 border rounded-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={filterState.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            type="number"
            min="0"
          />
        </div>
        <button
          className="w-full bg-green-100 text-green-700 py-2 rounded-full font-semibold hover:bg-green-200 transition"
          onClick={handleApplyPriceFilter}
        >
          Áp dụng
        </button>
        {(filterState.minPrice || filterState.maxPrice) && (
          <div className="text-sm text-gray-500 text-center">
            ${filterState.minPrice || "0"} - ${filterState.maxPrice || "∞"}
          </div>
        )}
      </div>

      {/* Suppliers Filter */}
      <div className="bg-white rounded-[25px] p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Nhà cung cấp</h3>
        <ul className="space-y-3">
          <li>
            <CircleCheckbox
              label="Tất cả"
              checked={filterState.selectedSuppliers.length === 0}
              onChange={() => onFilterChange({ selectedSuppliers: [] })}
            />
          </li>
          {suppliers.map((supplier) => (
            <li key={supplier.id}>
              <CircleCheckbox
                label={supplier.name}
                checked={filterState.selectedSuppliers.includes(supplier.name)}
                onChange={() => handleSupplierSelect(supplier.name)}
              />
            </li>
          ))}
        </ul>
        {filterState.selectedSuppliers.length > 0 && (
          <div className="mt-3 text-sm text-green-600">
            Đã chọn: {filterState.selectedSuppliers.length} nhà cung cấp
          </div>
        )}
      </div>

      {/* Promotion Banner */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[25px] p-6 text-white relative">
        <div className="text-sm font-medium text-green-400 mb-2">
          ƯU ĐÃI ĐẶC BIỆT
        </div>
        <h3 className="text-lg font-bold mb-3 leading-tight">
          Giảm 20% phí vận chuyển cho đơn hàng đầu tiên
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Áp dụng cho tất cả khách hàng mới
        </p>
        <button
          className="text-green-400 text-sm font-semibold hover:text-green-300 flex items-center"
          onClick={() => setShowPromotionDetail(true)}
        >
          Tìm hiểu ngay →
        </button>
      </div>

      {/* Promotion Detail Modal */}
      {showPromotionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[25px] max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Chi tiết ưu đãi
              </h3>
              <button
                onClick={() => setShowPromotionDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-[20px] p-4">
                <h4 className="font-bold text-green-700 text-lg mb-2">
                  Giảm 20% phí vận chuyển
                </h4>
                <p className="text-gray-700">
                  Áp dụng cho đơn hàng đầu tiên của khách hàng mới
                </p>
              </div>
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">
                  Điều kiện áp dụng:
                </h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Áp dụng cho tất cả khách hàng đăng ký mới</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Chỉ áp dụng cho đơn hàng đầu tiên</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Không áp dụng kèm các chương trình khuyến mãi khác
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Thời hạn: 30 ngày kể từ ngày đăng ký</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <button
                  className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition"
                  onClick={() => setShowPromotionDetail(false)}
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full py-3 border-2 border-red-200 text-red-600 rounded-full font-semibold hover:bg-red-50 transition"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </aside>
  );
};

export default FilterSidebar;
