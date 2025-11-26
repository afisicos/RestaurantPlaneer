import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OnboardingTutorial.css';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  route: string;
  instructions: string[];
  eventName: string; // Evento que se dispara cuando se completa el paso
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Paso 1: Crear un Producto',
    description: 'Comienza definiendo los productos que vendes en tu restaurante',
    route: '/products',
    eventName: 'productCreated',
    instructions: [
      'Haz clic en el botón "+ Nuevo Producto"',
      'Completa el formulario con:',
      '  • Nombre del producto',
      '  • Precio de venta',
      '  • Categoría (ej: Tapas, Plato Principal, Bebida)',
      '  • Tiempo de preparación en minutos',
      '  • Almacenaje requerido en m³',
      '  • Horas de empleado necesarias',
      'Haz clic en "Crear" para guardar',
    ],
  },
  {
    id: 2,
    title: 'Paso 2: Registrar Empleados',
    description: 'Añade a tu equipo para calcular los costos de mano de obra',
    route: '/employees',
    eventName: 'employeeCreated',
    instructions: [
      'Haz clic en el botón "+ Nuevo Empleado"',
      'Completa el formulario con:',
      '  • Nombre del empleado',
      '  • Rol o cargo',
      '  • Tarifa por hora en euros',
      '  • Horas trabajadas por semana',
      'Haz clic en "Crear" para guardar',
    ],
  },
  {
    id: 3,
    title: 'Paso 3: Registrar Gastos',
    description: 'Registra los gastos generales de tu negocio',
    route: '/expenses',
    eventName: 'expenseCreated',
    instructions: [
      'Haz clic en el botón "+ Nuevo Gasto"',
      'Completa el formulario con:',
      '  • Descripción del gasto',
      '  • Cantidad en euros',
      '  • Categoría (Alquiler, Suministros, Materias Primas, etc.)',
      '  • Fecha del gasto',
      'Haz clic en "Registrar" para guardar',
    ],
  },
  {
    id: 4,
    title: 'Paso 4: Registrar una Venta',
    description: 'Registra las ventas para analizar el rendimiento',
    route: '/sales',
    eventName: 'saleCreated',
    instructions: [
      'Haz clic en el botón "+ Nueva Venta"',
      'Completa el formulario con:',
      '  • Selecciona el producto vendido',
      '  • Indica la cantidad',
      '  • Verifica el precio (se completa automáticamente)',
      '  • Selecciona el empleado que realizó la venta',
      '  • Selecciona la fecha',
      'Haz clic en "Registrar Venta" para guardar',
    ],
  },
];

interface OnboardingTutorialProps {
  onClose: () => void;
  initialStep?: number;
}

export default function OnboardingTutorial({ onClose, initialStep = 0 }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [mode, setMode] = useState<'instructions' | 'interactive'>('instructions');
  const navigate = useNavigate();
  const location = useLocation();

  // Navegar a la ruta del paso actual cuando cambia
  useEffect(() => {
    if (location.pathname !== tutorialSteps[currentStep].route) {
      navigate(tutorialSteps[currentStep].route);
    }
  }, [currentStep, navigate, location.pathname]);

  // Escuchar eventos de creación para avanzar automáticamente
  useEffect(() => {
    if (mode === 'interactive') {
      const currentStepData = tutorialSteps[currentStep];
      
      const handleItemCreated = () => {
        // Avanzar al siguiente paso después de un pequeño delay
        setTimeout(() => {
          if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setMode('instructions');
          } else {
            // Tutorial completado
            onClose();
          }
        }, 500);
      };

      window.addEventListener(currentStepData.eventName, handleItemCreated);

      return () => {
        window.removeEventListener(currentStepData.eventName, handleItemCreated);
      };
    }
  }, [currentStep, mode, onClose]);

  const handleNext = () => {
    if (mode === 'instructions') {
      // Cambiar a modo interactivo
      setMode('interactive');
      // Disparar evento para que los componentes abran el formulario
      window.dispatchEvent(new CustomEvent('tutorialEnterInteractive', { 
        detail: { step: currentStep, stepType: tutorialSteps[currentStep].eventName } 
      }));
    } else {
      // Si está en modo interactivo, avanzar manualmente al siguiente paso
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        setMode('instructions');
      } else {
        onClose();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setMode('instructions');
      navigate(tutorialSteps[prevStep].route);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div className={`onboarding-overlay ${mode === 'interactive' ? 'interactive-mode' : ''}`}>
      <div className={`onboarding-modal ${mode === 'interactive' ? 'compact' : ''}`}>
        <div className="onboarding-header">
          <div className="step-indicator">
            {tutorialSteps.map((step, index) => (
              <div
                key={step.id}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                onClick={() => {
                  if (index !== currentStep) {
                    setCurrentStep(index);
                    setMode('instructions');
                    navigate(tutorialSteps[index].route);
                  }
                }}
                style={{ cursor: 'pointer' }}
                title={`Paso ${step.id}: ${step.title}`}
              />
            ))}
          </div>
          <button className="close-button" onClick={handleSkip}>
            ✕
          </button>
        </div>

        <div className="onboarding-content">
          <h2>{currentStepData.title}</h2>
          <p className="step-description">{currentStepData.description}</p>

          {mode === 'instructions' ? (
            <>
              <div className="instructions-box">
                <h3>Instrucciones:</h3>
                <ol className="instructions-list">
                  {currentStepData.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="onboarding-actions">
                <button
                  className="btn-secondary"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  ← Anterior
                </button>
                <button className="btn-skip" onClick={handleSkip}>
                  Saltar Tutorial
                </button>
                <button className="btn-primary" onClick={handleNext}>
                  Empezar a crear →
                </button>
              </div>
            </>
          ) : (
            <div className="interactive-mode-content">
              <div className="interactive-message">
                <p>✨ Ahora es tu turno. Completa el formulario que aparece abajo.</p>
                <p className="hint">Cuando termines de crear el {currentStepData.id === 1 ? 'producto' : currentStepData.id === 2 ? 'empleado' : currentStepData.id === 3 ? 'gasto' : 'venta'}, el tutorial avanzará automáticamente.</p>
                <p className="hint-small">💡 Puedes hacer clic en el formulario y trabajar normalmente. El tutorial permanecerá visible arriba.</p>
              </div>
              <div className="onboarding-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setMode('instructions')}
                >
                  ← Ver instrucciones
                </button>
                <button
                  className="btn-secondary"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  ← Paso anterior
                </button>
                <button className="btn-skip" onClick={handleSkip}>
                  Saltar Tutorial
                </button>
                {currentStep < tutorialSteps.length - 1 && (
                  <button className="btn-primary" onClick={handleNext}>
                    Siguiente paso →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

