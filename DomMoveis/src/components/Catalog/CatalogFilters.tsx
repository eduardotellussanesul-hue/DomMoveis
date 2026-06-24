import React from 'react';
import type { Category } from '../../api/categoriesApi';

interface CatalogFiltersProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    search: string;
    onSearchChange: (search: string) => void;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    search,
    onSearchChange,
}) => {
    return (
        <div className="catalog-filters">
            <div className="catalog-filters-search">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="🔍 Buscar produtos..."
                    className="catalog-search-input"
                />
            </div>

            <div className="catalog-filters-categories">
                <button
                    className={`catalog-filter-btn ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => onCategoryChange('')}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        className={`catalog-filter-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(cat._id)}
                    >
                        {cat.nome}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CatalogFilters;