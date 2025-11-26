# 🍽️ Hostelería Pro - Sistema de Gestión para Negocios de Hostelería

Una aplicación web moderna desarrollada con Vite, React y TypeScript para gestionar todos los aspectos de un negocio de hostelería, incluyendo ventas, productos, empleados, gastos y análisis avanzados de márgenes.

## ✨ Características

### 📊 Dashboard Analítico
- Visualización de ingresos, gastos y beneficios netos
- Análisis de márgenes por producto
- Gráficos interactivos con Recharts
- Identificación de productos más rentables
- Métricas clave en tiempo real

### 🛍️ Gestión de Productos
- Registro completo de productos con:
  - Precio de venta
  - Tiempo de preparación
  - Requisitos de almacenamiento
  - Horas de empleado necesarias
- Cálculo automático de costos y márgenes
- Visualización de rentabilidad por producto

### 💰 Registro de Ventas
- Registro detallado de cada venta
- Asociación con productos y empleados
- Historial completo de transacciones
- Cálculo automático de totales

### 👥 Gestión de Empleados
- Registro de empleados con tarifas horarias
- Cálculo de costos semanales y mensuales
- Integración con cálculos de costos de productos

### 💸 Control de Gastos
- Registro de gastos por categorías
- Resumen por categoría
- Historial completo de gastos

### 🧮 Cálculo de Costos Avanzado
El sistema calcula automáticamente el costo real de cada producto considerando:
- **Costos de ingredientes**: Basado en materias primas
- **Costos de mano de obra**: Calculado según tiempo de preparación y tarifas de empleados
- **Costos de almacenamiento**: Basado en espacio requerido
- **Margen de beneficio**: Diferencia entre precio de venta y costo total

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ y npm

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

### Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist`.

## 🛠️ Tecnologías Utilizadas

- **Vite**: Build tool y servidor de desarrollo ultrarrápido
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático para mayor seguridad
- **React Router**: Navegación entre páginas
- **Recharts**: Gráficos y visualizaciones
- **LocalStorage**: Persistencia de datos en el navegador
- **CSS Modules**: Estilos modulares sin frameworks CSS

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx   # Dashboard principal con análisis
│   ├── Products.tsx    # Gestión de productos
│   ├── Sales.tsx       # Registro de ventas
│   ├── Employees.tsx   # Gestión de empleados
│   └── Expenses.tsx     # Control de gastos
├── types/              # Definiciones TypeScript
│   └── index.ts        # Interfaces y tipos
├── utils/              # Utilidades
│   ├── storage.ts      # Servicio de almacenamiento
│   └── calculations.ts # Lógica de cálculos
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 💡 Uso

### 1. Configurar Empleados
Primero, registra tus empleados con sus tarifas horarias. Esto es esencial para calcular los costos de mano de obra.

### 2. Crear Productos
Registra tus productos con todos los detalles:
- Precio de venta
- Tiempo de preparación en minutos
- Espacio de almacenamiento requerido
- Horas de empleado necesarias

### 3. Registrar Ventas
Cada vez que realices una venta, regístrala en el sistema. El sistema calculará automáticamente los márgenes.

### 4. Registrar Gastos
Mantén un registro de todos tus gastos para tener una visión completa de tus finanzas.

### 5. Analizar en el Dashboard
El dashboard te mostrará:
- Productos más rentables
- Márgenes de beneficio
- Análisis de ingresos vs costos
- Métricas clave de tu negocio

## 🎨 Diseño

La aplicación utiliza un diseño moderno y limpio con:
- Gradientes modernos
- Animaciones suaves
- Diseño responsive
- Interfaz intuitiva
- Colores que indican estados (positivo/negativo)

## 📝 Notas

- Los datos se almacenan en el LocalStorage del navegador
- Los cálculos de costos de ingredientes son estimaciones (puedes mejorarlos con precios reales)
- El costo de almacenamiento se calcula como €5/m³/mes

## 🔮 Mejoras Futuras

- Exportación de datos a Excel/PDF
- Integración con sistemas de punto de venta
- Análisis de tendencias temporales
- Gestión de inventario
- Múltiples ubicaciones/negocios
- Autenticación de usuarios
- Backend con base de datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

