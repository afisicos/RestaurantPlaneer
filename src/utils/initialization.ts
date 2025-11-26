import {
  importProductsFromCSV,
  importEmployeesFromCSV,
  importSalesFromCSV,
  importExpensesFromCSV,
} from './csvImporter';
import { storageService } from './storage';

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
  if (!isFirstLoad()) {
    return; // Ya se importó antes
  }

  try {
    // Importar productos
    const productsResponse = await fetch('/data/productos.csv');
    if (productsResponse.ok) {
      const productsText = await productsResponse.text();
      importProductsFromCSV(productsText, false);
    }

    // Importar empleados
    const employeesResponse = await fetch('/data/empleados.csv');
    if (employeesResponse.ok) {
      const employeesText = await employeesResponse.text();
      importEmployeesFromCSV(employeesText, false);
    }

    // Importar ventas
    const salesResponse = await fetch('/data/ventas.csv');
    if (salesResponse.ok) {
      const salesText = await salesResponse.text();
      importSalesFromCSV(salesText, false);
    }

    // Importar gastos
    const expensesResponse = await fetch('/data/gastos.csv');
    if (expensesResponse.ok) {
      const expensesText = await expensesResponse.text();
      importExpensesFromCSV(expensesText, false);
    }

    markFirstLoadCompleted();
    window.dispatchEvent(new Event('dataImported'));
  } catch (error) {
    console.error('Error al importar datos de ejemplo:', error);
  }
}

/**
 * Limpia todos los datos almacenados
 */
export function clearAllData(): void {
  storageService.clearAll();
  localStorage.removeItem(FIRST_LOAD_KEY);
  window.dispatchEvent(new Event('dataImported'));
}

