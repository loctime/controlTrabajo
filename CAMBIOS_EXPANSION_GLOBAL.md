# Cambios: Expansión Global de la Bolsa de Trabajo

## Resumen de Cambios Implementados

Se ha transformado la plataforma de bolsa de trabajo local a una plataforma global con las siguientes mejoras:

### 1. ✅ Sistema de Ubicación Multinivel
- **Antes:** Solo San Nicolás y Ramallo
- **Ahora:** Cualquier país del mundo con estructura:
  - País (lista predefinida de países de habla hispana + otros)
  - Estado/Provincia (listas predefinidas para países principales)
  - Ciudad (texto libre)
  - Localidad/Barrio (opcional)

### 2. ✅ Categorías Profesionales Mejoradas
- **Antes:** Lista fija de profesiones específicas
- **Ahora:** Sistema de dos niveles:
  - **Categoría General** (obligatoria): 21 categorías amplias (Medicina, Informática, Construcción, etc.)
  - **Profesión Específica** (opcional): Campo libre para detallar

### 3. ✅ Sistema de Rechazo con Retroalimentación
- Los administradores deben proporcionar un **motivo obligatorio** al rechazar CVs
- Los usuarios pueden ver:
  - Estado de su CV (pendiente/aprobado/rechazado)
  - Motivo del rechazo
  - Fecha del rechazo
- Opciones para usuarios con CVs rechazados:
  - Editar y reenviar el mismo CV
  - Subir un CV completamente nuevo

### 4. ✅ Nueva Página "Mi CV"
- Accesible desde el menú de navegación
- Muestra el estado actual del CV del usuario
- Información detallada del perfil
- Acciones según el estado

### 5. ✅ Filtros de Búsqueda Mejorados
- **Nuevos filtros:**
  - Por Categoría Profesional
  - Por País
  - Por Estado/Provincia (dependiente del país)
  - Por Ciudad (búsqueda de texto)
- **Características:**
  - Chips visuales de filtros activos
  - Contador de resultados
  - Botón para limpiar todos los filtros
  - Compatible con CVs antiguos y nuevos

### 6. ✅ Registro Simplificado
- **Eliminado:** Restricción de ciudad en el registro
- **Ahora:** Solo nombre, email y contraseña
- La ubicación detallada se solicita al cargar el CV

## Archivos Creados

1. `src/constants/categories.js` - Categorías profesionales
2. `src/constants/locations.js` - Países y estados/provincias
3. `src/components/pages/cvStatus/CvStatus.jsx` - Componente de estado de CV
4. `src/utils/migrateData.js` - Script de migración de datos existentes

## Archivos Modificados

1. `src/components/pages/register/Register.jsx` - Registro simplificado
2. `src/components/pages/cargaCv/cargaCv.jsx` - Formulario de CV actualizado
3. `src/components/pages/dashboard/Dashboard.jsx` - Dashboard con motivos de rechazo
4. `src/components/pages/itemlist/ItemListContainer.jsx` - Filtros mejorados
5. `src/router/routes.js` - Nueva ruta "Mi CV"
6. `src/router/navigation.js` - Link "Mi CV" en navegación

## Modelo de Datos Actualizado

### Nuevos campos en la colección `cv`:

```javascript
{
  // Ubicación (nuevo)
  pais: "Argentina",
  estadoProvincia: "Buenos Aires",
  ciudad: "San Nicolás de los Arroyos",
  localidad: "Centro", // opcional
  
  // Profesión (nuevo)
  categoriaGeneral: "Informática y Tecnología",
  categoriaEspecifica: "Desarrollador Frontend", // opcional
  
  // Sistema de rechazo (nuevo)
  motivoRechazo: "La foto no es adecuada", // solo si rechazado
  fechaRechazo: Timestamp, // solo si rechazado
  versionCV: 1,
  
  // Campos existentes que se mantienen
  Nombre: "Juan",
  Apellido: "Pérez",
  Edad: "30",
  Email: "juan@email.com",
  Foto: "url...",
  cv: "url...",
  estado: "pendiente|aprobado|no aprobado",
  uid: "firebase-uid",
  
  // Campos legacy (se mantienen por compatibilidad)
  Ciudad: "San Nicolás", // aún funciona con filtros
  Profesion: "Ingeniero" // aún funciona con filtros
}
```

## Migración de Datos Existentes (Opcional)

Si tienes CVs existentes en la base de datos, puedes migrarlos usando el script:

### Opción 1: Dry Run (ver cambios sin aplicar)
```javascript
// En la consola del navegador
await dryRunMigration()
```

### Opción 2: Migrar todos los CVs
```javascript
// En la consola del navegador
await migrateExistingCVs()
```

### Opción 3: Migrar un CV específico
```javascript
// En la consola del navegador
await migrateSingleCV("id-del-cv")
```

El script:
- Convierte "San Nicolás" → Argentina, Buenos Aires, San Nicolás
- Convierte "Ramallo" → Argentina, Buenos Aires, Ramallo
- Mapea profesiones antiguas a categorías generales
- Mantiene la profesión original como categoría específica
- Agrega versionCV: 1
- **No modifica CVs ya migrados**

## Compatibilidad con Datos Antiguos

La aplicación es **100% compatible con CVs antiguos**:
- Los filtros funcionan con `Ciudad` o `ciudad`
- Los filtros funcionan con `Profesion` o `categoriaGeneral`
- Los CVs antiguos se muestran correctamente
- No es necesario migrar para que funcione

## Funcionalidades por Rol

### Usuarios Regulares
- ✅ Registrarse desde cualquier parte del mundo
- ✅ Cargar CV con ubicación detallada
- ✅ Ver estado de su CV en "Mi CV"
- ✅ Ver motivo si fue rechazado
- ✅ Editar y reenviar CV rechazado
- ✅ Navegar CVs aprobados con filtros avanzados

### Administradores
- ✅ Ver CVs pendientes, aprobados y rechazados
- ✅ Aprobar CVs
- ✅ Rechazar CVs con motivo obligatorio
- ✅ Ver motivos de rechazo en tabla
- ✅ Editar CVs
- ✅ Eliminar CVs

## Próximos Pasos Sugeridos

1. **Migración de datos:** Ejecutar el script de migración si tienes CVs existentes
2. **Testing:** Probar el flujo completo:
   - Registro → Carga de CV → Revisión → Aprobación/Rechazo
   - Filtros de búsqueda con diferentes combinaciones
   - Estado de CV desde la perspectiva del usuario
3. **Ajustes visuales:** Personalizar estilos si es necesario
4. **Notificaciones por email:** Configurar EmailJS para notificar rechazos (opcional)

## Notas Importantes

- **Backward Compatibility:** Todos los cambios son compatibles con datos existentes
- **Validaciones:** Los formularios validan correctamente todos los campos nuevos
- **Performance:** Los filtros funcionan eficientemente incluso con muchos CVs
- **UX:** Mensajes claros en español, chips visuales, contador de resultados

## Soporte

Si encuentras algún problema o necesitas ajustes, revisa:
- Consola del navegador para errores
- Firestore para verificar estructura de datos
- Componente específico según la funcionalidad afectada

