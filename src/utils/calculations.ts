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
  const averageHourlyRate = employees.length > 0
    ? employees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employees.length
    : 15; // Tarifa por defecto
  
  const laborCost = (product.employeeHoursRequired * averageHourlyRate) / product.preparationTime * 60; // Costo por unidad

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
  const laborCost = (product.employeeHoursRequired * averageHourlyRate) / product.preparationTime * 60 * unitsSold;
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

  // Análisis de productos
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

