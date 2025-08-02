# Estándares de Paginación

## Configuración por Defecto

### Tamaño de Página
- **Default**: 10 filas por página
- **Opciones disponibles**: [10, 25, 50]

### Implementación
```tsx
// Para paginación local (categorías/subcategorías)
const [pageSize, setPageSize] = useState(10)

// Para paginación con API (productos)
const [pageSize, setPageSize] = useState(10)
```

### Componente de Paginación
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  pageSizeOptions={[10, 25, 50]} // Opcional, default [10, 25, 50]
/>
```

### Estructura de Contenedor
```tsx
<div className="border rounded-lg bg-white overflow-hidden">
  {/* Tabla */}
  <div className="overflow-x-auto">
    <Table>
      {/* contenido */}
    </Table>
  </div>
  
  {/* Paginación */}
  {totalItems > 0 && (
    <Pagination {...props} />
  )}
</div>
```

## Tablas Implementadas
- ✅ Bodegón Productos (10)
- ✅ Bodegón Categorías (10)
- ✅ Bodegón Subcategorías (10)
- ✅ Restaurant Categorías (10)
- ✅ Restaurant Subcategorías (10)
- ✅ Categorías Principales (10)

## Notas
- Todas las futuras tablas deben usar 10 filas por página por defecto
- La paginación debe seguir el patrón de diseño unificado
- Reset automático a página 1 cuando cambian los filtros