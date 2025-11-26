import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Employees from './components/Employees';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import ImportData from './components/ImportData';
import OnboardingTutorial from './components/OnboardingTutorial';
import { autoImportExampleData, clearAllData } from './utils/initialization';
import './App.css';

function Navigation({ onStartTutorial }: { onStartTutorial: () => void }) {
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
              Productos
            </Link>
          </li>
          <li>
            <Link to="/sales" className={isActive('/sales') ? 'active' : ''}>
              Ventas
            </Link>
          </li>
          <li>
            <Link to="/employees" className={isActive('/employees') ? 'active' : ''}>
              Empleados
            </Link>
          </li>
          <li>
            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>
              Gastos
            </Link>
          </li>
          <li>
            <Link to="/import" className={isActive('/import') ? 'active' : ''}>
              Importar CSV
            </Link>
          </li>
          <li>
            <button className="nav-tutorial-btn" onClick={onStartTutorial}>
              Definir mi restaurante
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    autoImportExampleData();
  }, []);

  const handleStartTutorial = () => {
    if (confirm('¿Estás seguro? Esto eliminará todos los datos de ejemplo y comenzará el tutorial paso a paso.')) {
      clearAllData();
      setTutorialStep(0);
      setShowTutorial(true);
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navigation onStartTutorial={handleStartTutorial} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products onDataCreated={() => window.dispatchEvent(new Event('productCreated'))} />} />
            <Route path="/sales" element={<Sales onDataCreated={() => window.dispatchEvent(new Event('saleCreated'))} />} />
            <Route path="/employees" element={<Employees onDataCreated={() => window.dispatchEvent(new Event('employeeCreated'))} />} />
            <Route path="/expenses" element={<Expenses onDataCreated={() => window.dispatchEvent(new Event('expenseCreated'))} />} />
            <Route path="/import" element={<ImportData />} />
          </Routes>
        </main>
        {showTutorial && (
          <OnboardingTutorial 
            onClose={handleCloseTutorial} 
            initialStep={tutorialStep}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;

