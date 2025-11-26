import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readFileAsText } from '../utils/csvParser';
import {
  importProductsFromCSV,
  importEmployeesFromCSV,
  importSalesFromCSV,
  importExpensesFromCSV,
} from '../utils/csvImporter';
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
          throw new Error('Tipo de importación no válido');
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
        errors: [`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`],
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
      // Importar productos
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
          errors: ['No se pudo cargar productos.csv. Asegúrate de que el archivo existe en /data/'],
        });
      }

      // Importar empleados
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
          errors: ['No se pudo cargar empleados.csv. Asegúrate de que el archivo existe en /data/'],
        });
      }

      // Importar ventas
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
          errors: ['No se pudo cargar ventas.csv. Asegúrate de que el archivo existe en /data/'],
        });
      }

      // Importar gastos
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
          errors: ['No se pudo cargar gastos.csv. Asegúrate de que el archivo existe en /data/'],
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
        errors: [`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`],
      }]);
    } finally {
      setIsImporting(false);
    }
  };

  const getTypeLabel = (type: ImportType): string => {
    switch (type) {
      case 'products': return 'Productos';
      case 'employees': return 'Empleados';
      case 'sales': return 'Ventas';
      case 'expenses': return 'Gastos';
    }
  };

  return (
    <div className="import-page">
      <div className="page-header">
        <h1>Importar Datos desde CSV</h1>
      </div>

      <div className="import-container">
        <div className="import-card">
          <h2>Configuración de Importación</h2>
          
          <div className="form-group">
            <label>Tipo de Datos</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as ImportType)}
              disabled={isImporting}
            >
              <option value="products">Productos</option>
              <option value="employees">Empleados</option>
              <option value="sales">Ventas</option>
              <option value="expenses">Gastos</option>
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
              <span>Fusionar con datos existentes (actualizar y agregar)</span>
            </label>
            <p className="help-text">
              Si está activado, actualizará los registros existentes con el mismo ID y agregará los nuevos. 
              Si está desactivado, reemplazará todos los datos existentes del tipo seleccionado.
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
                  {isImporting ? 'Importando...' : `Seleccionar archivo CSV de ${getTypeLabel(importType)}`}
                </span>
              </label>
            </div>

            <div className="divider">
              <span>O</span>
            </div>

            <button
              className="btn-primary btn-large"
              onClick={handleImportAll}
              disabled={isImporting}
            >
              {isImporting ? 'Importando...' : 'Importar Todos los Archivos de Ejemplo'}
            </button>
            <p className="help-text">
              Esto importará automáticamente productos.csv, empleados.csv, ventas.csv y gastos.csv desde la carpeta /data/
            </p>
          </div>
        </div>

        {results.length > 0 && (
          <div className="results-card">
            <h2>Resultados de la Importación</h2>
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.errors.length > 0 ? 'error' : 'success'}`}>
                <h3>{getTypeLabel(result.type)}</h3>
                {result.success > 0 && (
                  <p className="success-message">
                    ✅ {result.success} {result.success === 1 ? 'registro importado' : 'registros importados'} correctamente
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
                <p>🎉 ¡Importación completada exitosamente! Redirigiendo al dashboard...</p>
              </div>
            )}
          </div>
        )}

        <div className="info-card">
          <h3>📋 Formato de Archivos CSV</h3>
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
          <p className="note">
            💡 Los archivos de ejemplo están disponibles en la carpeta <code>data/</code> del proyecto.
          </p>
        </div>
      </div>
    </div>
  );
}

