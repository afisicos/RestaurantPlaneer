import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readFileAsText } from '../utils/csvParser';
import {
  importProductsFromCSV,
  importEmployeesFromCSV,
  importSalesFromCSV,
  importExpensesFromCSV,
} from '../utils/csvImporter';
import { storageService } from '../utils/storage';
import './ImportData.css';

type ImportType = 'products' | 'employees' | 'sales' | 'expenses';

interface ImportResult {
  type: ImportType;
  success: number;
  errors: string[];
}

export default function ImportData() {
  const navigate = useNavigate();
  const [importType, setImportType] = useState<ImportType>('products');
  const [mergeMode, setMergeMode] = useState(true);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResults([]);

    try {
      const csvText = await readFileAsText(file);
      let result: ImportResult;

      switch (importType) {
        case 'products':
          result = {
            type: 'products',
            ...importProductsFromCSV(csvText, mergeMode),
          };
          break;
        case 'employees':
          result = {
            type: 'employees',
            ...importEmployeesFromCSV(csvText, mergeMode),
          };
          break;
        case 'sales':
          result = {
            type: 'sales',
            ...importSalesFromCSV(csvText, mergeMode),
          };
          break;
        case 'expenses':
          result = {
            type: 'expenses',
            ...importExpensesFromCSV(csvText, mergeMode),
          };
          break;
        default:
          throw new Error('Invalid import type');
      }

      setResults([result]);
      
      // Si la importación fue exitosa, disparar evento y redirigir al dashboard
      if (result.success > 0 && result.errors.length === 0) {
        // Disparar evento personalizado para actualizar el dashboard
        window.dispatchEvent(new Event('dataImported'));
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      setResults([{
        type: importType,
        success: 0,
        errors: [`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }]);
    } finally {
      setIsImporting(false);
      // Resetear el input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = '';
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true);
    setResults([]);
    const allResults: ImportResult[] = [];

    try {
      // Import products
      try {
        const productsResponse = await fetch('/data/productos.csv');
        if (productsResponse.ok) {
          const productsText = await productsResponse.text();
          const result = {
            type: 'products' as ImportType,
            ...importProductsFromCSV(productsText, mergeMode),
          };
          allResults.push(result);
        }
      } catch (error) {
        allResults.push({
          type: 'products',
          success: 0,
          errors: ['Could not load productos.csv. Make sure the file exists in /data/'],
        });
      }

      // Import employees
      try {
        const employeesResponse = await fetch('/data/empleados.csv');
        if (employeesResponse.ok) {
          const employeesText = await employeesResponse.text();
          const result = {
            type: 'employees' as ImportType,
            ...importEmployeesFromCSV(employeesText, mergeMode),
          };
          allResults.push(result);
        }
      } catch (error) {
        allResults.push({
          type: 'employees',
          success: 0,
          errors: ['Could not load empleados.csv. Make sure the file exists in /data/'],
        });
      }

      // Import sales
      try {
        const salesResponse = await fetch('/data/ventas.csv');
        if (salesResponse.ok) {
          const salesText = await salesResponse.text();
          const result = {
            type: 'sales' as ImportType,
            ...importSalesFromCSV(salesText, mergeMode),
          };
          allResults.push(result);
        }
      } catch (error) {
        allResults.push({
          type: 'sales',
          success: 0,
          errors: ['Could not load ventas.csv. Make sure the file exists in /data/'],
        });
      }

      // Import expenses
      try {
        const expensesResponse = await fetch('/data/gastos.csv');
        if (expensesResponse.ok) {
          const expensesText = await expensesResponse.text();
          const result = {
            type: 'expenses' as ImportType,
            ...importExpensesFromCSV(expensesText, mergeMode),
          };
          allResults.push(result);
        }
      } catch (error) {
        allResults.push({
          type: 'expenses',
          success: 0,
          errors: ['Could not load gastos.csv. Make sure the file exists in /data/'],
        });
      }

      setResults(allResults);

      // Si todas las importaciones fueron exitosas, disparar evento y redirigir al dashboard
      const allSuccessful = allResults.every(r => r.success > 0 && r.errors.length === 0);
      if (allSuccessful) {
        // Disparar evento personalizado para actualizar el dashboard
        window.dispatchEvent(new Event('dataImported'));
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      setResults([{
        type: 'products',
        success: 0,
        errors: [`General error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }]);
    } finally {
      setIsImporting(false);
    }
  };

  const getTypeLabel = (type: ImportType): string => {
    switch (type) {
      case 'products': return 'Products';
      case 'employees': return 'Employees';
      case 'sales': return 'Sales';
      case 'expenses': return 'Expenses';
    }
  };

  return (
    <div className="import-page">
      <div className="page-header">
        <h1>Import Data from CSV</h1>
      </div>

      <div className="import-container">
        <div className="import-card">
          <h2>Import Configuration</h2>
          
          <div className="form-group">
            <label>Data Type</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as ImportType)}
              disabled={isImporting}
            >
              <option value="products">Products</option>
              <option value="employees">Employees</option>
              <option value="sales">Sales</option>
              <option value="expenses">Expenses</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={mergeMode}
                onChange={(e) => setMergeMode(e.target.checked)}
                disabled={isImporting}
              />
              <span>Merge with existing data (update and add)</span>
            </label>
            <p className="help-text">
              If enabled, it will update existing records with the same ID and add new ones. 
              If disabled, it will replace all existing data of the selected type.
            </p>
          </div>

          <div className="import-actions">
            <div className="file-upload-section">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="file-input"
                />
                <span className="file-upload-button">
                  {isImporting ? 'Importing...' : `Select ${getTypeLabel(importType)} CSV file`}
                </span>
              </label>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="btn-secondary btn-large"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This will delete all products, employees, sales, and expenses from localStorage.')) {
                    storageService.clearAll();
                    window.dispatchEvent(new Event('dataImported'));
                    alert('LocalStorage cleared! Please refresh the page or import data again.');
                  }
                }}
                disabled={isImporting}
              >
                🗑️ Clear All Data (LocalStorage)
              </button>
              
              <button
                className="btn-primary btn-large"
                onClick={handleImportAll}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import All Sample Files'}
              </button>
            </div>
            <p className="help-text">
              This will automatically import productos.csv, empleados.csv, ventas.csv and gastos.csv from the /data/ folder
            </p>
          </div>
        </div>

        {results.length > 0 && (
          <div className="results-card">
            <h2>Import Results</h2>
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.errors.length > 0 ? 'error' : 'success'}`}>
                <h3>{getTypeLabel(result.type)}</h3>
                {result.success > 0 && (
                  <p className="success-message">
                    ✅ {result.success} {result.success === 1 ? 'record imported' : 'records imported'} successfully
                  </p>
                )}
                {result.errors.length > 0 && (
                  <div className="errors">
                    {result.errors.map((error, i) => (
                      <p key={i} className="error-message">❌ {error}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {results.every(r => r.success > 0 && r.errors.length === 0) && (
              <div className="success-banner">
                <p>🎉 Import completed successfully! Redirecting to dashboard...</p>
              </div>
            )}
          </div>
        )}

        <div className="info-card">
          <h3>📋 CSV File Format</h3>
          <div className="format-info">
            <div>
              <strong>productos.csv:</strong>
              <code>id,nombre,precio,categoria,tiempoPreparacion,almacenajeRequerido,horasEmpleadoRequeridas</code>
            </div>
            <div>
              <strong>empleados.csv:</strong>
              <code>id,nombre,rol,tarifaHora,horasSemana</code>
            </div>
            <div>
              <strong>ventas.csv:</strong>
              <code>id,productoId,cantidad,precio,fecha,empleadoId</code>
            </div>
            <div>
              <strong>gastos.csv:</strong>
              <code>id,descripcion,cantidad,categoria,fecha</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

