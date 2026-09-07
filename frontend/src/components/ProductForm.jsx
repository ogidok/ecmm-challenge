import React, { useState } from 'react';
import { createProduct } from '../api';

export default function ProductForm({ categories, onProductCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);
    setSuccessMsg(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock === '' ? '' : parseInt(formData.stock, 10),
      category: formData.category ? parseInt(formData.category, 10) : '',
    };

    try {
      const result = await createProduct(payload);

      if (!result.success) {
        // Errores devueltos por DRF (objeto con arrays de mensajes por campo)
        if (typeof result.errors === 'object' && result.errors !== null) {
          setErrors(result.errors);
          if (result.errors.non_field_errors || result.errors.detail) {
            setGeneralError(
              result.errors.non_field_errors?.[0] || result.errors.detail || 'Ocurrió un error al guardar'
            );
          }
        } else {
          setGeneralError('Error al procesar la respuesta del servidor');
        }
      } else {
        setSuccessMsg(`¡Producto "${result.data.name}" creado con éxito!`);
        // Resetear formulario
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
        });
        if (onProductCreated) {
          onProductCreated(result.data);
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      {generalError && (
        <div className="alert alert-danger" role="alert">
          {generalError}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      <div className="form-grid">
        {/* Nombre */}
        <div className="form-group">
          <label htmlFor="prod-name">
            Nombre <span className="req">*</span>
          </label>
          <input
            id="prod-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="Ej: Teclado Mecánico RGB"
            value={formData.name}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.name && (
            <span className="field-error">
              {Array.isArray(errors.name) ? errors.name.join(' ') : errors.name}
            </span>
          )}
        </div>

        {/* Categoría */}
        <div className="form-group">
          <label htmlFor="prod-category">
            Categoría <span className="req">*</span>
          </label>
          <select
            id="prod-category"
            name="category"
            className={`form-input ${errors.category ? 'input-error' : ''}`}
            value={formData.category}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">-- Seleccionar categoría --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="field-error">
              {Array.isArray(errors.category) ? errors.category.join(' ') : errors.category}
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="form-group">
          <label htmlFor="prod-price">
            Precio <span className="req">*</span>
          </label>
          <input
            id="prod-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            className={`form-input ${errors.price ? 'input-error' : ''}`}
            placeholder="0.00"
            value={formData.price}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.price && (
            <span className="field-error">
              {Array.isArray(errors.price) ? errors.price.join(' ') : errors.price}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="form-group">
          <label htmlFor="prod-stock">
            Stock <span className="req">*</span>
          </label>
          <input
            id="prod-stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            className={`form-input ${errors.stock ? 'input-error' : ''}`}
            placeholder="0"
            value={formData.stock}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.stock && (
            <span className="field-error">
              {Array.isArray(errors.stock) ? errors.stock.join(' ') : errors.stock}
            </span>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="form-group full-width">
        <label htmlFor="prod-desc">Descripción (opcional)</label>
        <textarea
          id="prod-desc"
          name="description"
          rows="3"
          className="form-input"
          placeholder="Detalles sobre el producto..."
          value={formData.description}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.description && (
          <span className="field-error">
            {Array.isArray(errors.description) ? errors.description.join(' ') : errors.description}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
