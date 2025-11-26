import { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { storageService } from '../utils/storage';
import './Expenses.css';

export default function Expenses({ onDataCreated }: { onDataCreated?: () => void }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Alquiler',
    'Suministros',
    'Materias Primas',
    'Equipamiento',
    'Mantenimiento',
    'Marketing',
    'Otros',
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  // Escuchar evento del tutorial para abrir formulario automáticamente
  useEffect(() => {
    const handleTutorialInteractive = (e: CustomEvent) => {
      if (e.detail?.stepType === 'expenseCreated') {
        setShowForm(true);
      }
    };

    window.addEventListener('tutorialEnterInteractive', handleTutorialInteractive as EventListener);
    return () => {
      window.removeEventListener('tutorialEnterInteractive', handleTutorialInteractive as EventListener);
    };
  }, []);

  const loadExpenses = () => {
    setExpenses(storageService.getExpenses());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date),
    };

    const updatedExpenses = editingExpense
      ? expenses.map(e => e.id === editingExpense.id ? expense : e)
      : [...expenses, expense];

    storageService.saveExpenses(updatedExpenses);
    loadExpenses();
    resetForm();
    if (!editingExpense && onDataCreated) {
      onDataCreated();
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      const updatedExpenses = expenses.filter(e => e.id !== id);
      storageService.saveExpenses(updatedExpenses);
      loadExpenses();
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

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Gestión de Gastos</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Gasto'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cantidad (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingExpense ? 'Actualizar' : 'Registrar'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="expenses-summary">
        <h2>Resumen por Categoría</h2>
        <div className="summary-grid">
          {Object.entries(expensesByCategory).map(([category, total]) => (
            <div key={category} className="summary-card">
              <h3>{category}</h3>
              <p className="summary-amount">{formatCurrency(total)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="expenses-table-card">
        <h2>Historial de Gastos</h2>
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.description}</td>
                    <td><span className="category-badge">{expense.category}</span></td>
                    <td><strong>{formatCurrency(expense.amount)}</strong></td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(expense)}>
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(expense.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="empty-state">
          <p>No hay gastos registrados. Registra tu primer gasto para comenzar.</p>
        </div>
      )}
    </div>
  );
}

