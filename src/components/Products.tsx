import { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { storageService } from '../utils/storage';
import { calculateProductCost } from '../utils/calculations';
import './Products.css';

export default function Products({ onDataCreated }: { onDataCreated?: () => void }) {
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

  // Escuchar evento del tutorial para abrir formulario automáticamente
  useEffect(() => {
    const handleTutorialInteractive = (e: CustomEvent) => {
      if (e.detail?.stepType === 'productCreated') {
        setShowForm(true);
        setTimeout(() => {
          formRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    };

    window.addEventListener('tutorialEnterInteractive', handleTutorialInteractive as EventListener);
    return () => {
      window.removeEventListener('tutorialEnterInteractive', handleTutorialInteractive as EventListener);
    };
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
    if (!editingProduct && onDataCreated) {
      onDataCreated();
    }
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
    if (confirm('¿Estás seguro de eliminar este producto?')) {
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
        <h1>Gestión de Productos</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="form-card">
          <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
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
                <label>Tiempo de Preparación (minutos)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Almacenaje Requerido (m³)</label>
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
              <label>Horas de Empleado Requeridas</label>
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
                {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
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
                <p><strong>Categoría:</strong> {product.category}</p>
                <p><strong>Precio:</strong> {formatCurrency(product.price)}</p>
                <p><strong>Costo Estimado:</strong> {formatCurrency(cost)}</p>
                <p><strong>Margen:</strong> 
                  <span className={margin >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(margin)} ({marginPercentage.toFixed(1)}%)
                  </span>
                </p>
                <p><strong>Tiempo Prep:</strong> {product.preparationTime} min</p>
                <p><strong>Almacenaje:</strong> {product.storageRequired} m³</p>
                <p><strong>Horas Empleado:</strong> {product.employeeHoursRequired}h</p>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <p>No hay productos registrados. Crea tu primer producto para comenzar.</p>
        </div>
      )}
    </div>
  );
}

