import React from 'react';

export default function ProductFilter({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
}) {
  const hasActiveFilters = Boolean(search || selectedCategory);

  return (
    <div className="product-filter-bar">
      <div className="filter-group search-group">
        <label htmlFor="search-input" className="filter-label">
          Buscar por nombre
        </label>
        <div className="input-with-icon">
          <input
            id="search-input"
            type="text"
            className="form-input filter-input"
            placeholder="Escribe el nombre del producto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group category-group">
        <label htmlFor="category-select" className="filter-label">
          Filtrar por categoría
        </label>
        <select
          id="category-select"
          className="form-input filter-input"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="filter-actions">
          <button
            type="button"
            className="btn btn-secondary clear-btn"
            onClick={onClearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
