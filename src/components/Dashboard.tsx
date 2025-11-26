import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, getSalesByDay, getExpensesByCategory } from '../utils/calculations';
import './Dashboard.css';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d',
  '#FF6B9D', '#C44569', '#F8B500', '#6C5CE7', '#00D2D3', '#FFA07A',
  '#20B2AA', '#9370DB', '#FF6347', '#4682B4', '#32CD32', '#FF1493',
  '#1E90FF', '#FFD700', '#DC143C', '#00CED1', '#FF69B4', '#8A2BE2'
];

export default function Dashboard() {
  const [stats, setStats] = useState(getDashboardStats());
  const [salesByDay, setSalesByDay] = useState(getSalesByDay('month'));
  const [expensesByCategory, setExpensesByCategory] = useState(getExpensesByCategory());

  // Escuchar eventos de almacenamiento para actualizar cuando cambien los datos
  useEffect(() => {
    const handleStorageChange = () => {
      setStats(getDashboardStats());
      setSalesByDay(getSalesByDay('month'));
      setExpensesByCategory(getExpensesByCategory());
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // También escuchar eventos personalizados de importación
    window.addEventListener('dataImported', handleStorageChange);

    // Actualizar periódicamente solo si hay cambios (cada 5 segundos para evitar parpadeos)
    const interval = setInterval(() => {
      const newStats = getDashboardStats();
      const newSalesByDay = getSalesByDay('month');
      const newExpensesByCategory = getExpensesByCategory();
      
      // Solo actualizar si hay cambios reales
      setStats(prevStats => {
        if (JSON.stringify(prevStats) !== JSON.stringify(newStats)) {
          return newStats;
        }
        return prevStats;
      });
      
      setSalesByDay(prevSales => {
        if (JSON.stringify(prevSales) !== JSON.stringify(newSalesByDay)) {
          return newSalesByDay;
        }
        return prevSales;
      });
      
      setExpensesByCategory(prevExpenses => {
        if (JSON.stringify(prevExpenses) !== JSON.stringify(newExpensesByCategory)) {
          return newExpensesByCategory;
        }
        return prevExpenses;
      });
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataImported', handleStorageChange);
      clearInterval(interval);
    };
  }, []);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  // Función para crear abreviaturas usando la primera palabra
  const abbreviateLabel = (text: string, maxLength: number = 10): string => {
    if (text.length <= maxLength) return text;
    
    // Tomar la primera palabra y abreviarla
    const words = text.split(' ');
    const firstWord = words[0];
    
    // Si la primera palabra es más larga que maxLength, truncarla
    if (firstWord.length > maxLength) {
      return firstWord.substring(0, maxLength - 3) + '...';
    }
    
    // Si la primera palabra cabe, usarla completa
    return firstWord;
  };

  const marginData = stats.topProducts.map(p => ({
    name: p.productName,
    margin: p.margin,
    percentage: p.marginPercentage,
  }));

  const revenueData = stats.topProducts.map(p => ({
    name: p.productName,
    revenue: p.revenue,
    costs: p.totalCost,
  }));

  const pieData = useMemo(() => {
    return stats.topProducts.slice(0, 10).map(p => ({
      name: p.productName,
      value: p.revenue,
    }));
  }, [stats.topProducts]);


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total revenue</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total cost</h3>
            <p className="stat-value">{formatCurrency(stats.totalExpenses)}</p>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Net profit</h3>
            <p className="stat-value">{formatCurrency(stats.netProfit)}</p>
          </div>
        </div>

        <div className="stat-card margin">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Profit margin</h3>
            <p className="stat-value">{stats.profitMargin.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Top Products by Margin</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={marginData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                interval={0}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value) => abbreviateLabel(value, 10)}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => marginData.find(d => abbreviateLabel(d.name, 10) === label)?.name || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="margin" fill="url(#colorGradient1)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C49F" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Revenue vs Costs by Product</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                interval={0}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value) => abbreviateLabel(value, 10)}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => revenueData.find(d => abbreviateLabel(d.name, 10) === label)?.name || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" fill="url(#colorGradient2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="costs" fill="url(#colorGradient3)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0088FE" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8042" stopOpacity={1} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Income distribution (Top 10)</h2>
          <ResponsiveContainer width="100%" height={450}>
            <PieChart margin={{ top: 40, right: 120, bottom: 40, left: 120 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={{ stroke: '#64748b', strokeWidth: 1.5 }}
                label={({ name, percent }) => {
                  const abbreviatedName = abbreviateLabel(name || '', 15);
                  return `${abbreviatedName}: ${((percent || 0) * 100).toFixed(0)}%`;
                }}
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => pieData.find(d => d.name === label)?.name || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Profit Margin by Product (%)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={marginData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                interval={0}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value) => abbreviateLabel(value, 10)}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => marginData.find(d => abbreviateLabel(d.name, 10) === label)?.name || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="percentage" fill="url(#colorGradient4)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Sales by Day of Month</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesByDay} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="day"
                interval={0}
                tick={{ fontSize: 11, fill: '#64748b' }}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(label) => `Day ${label}`}
                formatter={(value: number, name: string) => {
                  if (name === 'totalRevenue') return [formatCurrency(value), 'Total Revenue'];
                  if (name === 'totalQuantity') return [`${value} units`, 'Products Sold'];
                  return value;
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const employeeNames = data.employees && data.employees.length > 0 
                      ? data.employees.map((emp: string) => emp.split(' ')[0]).join(', ')
                      : '';
                    return (
                      <div className="custom-tooltip">
                        <p className="label">{`Day ${label}`}</p>
                        <p className="intro">{formatCurrency(data.totalRevenue)}</p>
                        <p className="intro">{`${data.totalQuantity} items`}</p>
                        {employeeNames && (
                          <div className="employees-list">
                            <strong>Staff</strong>
                            <ul>
                              {data.employees.map((emp: string, index: number) => (
                                <li key={index}>{emp.split(' ')[0]}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="totalRevenue" fill="url(#colorGradient5)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Total Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={expensesByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="category" 
                interval={0}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value) => abbreviateLabel(value, 12)}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => expensesByCategory.find(d => abbreviateLabel(d.category, 12) === label)?.category || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="totalAmount" fill="url(#colorGradient6)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient6" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

