export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: ProductIngredient[];
  preparationTime: number; // minutos
  storageRequired: number; // metros cúbicos
  employeeHoursRequired: number; // horas de trabajo necesarias
}

export interface ProductIngredient {
  productId: string;
  quantity: number;
  unit: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  hoursPerWeek: number;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  date: Date;
  employeeId: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export interface ProductCostAnalysis {
  productId: string;
  productName: string;
  revenue: number;
  ingredientCost: number;
  laborCost: number;
  storageCost: number;
  totalCost: number;
  margin: number;
  marginPercentage: number;
  unitsSold: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: ProductCostAnalysis[];
  profitMargin: number;
  averageOrderValue: number;
}

