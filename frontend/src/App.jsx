import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchCategories } from './api';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ProductFilter from './components/ProductFilter';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const loadProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  // Efecto con debounce para búsqueda y filtro
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts({
        search: search.trim(),
        category: selectedCategory,
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [search, selectedCategory, loadProducts]);

  const handleProductCreated = () => {
    loadProducts({
      search: search.trim(),
      category: selectedCategory,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <h1>Catálogo de Productos</h1>
          <p className="subtitle">Gestión simple y centralizada del catálogo</p>
        </div>
      </header>

      <main className="app-main">
        {/* Formulario de Creación */}
        <section className="form-section card-box">
          <div className="section-header">
            <div>
              <h2>Crear Producto</h2>
              <p className="section-desc">Ingresa los datos para registrar un nuevo producto</p>
            </div>
          </div>
          <ProductForm
            categories={categories}
            onProductCreated={handleProductCreated}
          />
        </section>

        {/* Listado de Productos */}
        <section className="catalog-section card-box">
          <div className="section-header">
            <div>
              <h2>Listado de Productos</h2>
              <p className="section-desc">Productos registrados en el catálogo</p>
            </div>
            <span className="count-badge">{products.length} productos</span>
          </div>

          <ProductFilter
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onClearFilters={handleClearFilters}
          />

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
