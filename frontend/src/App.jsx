import { useState, useEffect } from 'react';
import { fetchProducts } from './api';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <h1>Catálogo de Productos</h1>
          <p className="subtitle">Gestión simple y centralizada del catálogo</p>
        </div>
      </header>

      <main className="app-main">
        <section className="catalog-section">
          <div className="section-header">
            <h2>Listado de Productos</h2>
            <span className="count-badge">{products.length} productos</span>
          </div>

          <ProductList
            products={products}
            loading={loading}
            error={error}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
