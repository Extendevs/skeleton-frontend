# 🧩 Atomic Design Structure

## Overview

Este proyecto utiliza la metodología **Atomic Design** creada por Brad Frost para organizar los componentes de React de manera escalable y mantenible.

## 🏗️ Estructura de Componentes

```
src/shared/components/
├── atoms/           # Elementos básicos indivisibles
├── molecules/       # Combinaciones simples de atoms
├── organisms/       # Secciones complejas de la interfaz
├── templates/       # Layouts y estructuras de página
└── pages/          # Páginas completas (fuera de shared)
```

## ⚛️ **Atoms** - Elementos Básicos

Los atoms son los componentes más pequeños e indivisibles de la interfaz.

### Componentes Disponibles:

#### `LoadingSpinner`
```tsx
<LoadingSpinner size="lg" className="text-blue-500" />
```
- **Props**: `size`, `className`
- **Uso**: Indicadores de carga en cualquier parte de la UI

#### `StatusBadge`
```tsx
<StatusBadge status="active">Activo</StatusBadge>
<StatusBadge status="error">Error</StatusBadge>
```
- **Props**: `status`, `children`, `className`
- **Estados**: `active`, `inactive`, `pending`, `success`, `error`, `warning`

#### `ColorSwatch`
```tsx
<ColorSwatch color="#ff0000" showLabel={true} size="md" />
```
- **Props**: `color`, `size`, `className`, `showLabel`
- **Uso**: Mostrar colores con etiquetas opcionales

#### `EmptyStateIcon`
```tsx
<EmptyStateIcon className="h-12 w-12 text-gray-300" />
```
- **Props**: `className`
- **Uso**: Íconos consistentes para estados vacíos

---

## 🧬 **Molecules** - Combinaciones Simples

Las molecules combinan atoms para crear componentes funcionales simples.

### Componentes Disponibles:

#### `ActionButtonGroup`
```tsx
<ActionButtonGroup
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item)}
  disabled={isLoading}
  variant="inline"
/>
```
- **Props**: `onEdit`, `onDelete`, `onView`, `disabled`, `isLoading`, `variant`
- **Uso**: Botones de acción consistentes en tablas y listas

#### `SearchInput`
```tsx
<SearchInput
  placeholder="Buscar productos..."
  onSearch={handleSearch}
  onReset={handleReset}
  showButtons={true}
/>
```
- **Props**: `placeholder`, `value`, `onSearch`, `onReset`, `disabled`, `showButtons`
- **Uso**: Campos de búsqueda con botones integrados

#### `TableLoadingState`
```tsx
<TableLoadingState message="Cargando datos..." rows={5} />
```
- **Props**: `message`, `rows`, `className`
- **Uso**: Estados de carga consistentes para tablas

#### `TableEmptyState`
```tsx
<TableEmptyState
  title="No hay categorías"
  description="Crea tu primera categoría para empezar"
  actionLabel="Crear Categoría"
  onAction={handleCreate}
/>
```
- **Props**: `title`, `description`, `actionLabel`, `onAction`, `className`
- **Uso**: Estados vacíos consistentes con acciones opcionales

---

## 🦠 **Organisms** - Secciones Complejas

Los organisms son componentes complejos que combinan molecules y atoms.

### Componentes Disponibles:

#### `DataTable`
```tsx
<DataTable
  data={categories}
  columns={[
    { key: 'name', title: 'Nombre' },
    { key: 'status', title: 'Estado', render: (value) => <StatusBadge status={value}>{value}</StatusBadge> }
  ]}
  loading={isLoading}
  empty={{
    title: 'No hay datos',
    actionLabel: 'Crear nuevo',
    onAction: handleCreate
  }}
  keyExtractor={(item) => item.id}
/>
```
- **Props**: `data`, `columns`, `loading`, `empty`, `keyExtractor`
- **Uso**: Tablas de datos completas con estados de carga y vacío

#### `SearchBar`
```tsx
<SearchBar
  searchParams={searchParams}
  onSearch={handleSearch}
  onReset={handleReset}
>
  {/* Filtros adicionales */}
  <Select>...</Select>
  <DatePicker>...</DatePicker>
</SearchBar>
```
- **Props**: `searchParams`, `onSearch`, `onReset`, `children`
- **Uso**: Barras de búsqueda con filtros personalizables

---

## 📋 **Templates** - Layouts de Página

Los templates definen la estructura y layout de las páginas.

### Estructura Típica:
```tsx
<PageTemplate>
  <PageHeader title="Categorías" />
  <SearchBar />
  <DataTable />
  <Pagination />
</PageTemplate>
```

---

## 🎯 **Principios de Uso**

### 1. **Composición sobre Herencia**
```tsx
// ✅ Bueno: Componer atoms para crear molecules
const CategoryCard = () => (
  <div>
    <StatusBadge status="active">Activo</StatusBadge>
    <ColorSwatch color="#ff0000" />
    <ActionButtonGroup onEdit={handleEdit} />
  </div>
);

// ❌ Malo: Crear componentes monolíticos
const CategoryCardMonolithic = () => (
  <div>
    {/* Todo el código inline */}
  </div>
);
```

### 2. **Reutilización Consistente**
```tsx
// ✅ Bueno: Usar atoms consistentemente
<StatusBadge status="active">Activo</StatusBadge>
<StatusBadge status="error">Error</StatusBadge>

// ❌ Malo: Crear badges diferentes cada vez
<span className="bg-green-100 text-green-800">Activo</span>
<div className="badge-error">Error</div>
```

### 3. **Props Predecibles**
```tsx
// ✅ Bueno: Props consistentes y tipadas
interface AtomProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

// ❌ Malo: Props inconsistentes
interface BadProps {
  big?: boolean;
  type?: string;
  styles?: any;
}
```

---

## 🔄 **Flujo de Desarrollo**

### 1. **Identificar Necesidades**
- ¿Es un elemento básico? → **Atom**
- ¿Combina elementos básicos? → **Molecule**
- ¿Es una sección compleja? → **Organism**
- ¿Define layout de página? → **Template**

### 2. **Crear el Componente**
```bash
# Atoms
src/shared/components/atoms/NewAtom.tsx

# Molecules  
src/shared/components/molecules/NewMolecule.tsx

# Organisms
src/shared/components/organisms/NewOrganism.tsx
```

### 3. **Exportar en el Índice**
```tsx
// src/shared/components/atoms/index.ts
export { NewAtom } from './NewAtom';
```

### 4. **Documentar y Testear**
- Agregar props interface tipada
- Incluir ejemplo de uso
- Agregar tests si es necesario

---

## 📊 **Beneficios Obtenidos**

### ✅ **Consistencia**
- UI coherente en toda la aplicación
- Elementos reutilizables estandarizados
- Menos duplicación de código

### ✅ **Mantenibilidad**
- Cambios centralizados en atoms
- Fácil actualización de estilos
- Componentes pequeños y enfocados

### ✅ **Escalabilidad**
- Nuevas funcionalidades usando componentes existentes
- Fácil onboarding de desarrolladores
- Arquitectura predecible

### ✅ **Performance**
- Componentes memoizados eficientemente
- Reutilización reduce bundle size
- Lazy loading por niveles

---

## 🛠️ **Herramientas de Desarrollo**

### Storybook (Futuro)
```bash
# Para documentar y probar componentes
npm run storybook
```

### Testing
```bash
# Tests unitarios por nivel
npm test atoms
npm test molecules
npm test organisms
```

### Análisis de Bundle
```bash
# Ver impacto de componentes en el bundle
npm run build:analyze
```

---

## 📚 **Ejemplos Prácticos**

### Refactoring de CategoryList
```tsx
// ❌ Antes: Componente monolítico
const CategoryList = () => (
  <div>
    {/* 200+ líneas de código mezclado */}
  </div>
);

// ✅ Después: Composición atómica
const CategoryList = () => (
  <div>
    <SearchBar onSearch={handleSearch} />
    <DataTable 
      data={categories}
      columns={categoryColumns}
      loading={isLoading}
    />
    <Pagination {...paginationProps} />
  </div>
);
```

### Crear Nuevo Componente
```tsx
// 1. Identificar: ¿Qué tipo es?
// Respuesta: Es un atom (elemento básico)

// 2. Crear el atom
// src/shared/components/atoms/Badge.tsx
export const Badge = ({ variant, children }) => (
  <span className={badgeStyles[variant]}>
    {children}
  </span>
);

// 3. Usar en molecules
// src/shared/components/molecules/UserCard.tsx
export const UserCard = ({ user }) => (
  <div>
    <h3>{user.name}</h3>
    <Badge variant="success">Activo</Badge>
  </div>
);
```

---

## 🎨 **Mejores Prácticas**

1. **Mantén los atoms simples y enfocados**
2. **Usa TypeScript para todas las props**
3. **Incluye className como prop para personalización**
4. **Documenta el propósito y uso de cada componente**
5. **Prefiere composición sobre configuración compleja**
6. **Mantén consistencia en naming y estructura**

---

*Esta arquitectura nos permite construir interfaces más mantenibles, consistentes y escalables. Cada componente tiene un propósito claro y puede ser reutilizado eficientemente en toda la aplicación.* 🚀
