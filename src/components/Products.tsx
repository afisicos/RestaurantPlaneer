import { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { storageService } from '../utils/storage';
import { calculateProductCost } from '../utils/calculations';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState(storageService.getEmployees());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    preparationTime: '',
    storageRequired: '',
    employeeHoursRequired: '',
  });

  useEffect(() => {
    loadProducts();
    loadEmployees();
  }, []);


  // Scroll automático al editar un producto
  useEffect(() => {
    if (showForm && editingProduct && formRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showForm, editingProduct]);

  const loadProducts = () => {
    setProducts(storageService.getProducts());
  };

  const loadEmployees = () => {
    setEmployees(storageService.getEmployees());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      preparationTime: parseFloat(formData.preparationTime),
      storageRequired: parseFloat(formData.storageRequired),
      employeeHoursRequired: parseFloat(formData.employeeHoursRequired),
      ingredients: editingProduct?.ingredients || [],
    };

    const updatedProducts = editingProduct
      ? products.map(p => p.id === editingProduct.id ? product : p)
      : [...products, product];

    storageService.saveProducts(updatedProducts);
    loadProducts();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      preparationTime: '',
      storageRequired: '',
      employeeHoursRequired: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      preparationTime: product.preparationTime.toString(),
      storageRequired: product.storageRequired.toString(),
      employeeHoursRequired: product.employeeHoursRequired.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      storageService.saveProducts(updatedProducts);
      loadProducts();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Product Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="form-card">
          <h2>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Storage Required (m³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.storageRequired}
                  onChange={(e) => setFormData({ ...formData, storageRequired: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Employee Hours Required</label>
              <input
                type="number"
                step="0.1"
                value={formData.employeeHoursRequired}
                onChange={(e) => setFormData({ ...formData, employeeHoursRequired: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => {
          const cost = calculateProductCost(product, employees);
          const margin = product.price - cost;
          const marginPercentage = (margin / product.price) * 100;

          return (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <div className="product-actions">
                  <button className="btn-icon" onClick={() => handleEdit(product)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(product.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              <div className="product-info">
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Price:</strong> {formatCurrency(product.price)}</p>
                <p><strong>Estimated Cost:</strong> {formatCurrency(cost)}</p>
                <p><strong>Margin:</strong>
                  <span className={margin >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(margin)} ({marginPercentage.toFixed(1)}%)
                  </span>
                </p>
                <p><strong>Prep Time:</strong> {product.preparationTime} min</p>
                <p><strong>Storage:</strong> {product.storageRequired} m³</p>
                <p><strong>Employee Hours:</strong> {product.employeeHoursRequired}h</p>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <p>No products registered. Create your first product to get started.</p>
        </div>
      )}
    </div>
  );
}

