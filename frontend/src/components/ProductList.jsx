import React from 'react';

export default function ProductList({ products, loading, error }) {
  if (loading) {
    return (
      <div className="product-list-state">
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-state error-msg">
        <p>{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-list-state empty-state">
        <p>No se encontraron productos en el catálogo.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? price : `$${num.toFixed(2)}`;
  };

  return (
    <div className="product-list-container">
      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Fecha de Creación</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="col-id">#{product.id}</td>
                <td className="col-name font-semibold">{product.name}</td>
                <td className="col-desc">{product.description || <span className="text-muted">Sin descripción</span>}</td>
                <td className="col-price">{formatPrice(product.price)}</td>
                <td className="col-stock">
                  <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {product.stock} un.
                  </span>
                </td>
                <td className="col-category">
                  <span className="category-pill">{product.category_name || `ID: ${product.category}`}</span>
                </td>
                <td className="col-date text-muted">{formatDate(product.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
