import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { getDashboardStats, getSalesByEmployee, getStorageByProduct } from '../utils/calculations';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [stats, setStats] = useState(getDashboardStats());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [salesByEmployee, setSalesByEmployee] = useState(getSalesByEmployee());
  const [storageByProduct, setStorageByProduct] = useState(getStorageByProduct());

  // Escuchar eventos de almacenamiento para actualizar cuando cambien los datos
  useEffect(() => {
    const handleStorageChange = () => {
      setStats(getDashboardStats());
      setSalesByEmployee(getSalesByEmployee());
      setStorageByProduct(getStorageByProduct());
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados de importación
    window.addEventListener('dataImported', handleStorageChange);

    // Actualizar periódicamente por si acaso
    const interval = setInterval(() => {
      setStats(getDashboardStats());
    }, 2000);

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

  // Función para crear abreviaturas inteligentes
  const abbreviateLabel = (text: string, maxLength: number = 10): string => {
    if (text.length <= maxLength) return text;
    
    // Si tiene espacios, tomar primeras letras de cada palabra
    const words = text.split(' ');
    if (words.length > 1) {
      // Si son 2 palabras, tomar primeras 4-5 letras de cada una
      if (words.length === 2) {
        const w1 = words[0].substring(0, Math.min(5, words[0].length));
        const w2 = words[1].substring(0, Math.min(4, words[1].length));
        return `${w1} ${w2}`;
      }
      // Si son más palabras, tomar iniciales
      return words.map(w => w[0]).join('').toUpperCase();
    }
    
    // Si es una sola palabra larga, truncar
    return text.substring(0, maxLength) + '...';
  };

  const marginData = stats.topProducts.map(p => ({
    name: p.productName,
    margen: p.margin,
    porcentaje: p.marginPercentage,
  }));

  const revenueData = stats.topProducts.map(p => ({
    name: p.productName,
    ingresos: p.revenue,
    costos: p.totalCost,
  }));

  const pieData = stats.topProducts.slice(0, 5).map(p => ({
    name: p.productName,
    value: p.revenue,
  }));

  const salesByEmployeeData = salesByEmployee.map(e => ({
    name: e.employeeName.split(' ')[0], // Solo primer nombre para ahorrar espacio
    fullName: e.employeeName,
    ventas: e.totalRevenue,
  }));

  const storageByProductData = storageByProduct.map(s => ({
    name: s.productName,
    fullName: s.productName,
    almacenaje: parseFloat(s.totalStorage.toFixed(3)),
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard de Análisis</h1>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Semana
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Mes
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            Todo
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ingresos Totales</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Gastos Totales</h3>
            <p className="stat-value">{formatCurrency(stats.totalExpenses)}</p>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Beneficio Neto</h3>
            <p className="stat-value">{formatCurrency(stats.netProfit)}</p>
          </div>
        </div>

        <div className="stat-card margin">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Margen de Beneficio</h3>
            <p className="stat-value">{stats.profitMargin.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Top Productos por Margen</h2>
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
              <Bar dataKey="margen" fill="url(#colorGradient1)" radius={[8, 8, 0, 0]} />
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
          <h2>Ingresos vs Costos por Producto</h2>
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
              <Bar dataKey="ingresos" fill="url(#colorGradient2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="costos" fill="url(#colorGradient3)" radius={[8, 8, 0, 0]} />
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
          <h2>Distribución de Ingresos (Top 5)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
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
          <h2>Margen de Beneficio por Producto (%)</h2>
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
              <Bar dataKey="porcentaje" fill="url(#colorGradient4)" radius={[8, 8, 0, 0]} />
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
          <h2>Ventas por Empleado</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesByEmployeeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => abbreviateLabel(value, 8)}
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => salesByEmployeeData.find(d => d.name === label)?.fullName || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="ventas" fill="url(#colorGradient5)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0088FE" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Almacenaje Total Requerido por Producto</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={storageByProductData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorGradient6" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                formatter={(value: number) => `${value.toFixed(3)} m³`}
                labelFormatter={(label) => storageByProductData.find(d => d.name === label)?.fullName || label}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                dataKey="almacenaje" 
                stroke="#00C49F" 
                strokeWidth={2}
                fill="url(#colorGradient6)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="products-table-card">
        <h2>Análisis Detallado de Productos</h2>
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades Vendidas</th>
                <th>Ingresos</th>
                <th>Costos</th>
                <th>Margen</th>
                <th>Margen %</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((product) => (
                <tr key={product.productId}>
                  <td>{product.productName}</td>
                  <td>{product.unitsSold}</td>
                  <td>{formatCurrency(product.revenue)}</td>
                  <td>{formatCurrency(product.totalCost)}</td>
                  <td className={product.margin >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(product.margin)}
                  </td>
                  <td className={product.marginPercentage >= 0 ? 'positive' : 'negative'}>
                    {product.marginPercentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

