import type { Product, Employee, Sale, Expense } from '../types';
import { parseCSV } from './csvParser';
import { storageService } from './storage';

/**
 * Convierte datos CSV de productos al formato de la aplicación
 */
export function importProducts(csvData: Record<string, string>[]): Product[] {
  return csvData.map(row => ({
    id: row.id || row.Id || '',
    name: row.nombre || row.name || '',
    price: parseFloat(row.precio || row.price || '0'),
    category: row.categoria || row.category || '',
    preparationTime: parseFloat(row.tiempoPreparacion || row.preparationTime || '0'),
    storageRequired: parseFloat(row.almacenajeRequerido || row.storageRequired || '0'),
    employeeHoursRequired: parseFloat(row.horasEmpleadoRequeridas || row.employeeHoursRequired || '0'),
    ingredients: [], // Los ingredientes no están en el CSV, se inicializan vacíos
  })).filter(p => p.id && p.name); // Filtrar filas inválidas
}

/**
 * Convierte datos CSV de empleados al formato de la aplicación
 */
export function importEmployees(csvData: Record<string, string>[]): Employee[] {
  return csvData.map(row => ({
    id: row.id || row.Id || '',
    name: row.nombre || row.name || '',
    role: row.rol || row.role || '',
    hourlyRate: parseFloat(row.tarifaHora || row.hourlyRate || '0'),
    hoursPerWeek: parseFloat(row.horasSemana || row.hoursPerWeek || '0'),
  })).filter(e => e.id && e.name); // Filtrar filas inválidas
}

/**
 * Convierte datos CSV de ventas al formato de la aplicación
 */
export function importSales(csvData: Record<string, string>[]): Sale[] {
  return csvData.map(row => {
    const dateStr = row.fecha || row.date || '';
    let date = new Date();
    
    // Intentar parsear la fecha en formato YYYY-MM-DD
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
    }

    return {
      id: row.id || row.Id || '',
      productId: row.productoId || row.productId || '',
      quantity: parseFloat(row.cantidad || row.quantity || '0'),
      price: parseFloat(row.precio || row.price || '0'),
      date,
      employeeId: row.empleadoId || row.employeeId || '',
    };
  }).filter(s => s.id && s.productId && s.employeeId); // Filtrar filas inválidas
}

/**
 * Convierte datos CSV de gastos al formato de la aplicación
 */
export function importExpenses(csvData: Record<string, string>[]): Expense[] {
  return csvData.map(row => {
    const dateStr = row.fecha || row.date || '';
    let date = new Date();
    
    // Intentar parsear la fecha en formato YYYY-MM-DD
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
    }

    return {
      id: row.id || row.Id || '',
      description: row.descripcion || row.description || '',
      amount: parseFloat(row.cantidad || row.amount || '0'),
      category: row.categoria || row.category || '',
      date,
    };
  }).filter(e => e.id && e.description); // Filtrar filas inválidas
}

/**
 * Importa productos desde CSV y los guarda (reemplaza o fusiona)
 */
export function importProductsFromCSV(csvText: string, merge: boolean = false): { success: number; errors: string[] } {
  try {
    const csvData = parseCSV(csvText);
    const importedProducts = importProducts(csvData);
    
    if (importedProducts.length === 0) {
      return { success: 0, errors: ['No se encontraron productos válidos en el CSV'] };
    }

    if (merge) {
      // Fusionar con productos existentes (actualizar existentes y agregar nuevos)
      const existingProducts = storageService.getProducts();
      const existingProductsMap = new Map(existingProducts.map(p => [p.id, p]));
      let updatedCount = 0;
      let newCount = 0;

      importedProducts.forEach(product => {
        if (existingProductsMap.has(product.id)) {
          // Actualizar producto existente, preservando ingredientes si los tiene
          const existingProduct = existingProductsMap.get(product.id)!;
          existingProductsMap.set(product.id, {
            ...product,
            ingredients: existingProduct.ingredients.length > 0 ? existingProduct.ingredients : product.ingredients,
          });
          updatedCount++;
        } else {
          // Agregar nuevo producto
          existingProductsMap.set(product.id, product);
          newCount++;
        }
      });

      const updatedProducts = Array.from(existingProductsMap.values());
      storageService.saveProducts(updatedProducts);
      return { 
        success: updatedCount + newCount, 
        errors: [] 
      };
    } else {
      // Reemplazar todos los productos
      storageService.saveProducts(importedProducts);
      return { success: importedProducts.length, errors: [] };
    }
  } catch (error) {
    return { success: 0, errors: [`Error al importar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`] };
  }
}

/**
 * Importa empleados desde CSV y los guarda (reemplaza o fusiona)
 * En modo merge: actualiza registros existentes con el mismo ID y agrega nuevos
 */
export function importEmployeesFromCSV(csvText: string, merge: boolean = false): { success: number; errors: string[] } {
  try {
    const csvData = parseCSV(csvText);
    const importedEmployees = importEmployees(csvData);
    
    if (importedEmployees.length === 0) {
      return { success: 0, errors: ['No se encontraron empleados válidos en el CSV'] };
    }

    if (merge) {
      // Fusionar con empleados existentes (actualizar existentes y agregar nuevos)
      const existingEmployees = storageService.getEmployees();
      const existingEmployeesMap = new Map(existingEmployees.map(e => [e.id, e]));
      let updatedCount = 0;
      let newCount = 0;

      importedEmployees.forEach(employee => {
        if (existingEmployeesMap.has(employee.id)) {
          // Actualizar empleado existente
          existingEmployeesMap.set(employee.id, employee);
          updatedCount++;
        } else {
          // Agregar nuevo empleado
          existingEmployeesMap.set(employee.id, employee);
          newCount++;
        }
      });

      const updatedEmployees = Array.from(existingEmployeesMap.values());
      storageService.saveEmployees(updatedEmployees);
      return { 
        success: updatedCount + newCount, 
        errors: [] 
      };
    } else {
      // Reemplazar todos los empleados
      storageService.saveEmployees(importedEmployees);
      return { success: importedEmployees.length, errors: [] };
    }
  } catch (error) {
    return { success: 0, errors: [`Error al importar empleados: ${error instanceof Error ? error.message : 'Error desconocido'}`] };
  }
}

/**
 * Importa ventas desde CSV y las guarda (reemplaza o fusiona)
 * En modo merge: actualiza registros existentes con el mismo ID y agrega nuevos
 */
export function importSalesFromCSV(csvText: string, merge: boolean = false): { success: number; errors: string[] } {
  try {
    const csvData = parseCSV(csvText);
    const importedSales = importSales(csvData);
    
    if (importedSales.length === 0) {
      return { success: 0, errors: ['No se encontraron ventas válidas en el CSV'] };
    }

    if (merge) {
      // Fusionar con ventas existentes (actualizar existentes y agregar nuevas)
      const existingSales = storageService.getSales();
      const existingSalesMap = new Map(existingSales.map(s => [s.id, s]));
      let updatedCount = 0;
      let newCount = 0;

      importedSales.forEach(sale => {
        if (existingSalesMap.has(sale.id)) {
          // Actualizar venta existente
          existingSalesMap.set(sale.id, sale);
          updatedCount++;
        } else {
          // Agregar nueva venta
          existingSalesMap.set(sale.id, sale);
          newCount++;
        }
      });

      const updatedSales = Array.from(existingSalesMap.values());
      storageService.saveSales(updatedSales);
      return { 
        success: updatedCount + newCount, 
        errors: [] 
      };
    } else {
      // Reemplazar todas las ventas
      storageService.saveSales(importedSales);
      return { success: importedSales.length, errors: [] };
    }
  } catch (error) {
    return { success: 0, errors: [`Error al importar ventas: ${error instanceof Error ? error.message : 'Error desconocido'}`] };
  }
}

/**
 * Importa gastos desde CSV y los guarda (reemplaza o fusiona)
 * En modo merge: actualiza registros existentes con el mismo ID y agrega nuevos
 */
export function importExpensesFromCSV(csvText: string, merge: boolean = false): { success: number; errors: string[] } {
  try {
    const csvData = parseCSV(csvText);
    const importedExpenses = importExpenses(csvData);
    
    if (importedExpenses.length === 0) {
      return { success: 0, errors: ['No se encontraron gastos válidos en el CSV'] };
    }

    if (merge) {
      // Fusionar con gastos existentes (actualizar existentes y agregar nuevos)
      const existingExpenses = storageService.getExpenses();
      const existingExpensesMap = new Map(existingExpenses.map(e => [e.id, e]));
      let updatedCount = 0;
      let newCount = 0;

      importedExpenses.forEach(expense => {
        if (existingExpensesMap.has(expense.id)) {
          // Actualizar gasto existente
          existingExpensesMap.set(expense.id, expense);
          updatedCount++;
        } else {
          // Agregar nuevo gasto
          existingExpensesMap.set(expense.id, expense);
          newCount++;
        }
      });

      const updatedExpenses = Array.from(existingExpensesMap.values());
      storageService.saveExpenses(updatedExpenses);
      return { 
        success: updatedCount + newCount, 
        errors: [] 
      };
    } else {
      // Reemplazar todos los gastos
      storageService.saveExpenses(importedExpenses);
      return { success: importedExpenses.length, errors: [] };
    }
  } catch (error) {
    return { success: 0, errors: [`Error al importar gastos: ${error instanceof Error ? error.message : 'Error desconocido'}`] };
  }
}

