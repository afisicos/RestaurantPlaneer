import type { Product, Employee, Sale, Expense } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'hosteleria_products',
  EMPLOYEES: 'hosteleria_employees',
  SALES: 'hosteleria_sales',
  EXPENSES: 'hosteleria_expenses',
};

export const storageService = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data).map((p: Product) => ({
      ...p,
      ingredients: p.ingredients || [],
    })) : [];
  },
  
  saveProducts: (products: Product[]): void => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Employees
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  },
  
  saveEmployees: (employees: Employee[]): void => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  // Sales
  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data).map((s: Sale) => ({
      ...s,
      date: new Date(s.date),
    })) : [];
  },
  
  saveSales: (sales: Sale[]): void => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data).map((e: Expense) => ({
      ...e,
      date: new Date(e.date),
    })) : [];
  },
  
  saveExpenses: (expenses: Expense[]): void => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  },
};

