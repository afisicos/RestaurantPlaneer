import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Employees from './components/Employees';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import ImportData from './components/ImportData';
import { autoImportExampleData } from './utils/initialization';
import './App.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">🍽️ Restaurant Studio</h1>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
              Products
            </Link>
          </li>
          <li>
            <Link to="/sales" className={isActive('/sales') ? 'active' : ''}>
              Sales
            </Link>
          </li>
          <li>
            <Link to="/employees" className={isActive('/employees') ? 'active' : ''}>
              Employees
            </Link>
          </li>
          <li>
            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>
              Expenses
            </Link>
          </li>
          <li>
            <Link to="/import" className={isActive('/import') ? 'active' : ''}>
              Import CSV
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  useEffect(() => {
    autoImportExampleData();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/import" element={<ImportData />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

