import { useState, useEffect } from 'react';
import type { Sale, Product, Employee } from '../types';
import { storageService } from '../utils/storage';
import './Sales.css';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    price: '',
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);


  const loadData = () => {
    setSales(storageService.getSales());
    setProducts(storageService.getProducts());
    setEmployees(storageService.getEmployees());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProduct = products.find(p => p.id === formData.productId);
    const salePrice = formData.price ? parseFloat(formData.price) : (selectedProduct?.price || 0);

    const sale: Sale = {
      id: Date.now().toString(),
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      price: salePrice,
      date: new Date(formData.date),
      employeeId: formData.employeeId,
    };

    const updatedSales = [...sales, sale];
    storageService.saveSales(updatedSales);
    loadData();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      price: '',
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      const updatedSales = sales.filter(s => s.id !== id);
      storageService.saveSales(updatedSales);
      loadData();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      price: product ? product.price.toString() : '',
    });
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Sales Registration</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Sale'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>New Sale</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Unit Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {formData.productId && formData.quantity && formData.price && (
              <div className="form-total">
                <strong>Total: {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.price))}</strong>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Register Sale
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sales-table-card">
        <h2>Sales History</h2>
        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((sale) => {
                  const product = products.find(p => p.id === sale.productId);
                  const employee = employees.find(e => e.id === sale.employeeId);
                  const total = sale.price * sale.quantity;

                  return (
                    <tr key={sale.id}>
                      <td>{formatDate(sale.date)}</td>
                      <td>{product?.name || 'N/A'}</td>
                      <td>{sale.quantity}</td>
                      <td>{formatCurrency(sale.price)}</td>
                      <td><strong>{formatCurrency(total)}</strong></td>
                      <td>{employee?.name || 'N/A'}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleDelete(sale.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {sales.length === 0 && (
        <div className="empty-state">
          <p>No sales registered. Register your first sale to get started.</p>
        </div>
      )}
    </div>
  );
}

