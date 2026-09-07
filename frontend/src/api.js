const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.category) {
    params.append('category', filters.category);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/products/${query}`);
  if (!response.ok) {
    throw new Error(`Error al obtener los productos (HTTP ${response.status})`);
  }
  return response.json();
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories/`);
  if (!response.ok) {
    throw new Error(`Error al obtener las categorías (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();
  if (!response.ok) {
    return { success: false, errors: data, status: response.status };
  }
  return { success: true, data };
}
