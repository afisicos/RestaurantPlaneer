import {
  importProductsFromCSV,
  importEmployeesFromCSV,
  importSalesFromCSV,
  importExpensesFromCSV,
} from './csvImporter';

const FIRST_LOAD_KEY = 'hosteleria_first_load_completed';

/**
 * Verifica si es la primera carga de la aplicación
 */
export function isFirstLoad(): boolean {
  return localStorage.getItem(FIRST_LOAD_KEY) !== 'true';
}

/**
 * Marca que la primera carga ya se completó
 */
export function markFirstLoadCompleted(): void {
  localStorage.setItem(FIRST_LOAD_KEY, 'true');
}

/**
 * Importa automáticamente los CSV de ejemplo en la primera carga
 */
export async function autoImportExampleData(): Promise<void> {
  // SIEMPRE importar los datos para asegurar que sean los más recientes
  // Eliminamos la condición de primera carga para forzar actualización

  // Clear existing data to force reload from new CSV
  const { storageService } = await import('./storage');
  storageService.saveSales([]);
  storageService.saveEmployees([]);
  storageService.saveProducts([]);
  storageService.saveExpenses([]);

  try {
    console.log('🔄 Importing sample data...');

    // Import products
    const productsResponse = await fetch('/data/productos.csv');
    if (productsResponse.ok) {
      const productsText = await productsResponse.text();
      console.log('📦 Importing products...', productsText.substring(0, 100) + '...');
      const result = importProductsFromCSV(productsText, false);
      console.log('📦 Products imported:', result.success);
    }

    // Import employees
    const employeesResponse = await fetch('/data/empleados.csv');
    if (employeesResponse.ok) {
      const employeesText = await employeesResponse.text();
      console.log('👥 Importing employees...', employeesText.substring(0, 100) + '...');
      const result = importEmployeesFromCSV(employeesText, false);
      console.log('👥 Employees imported:', result.success);
    }

    // Import sales
    const salesResponse = await fetch('/data/ventas.csv');
    if (salesResponse.ok) {
      const salesText = await salesResponse.text();
      console.log('💰 Importing sales...');
      const result = importSalesFromCSV(salesText, false);
      console.log('💰 Sales imported:', result.success);
    }

    // Import expenses
    const expensesResponse = await fetch('/data/gastos.csv');
    if (expensesResponse.ok) {
      const expensesText = await expensesResponse.text();
      console.log('📊 Importing expenses...');
      const result = importExpensesFromCSV(expensesText, false);
      console.log('📊 Expenses imported:', result.success);
    }

    if (!isFirstLoad()) {
      console.log('✅ Datos actualizados');
    } else {
      markFirstLoadCompleted();
      console.log('🎉 Primera importación completada');
    }

    // Forzar actualización del dashboard
    console.log('🔄 Disparando evento dataImported...');
    window.dispatchEvent(new Event('dataImported'));

  } catch (error) {
    console.error('❌ Error importing sample data:', error);
  }
}
