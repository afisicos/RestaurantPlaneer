import { useState, useEffect } from 'react';
import type { Employee } from '../types';
import { storageService } from '../utils/storage';
import './Employees.css';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    hourlyRate: '',
    hoursPerWeek: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);


  const loadEmployees = () => {
    setEmployees(storageService.getEmployees());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: formData.name,
      role: formData.role,
      hourlyRate: parseFloat(formData.hourlyRate),
      hoursPerWeek: parseFloat(formData.hoursPerWeek),
    };

    const updatedEmployees = editingEmployee
      ? employees.map(e => e.id === editingEmployee.id ? employee : e)
      : [...employees, employee];

    storageService.saveEmployees(updatedEmployees);
    loadEmployees();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      hourlyRate: '',
      hoursPerWeek: '',
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      hourlyRate: employee.hourlyRate.toString(),
      hoursPerWeek: employee.hoursPerWeek.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(e => e.id !== id);
      storageService.saveEmployees(updatedEmployees);
      loadEmployees();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Employee'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingEmployee ? 'Edit Employee' : 'New Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role/Position</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hourly Rate (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hours per Week</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingEmployee ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employees-grid">
        {employees.map((employee) => {
          const weeklyCost = employee.hourlyRate * employee.hoursPerWeek;
          const monthlyCost = weeklyCost * 4.33;

          return (
            <div key={employee.id} className="employee-card">
              <div className="employee-header">
                <h3>{employee.name}</h3>
                <div className="employee-actions">
                  <button className="btn-icon" onClick={() => handleEdit(employee)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(employee.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              <div className="employee-info">
                <p><strong>Role:</strong> {employee.role}</p>
                <p><strong>Hourly Rate:</strong> {formatCurrency(employee.hourlyRate)}</p>
                <p><strong>Hours/Week:</strong> {employee.hoursPerWeek}h</p>
                <p><strong>Weekly Cost:</strong> {formatCurrency(weeklyCost)}</p>
                <p><strong>Estimated Monthly Cost:</strong> {formatCurrency(monthlyCost)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && (
        <div className="empty-state">
          <p>No employees registered. Add your first employee to get started.</p>
        </div>
      )}
    </div>
  );
}

