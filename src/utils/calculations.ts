import type { Product, Employee, Sale, ProductCostAnalysis } from '../types';
import { storageService } from './storage';

const STORAGE_COST_PER_CUBIC_METER = 5; // Costo mensual por metro cúbico

export const calculateProductCost = (
  product: Product,
  employees: Employee[]
): number => {
  // Costo de ingredientes (simplificado - en producción usarías precios reales)
  const ingredientCost = product.ingredients.reduce((sum, ing) => {
    // Aquí deberías buscar el precio del ingrediente
    // Por ahora usamos un cálculo simplificado
    return sum + (ing.quantity * 0.5); // Estimación
  }, 0);

  // Costo de mano de obra
  // employeeHoursRequired está en horas, así que multiplicamos por la tarifa promedio
  const averageHourlyRate = employees.length > 0
    ? employees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employees.length
    : 15; // Tarifa por defecto
  
  // Costo de mano de obra = horas requeridas * tarifa por hora
  const laborCost = product.employeeHoursRequired * averageHourlyRate;

  // Costo de almacenamiento (proporcional)
  const storageCost = (product.storageRequired * STORAGE_COST_PER_CUBIC_METER) / 30; // Costo diario

  return ingredientCost + laborCost + storageCost;
};

export const analyzeProductPerformance = (
  productId: string,
  products: Product[],
  sales: Sale[],
  employees: Employee[]
): ProductCostAnalysis | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  const productSales = sales.filter(s => s.productId === productId);
  const unitsSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
  const revenue = productSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  const costPerUnit = calculateProductCost(product, employees);
  const totalCost = costPerUnit * unitsSold;

  // Costos desglosados
  const ingredientCost = product.ingredients.reduce((sum, ing) => sum + (ing.quantity * 0.5), 0) * unitsSold;
  const averageHourlyRate = employees.length > 0
    ? employees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employees.length
    : 15;
  // Costo de mano de obra = horas requeridas * tarifa por hora * unidades vendidas
  const laborCost = product.employeeHoursRequired * averageHourlyRate * unitsSold;
  const storageCost = (product.storageRequired * STORAGE_COST_PER_CUBIC_METER) / 30 * unitsSold;

  const margin = revenue - totalCost;
  const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

  return {
    productId: product.id,
    productName: product.name,
    revenue,
    ingredientCost,
    laborCost,
    storageCost,
    totalCost,
    margin,
    marginPercentage,
    unitsSold,
  };
};

export const getDashboardStats = (): {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: ProductCostAnalysis[];
  profitMargin: number;
  averageOrderValue: number;
} => {
  const products = storageService.getProducts();
  const sales = storageService.getSales();
  const expenses = storageService.getExpenses();
  const employees = storageService.getEmployees();

  const totalRevenue = sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calcular costos de productos vendidos
  const productCosts = products.reduce((sum, product) => {
    const productSales = sales.filter(s => s.productId === product.id);
    const unitsSold = productSales.reduce((s, sale) => s + sale.quantity, 0);
    return sum + (calculateProductCost(product, employees) * unitsSold);
  }, 0);

  const totalCosts = totalExpenses + productCosts;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Product analysis
  const productAnalyses = products
    .map(product => analyzeProductPerformance(product.id, products, sales, employees))
    .filter((analysis): analysis is ProductCostAnalysis => analysis !== null);

  const topProducts = productAnalyses
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalExpenses: totalCosts,
    netProfit,
    topProducts,
    profitMargin,
    averageOrderValue,
  };
};

export interface SalesByEmployee {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  totalRevenue: number;
  numberOfSales: number;
}

export interface TimeByCategory {
  category: string;
  totalTime: number; // minutos
  totalHours: number;
  unitsSold: number;
}

export interface StorageByProduct {
  productId: string;
  productName: string;
  totalStorage: number; // m³ total
  unitsSold: number;
}

/**
 * Calcula las ventas agrupadas por empleado
 */
export function getSalesByEmployee(): SalesByEmployee[] {
  const sales = storageService.getSales();
  const employees = storageService.getEmployees();

  const salesByEmployee = new Map<string, { revenue: number; count: number }>();

  sales.forEach(sale => {
    const existing = salesByEmployee.get(sale.employeeId) || { revenue: 0, count: 0 };
    salesByEmployee.set(sale.employeeId, {
      revenue: existing.revenue + (sale.price * sale.quantity),
      count: existing.count + 1,
    });
  });

  return Array.from(salesByEmployee.entries())
    .map(([employeeId, data]) => {
      const employee = employees.find(e => e.id === employeeId);
      return {
        employeeId,
        employeeName: employee?.name || 'Desconocido',
        totalSales: data.revenue,
        totalRevenue: data.revenue,
        numberOfSales: data.count,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Calcula el tiempo total empleado en preparar productos por categoría
 */
export function getTimeByCategory(): TimeByCategory[] {
  const products = storageService.getProducts();
  const sales = storageService.getSales();

  const timeByCategory = new Map<string, { time: number; units: number }>();

  sales.forEach(sale => {
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const existing = timeByCategory.get(product.category) || { time: 0, units: 0 };
      const totalTime = product.preparationTime * sale.quantity;
      timeByCategory.set(product.category, {
        time: existing.time + totalTime,
        units: existing.units + sale.quantity,
      });
    }
  });

  return Array.from(timeByCategory.entries())
    .map(([category, data]) => ({
      category,
      totalTime: data.time,
      totalHours: data.time / 60,
      unitsSold: data.units,
    }))
    .sort((a, b) => b.totalTime - a.totalTime);
}

/**
 * Calcula el almacenaje total requerido por producto vendido
 */
export function getStorageByProduct(): StorageByProduct[] {
  const products = storageService.getProducts();
  const sales = storageService.getSales();

  const storageByProduct = new Map<string, { storage: number; units: number }>();

  sales.forEach(sale => {
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const existing = storageByProduct.get(product.id) || { storage: 0, units: 0 };
      const totalStorage = product.storageRequired * sale.quantity;
      storageByProduct.set(product.id, {
        storage: existing.storage + totalStorage,
        units: existing.units + sale.quantity,
      });
    }
  });

  return Array.from(storageByProduct.entries())
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        productName: product?.name || 'Desconocido',
        totalStorage: data.storage,
        unitsSold: data.units,
      };
    })
    .sort((a, b) => b.totalStorage - a.totalStorage)
    .slice(0, 15); // Top 15 productos
}

export interface SalesByDay {
  day: number;
  date: string;
  totalRevenue: number;
  totalQuantity: number;
  employees: string[];
}

export function getSalesByDay(timeRange: 'week' | 'month' = 'month'): SalesByDay[] {
  const sales = storageService.getSales();
  const employees = storageService.getEmployees();

  if (sales.length === 0) {
    return [];
  }

  // For demo purposes, if no current data, show the most recent month's data
  const now = new Date();
  let filteredSales = sales;

  // If no sales in current month, show the most recent month with data
  const currentMonthSales = sales.filter(sale =>
    sale.date.getMonth() === now.getMonth() &&
    sale.date.getFullYear() === now.getFullYear()
  );

  if (currentMonthSales.length === 0) {
    // Find the most recent month with data
    const sortedSales = [...sales].sort((a, b) => b.date.getTime() - a.date.getTime());
    const mostRecentDate = sortedSales[0].date;
    const targetMonth = mostRecentDate.getMonth();
    const targetYear = mostRecentDate.getFullYear();

    filteredSales = sales.filter(sale =>
      sale.date.getMonth() === targetMonth &&
      sale.date.getFullYear() === targetYear
    );
  } else {
    // Use current month data
    filteredSales = currentMonthSales;
  }

  // Apply time range filter
  if (timeRange === 'week') {
    // Get the last 7 days of the filtered data
    const sortedFiltered = [...filteredSales].sort((a, b) => b.date.getTime() - a.date.getTime());
    const mostRecentInFiltered = sortedFiltered[0].date;
    const weekAgo = new Date(mostRecentInFiltered.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredSales = filteredSales.filter(sale => sale.date >= weekAgo);
  }

  // Group sales by day of month
  const salesByDay = filteredSales.reduce((acc, sale) => {
    const day = sale.date.getDate();
    const dateStr = sale.date.toISOString().split('T')[0];

    if (!acc[day]) {
      acc[day] = {
        day,
        date: dateStr,
        totalRevenue: 0,
        totalQuantity: 0,
        employees: new Set<string>(),
      };
    }

    acc[day].totalRevenue += sale.price * sale.quantity;
    acc[day].totalQuantity += sale.quantity;

    // Find employee name
    const employee = employees.find(e => e.id === sale.employeeId);
    if (employee) {
      acc[day].employees.add(employee.name);
    }

    return acc;
  }, {} as Record<number, { day: number; date: string; totalRevenue: number; totalQuantity: number; employees: Set<string> }>);

  const result = Object.values(salesByDay)
    .map(item => {
      const employeeArray = Array.from(item.employees);
      // Debug: log employees per day
      if (employeeArray.length > 2) {
        console.log(`⚠️ Day ${item.day} has ${employeeArray.length} employees:`, employeeArray);
      }
      return {
        ...item,
        employees: employeeArray,
      };
    })
    .sort((a, b) => a.day - b.day);
  
  return result;
}

export interface ExpensesByCategory {
  category: string;
  totalAmount: number;
  count: number;
}

/**
 * Calcula los gastos agrupados por categoría
 */
export function getExpensesByCategory(): ExpensesByCategory[] {
  const expenses = storageService.getExpenses();

  const expensesByCategory = new Map<string, { amount: number; count: number }>();

  expenses.forEach(expense => {
    const existing = expensesByCategory.get(expense.category) || { amount: 0, count: 0 };
    expensesByCategory.set(expense.category, {
      amount: existing.amount + expense.amount,
      count: existing.count + 1,
    });
  });

  return Array.from(expensesByCategory.entries())
    .map(([category, data]) => ({
      category,
      totalAmount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

