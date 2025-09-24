# 📋 Estructura de Formulario UX Optimizada

## **Estructura Base**

```tsx
<div className="max-w-2xl mx-auto">
  <form className="space-y-6" onSubmit={handleSubmit}>
    
    {/* 1. Header Section */}
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Form Title
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Form description or instructions
      </p>
    </div>

    {/* 2. Basic Information Section */}
    <div className="space-y-5">
      {/* Field Group */}
      <div className="space-y-1">
        <Label htmlFor="field" className="text-sm font-medium text-gray-700">
          Field Label *
        </Label>
        <Input 
          id="field" 
          placeholder="Placeholder text"
          className="mt-1"
          {...register('field')} 
          disabled={isLoading} 
        />
        <FormInputError error={errors.field} />
      </div>
    </div>

    {/* 3. Configuration/Advanced Section */}
    <div className="border-t border-gray-200 pt-6">
      <h4 className="text-base font-medium text-gray-900 mb-4">
        Section Title
      </h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Grid fields */}
      </div>
    </div>

    {/* 4. Actions Section */}
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Helper text or instructions
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="min-w-[80px]">
            Cancel
          </Button>
          <Button type="submit" className="min-w-[100px]">
            Submit
          </Button>
        </div>
      </div>
    </div>

  </form>
</div>
```

## **Espaciados y Jerarquía**

### **Contenedor Principal**
- `max-w-2xl mx-auto` - Ancho máximo centrado
- `space-y-6` - Espaciado vertical entre secciones

### **Secciones**
- **Header**: `border-b border-gray-200 pb-4`
- **Content**: `space-y-5` entre campos
- **Dividers**: `border-t border-gray-200 pt-6`

### **Campos**
- **Container**: `space-y-1` - Espaciado mínimo
- **Label**: `text-sm font-medium text-gray-700`
- **Input**: `mt-1` - Margen superior mínimo
- **Error**: Sin margen adicional

### **Grid Layouts**
- **Responsive**: `grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`
- **Gap**: `gap-5` - Espaciado consistente

## **Componentes de Campo**

### **Campo Básico**
```tsx
<div className="space-y-1">
  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
    Field Name *
  </Label>
  <Input 
    id="name" 
    placeholder="Enter value"
    className="mt-1"
    {...register('name')} 
    disabled={isLoading} 
  />
  <FormInputError error={errors.name} />
</div>
```

### **Campo con Descripción**
```tsx
<div className="space-y-1">
  <Label htmlFor="field" className="text-sm font-medium text-gray-700">
    Field Name
  </Label>
  <Input 
    id="field" 
    placeholder="Enter value"
    className="mt-1"
    {...register('field')} 
    disabled={isLoading} 
  />
  <p className="text-xs text-gray-500">Helper text here</p>
  <FormInputError error={errors.field} />
</div>
```

### **Select con Iconos**
```tsx
<Select onValueChange={(value) => setValue('status', value)}>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Active
      </div>
    </SelectItem>
  </SelectContent>
</Select>
```

### **Color Picker**
```tsx
<div className="space-y-1">
  <Label className="text-sm font-medium text-gray-700">Color</Label>
  <div className="relative mt-1">
    <Input type="color" className="h-10 w-full cursor-pointer" />
    <Input placeholder="#000000" className="mt-2 font-mono text-xs" />
  </div>
</div>
```

## **Principios UX Aplicados**

### **1. Jerarquía Visual**
- ✅ Headers claros con bordes divisores
- ✅ Tipografía consistente (lg → base → sm → xs)
- ✅ Espaciado progresivo (6 → 5 → 1)

### **2. Agrupación Lógica**
- ✅ Información básica primero
- ✅ Configuración avanzada separada
- ✅ Acciones al final

### **3. Feedback Visual**
- ✅ Estados de loading
- ✅ Placeholders descriptivos
- ✅ Mensajes de ayuda
- ✅ Errores contextuales

### **4. Accesibilidad**
- ✅ Labels asociados con htmlFor
- ✅ Placeholders descriptivos
- ✅ Estados disabled consistentes
- ✅ Contraste adecuado

### **5. Responsive**
- ✅ Grid adaptativo
- ✅ Ancho máximo en desktop
- ✅ Espaciado consistente en mobile

## **Variaciones**

### **Formulario Simple (1 sección)**
```tsx
<div className="max-w-lg mx-auto">
  <form className="space-y-5">
    <div className="space-y-5">
      {/* Campos aquí */}
    </div>
    
    <div className="pt-4">
      <div className="flex gap-3 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Submit</Button>
      </div>
    </div>
  </form>
</div>
```

### **Formulario Complejo (3+ secciones)**
```tsx
<div className="max-w-4xl mx-auto">
  <form className="space-y-8">
    {/* Multiple sections with border-t separators */}
  </form>
</div>
```

### **Modal Form**
```tsx
<form className="space-y-4">
  {/* Sin max-width, sin header elaborate */}
  <div className="space-y-4">
    {/* Campos */}
  </div>
  
  {/* Actions en DialogFooter */}
</form>
```

## **Clases Clave para Copiar**

```css
/* Contenedores */
.form-container { @apply max-w-2xl mx-auto; }
.form-main { @apply space-y-6; }
.form-section { @apply space-y-5; }
.form-field { @apply space-y-1; }

/* Headers */
.form-header { @apply border-b border-gray-200 pb-4; }
.form-title { @apply text-lg font-semibold text-gray-900; }
.form-subtitle { @apply mt-1 text-sm text-gray-500; }

/* Dividers */
.form-divider { @apply border-t border-gray-200 pt-6; }
.section-title { @apply text-base font-medium text-gray-900 mb-4; }

/* Fields */
.field-label { @apply text-sm font-medium text-gray-700; }
.field-input { @apply mt-1; }
.field-help { @apply text-xs text-gray-500; }

/* Grid */
.form-grid { @apply grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3; }

/* Actions */
.form-actions { @apply border-t border-gray-200 pt-6; }
.actions-row { @apply flex items-center justify-between; }
.actions-buttons { @apply flex items-center gap-3; }
.action-button { @apply min-w-[80px]; }
```

Esta estructura garantiza consistencia, accesibilidad y una excelente experiencia de usuario en todos los formularios.
