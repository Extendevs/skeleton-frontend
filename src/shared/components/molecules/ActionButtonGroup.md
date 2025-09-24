# ActionButtonGroup Component

## Descripción

Componente React estandarizado basado en el componente Angular `ListActionsButtonsComponent`. Proporciona un conjunto consistente de botones de acción para operaciones CRUD y funcionalidades de selección.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Modo Seleccionable**: Permite alternar entre estados seleccionado/no seleccionado
2. **Acciones CRUD Completas**: Ver, Editar, Eliminar, Restaurar
3. **Acción de Impresión**: Botón dedicado para funcionalidades de impresión
4. **Diseño Responsivo**: Adaptación automática para dispositivos móviles
5. **Prevención de Eventos**: `stopPropagation` y `preventDefault` automáticos
6. **Soporte para Children**: Equivalente a `ng-content` de Angular
7. **Accesibilidad**: Títulos descriptivos y estados de disabled

### 🎨 Mejoras de Diseño

- **Sistema de Iconos Consistente**: SVG inline sin dependencias externas
- **Colores Semánticos**: Verde para seleccionar, rojo para eliminar/deseleccionar, azul para editar
- **Hover States**: Estados visuales mejorados para mejor UX
- **Sizing Responsivo**: Iconos más grandes en móvil, más pequeños en desktop

### 🔧 Props Interface

```typescript
interface ActionButtonGroupProps {
  // Estados de selección
  isSelectable?: boolean;
  isSelected?: boolean;
  
  // Acciones disponibles
  edit?: boolean;
  remove?: boolean;
  detail?: boolean;
  print?: boolean;
  restore?: boolean;
  dropdown?: boolean;
  mobile?: boolean;
  
  // Event handlers
  onEdit?: () => void;
  onRemove?: () => void;
  onDetail?: () => void;
  onPrint?: () => void;
  onRestore?: () => void;
  onSelect?: () => void;
  
  // Props adicionales de React
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}
```

## Comparación Angular vs React

### Angular (Original)
```typescript
// Inputs
readonly isSelectable = input(false)
readonly isSelected = input(false)
readonly edit = input(false)

// Outputs
openEdit = output<void>()
selected = output<void>()

// Event handling
onOpenEdit(event: Event) {
  event.stopPropagation()
  event.preventDefault()
  this.openEdit.emit()
}
```

### React (Estandarizado)
```typescript
// Props
interface ActionButtonGroupProps {
  isSelectable?: boolean;
  isSelected?: boolean;
  edit?: boolean;
  onEdit?: () => void;
  onSelect?: () => void;
}

// Event handling
const handleEdit = (event: React.MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
  onEdit?.();
};
```

## Ejemplos de Uso

### Uso Básico
```tsx
<ActionButtonGroup
  edit={true}
  remove={true}
  onEdit={() => handleEdit(item)}
  onRemove={() => handleDelete(item)}
/>
```

### Modo Seleccionable
```tsx
<ActionButtonGroup
  isSelectable={true}
  isSelected={selectedItems.includes(item.id)}
  onSelect={() => toggleSelection(item.id)}
/>
```

### En Tabla
```tsx
<TableRow>
  <TableCell>Contenido</TableCell>
  <TableCell className="text-right">
    <ActionButtonGroup
      edit={permissions.canEdit}
      remove={permissions.canDelete}
      onEdit={() => openEditModal(item)}
      onRemove={() => confirmDelete(item)}
    />
  </TableCell>
</TableRow>
```

## Iconos Agregados

Se agregaron los siguientes iconos al sistema para mantener paridad con Angular:

- `PlusSquareIcon` - Para seleccionar
- `MinusSquareIcon` - Para deseleccionar  
- `DocumentIcon` - Para documentos
- `EyeScanIcon` - Para vista detallada
- `CursorIcon` - Para interacciones

## Arquitectura y Patrones

### Principios SOLID Aplicados

1. **Single Responsibility**: Cada función maneja una sola responsabilidad
2. **Open/Closed**: Extensible via props y children sin modificar el core
3. **Interface Segregation**: Props específicas para cada funcionalidad
4. **Dependency Inversion**: Depende de abstracciones (props) no implementaciones

### Patrones de Diseño

- **Template Method**: `OptionsTemplate` como plantilla reutilizable
- **Strategy**: Diferentes variantes (inline/dropdown) con misma interface
- **Observer**: Event handlers como callbacks
- **Composite**: Soporte para children permite composición

### Performance Optimizations

- **Event Handler Optimization**: Funciones estables para evitar re-renders
- **Conditional Rendering**: Solo renderiza elementos necesarios
- **CSS Classes**: Uso de `cn()` para optimización de clases

## Roadmap

### Próximas Mejoras

1. **Dropdown Implementation**: Implementar completamente la variante dropdown
2. **Keyboard Navigation**: Soporte completo para navegación por teclado
3. **Animation States**: Transiciones suaves entre estados
4. **Theme Support**: Soporte para temas light/dark
5. **Testing Suite**: Cobertura completa de tests unitarios

### Consideraciones de Migración

- Mantiene compatibilidad con el componente anterior
- API backward-compatible para facilitar migración
- Documentación completa de breaking changes
- Scripts de migración automática disponibles

## Conclusión

Este componente representa una estandarización completa que mantiene la funcionalidad del Angular original mientras aprovecha las mejores prácticas de React y TypeScript. La implementación prioriza:

- **Mantenibilidad**: Código limpio y bien documentado
- **Escalabilidad**: Fácil extensión y modificación
- **Performance**: Optimizaciones para aplicaciones grandes
- **Developer Experience**: API intuitiva y TypeScript completo
- **User Experience**: Diseño responsivo y accesible
