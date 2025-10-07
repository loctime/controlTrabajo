# 📚 Documentación de Integración con Apps Externas

Esta carpeta contiene toda la documentación necesaria para integrar aplicaciones externas con ControlFile, permitiéndoles usar el sistema de almacenamiento como reemplazo de Firebase Storage.

## 📖 Guías Disponibles

### 🎯 Para Diferentes Audiencias

| Documento | Audiencia | Descripción | Tiempo de lectura |
|-----------|-----------|-------------|-------------------|
| **[RESUMEN_EJECUTIVO_INTEGRACION.md](./RESUMEN_EJECUTIVO_INTEGRACION.md)** | 👔 Gerentes/CTOs | Respuesta ejecutiva a la pregunta de integración, comparación de opciones | 5 min |
| **[README_INTEGRACION_RAPIDA.md](./README_INTEGRACION_RAPIDA.md)** ⭐ | 👨‍💻 Programadores | Guía práctica paso a paso con código listo para usar | 10 min + implementación |
| **[CHECKLIST_ADMIN_INTEGRACION.md](./CHECKLIST_ADMIN_INTEGRACION.md)** | 🔧 Admins Backend | Checklist de configuración del backend y asignación de accesos | 15 min |
| **[GUIA_INTEGRACION_APPS_EXTERNAS.md](./GUIA_INTEGRACION_APPS_EXTERNAS.md)** | 🏗️ Arquitectos | Documentación técnica completa con ambos escenarios de integración | 30 min |

## 🚀 Inicio Rápido

### Si eres el coordinador de la integración:
1. Lee el **RESUMEN_EJECUTIVO_INTEGRACION.md** (5 min)
2. Decide qué escenario usar (Escenario 1 recomendado en el 95% de los casos)
3. Entrega **README_INTEGRACION_RAPIDA.md** al equipo de desarrollo
4. Entrega **CHECKLIST_ADMIN_INTEGRACION.md** al administrador del backend

### Si eres programador de la app externa:
1. Ve directo a **README_INTEGRACION_RAPIDA.md** ⭐
2. Sigue los 5 pasos de instalación
3. Copia y pega el código
4. ¡Listo! Tienes storage funcionando

### Si eres administrador del backend:
1. Lee **CHECKLIST_ADMIN_INTEGRACION.md**
2. Sigue la lista de verificación paso a paso
3. Usa los scripts proporcionados para configurar usuarios
4. Verifica la integración con el script de prueba

### Si necesitas entender la arquitectura completa:
1. Lee **GUIA_INTEGRACION_APPS_EXTERNAS.md**
2. Revisa los diagramas de arquitectura
3. Compara Escenario 1 vs Escenario 2
4. Toma una decisión informada

## 🔍 Resumen de Escenarios

### Escenario 1: Firebase Auth Compartido ⭐ RECOMENDADO

```
App Externa → Firebase Auth Central → Backend ControlFile → Backblaze B2
                (compartido)
```

**Ventajas:**
- ✅ Simple y rápido (5 min setup)
- ✅ Sin código adicional
- ✅ SSO entre apps
- ✅ Bajo costo

**Qué se comparte:**
- Firebase Auth (usuarios)
- Backend ControlFile (API)
- Almacenamiento B2

**Qué NO se comparte:**
- Firestore de datos (cada app tiene el suyo)
- Frontend
- Lógica de negocio

### Escenario 2: Firebase Auth Separado ⚠️ AVANZADO

```
App Externa → Tu Firebase Auth → Proxy Auth → ControlFile Auth → Backend → B2
```

**Solo usar si:**
- Restricciones de compliance
- Imposible migrar usuarios
- Requisitos de negocio específicos

**Desventajas:**
- ⚠️ Alta complejidad
- ⚠️ Latencia adicional
- ⚠️ Costos de infraestructura extra
- ⚠️ Más puntos de fallo

## 📦 Funcionalidades Disponibles

La integración proporciona acceso completo a:

- ✅ **Subida de archivos** (con proxy para evitar CORS)
- ✅ **Descarga de archivos** (URLs temporales)
- ✅ **Listado de archivos y carpetas**
- ✅ **Eliminación de archivos**
- ✅ **Compartir archivos** (enlaces públicos con expiración)
- ✅ **Creación de carpetas**
- ✅ **Sistema de cuotas por usuario**
- ✅ **Gestión de versiones** (reemplazar archivos)
- ✅ **Búsqueda y filtrado**

## 🛠️ Tecnologías Utilizadas

- **Autenticación**: Firebase Auth (JWT tokens)
- **Backend**: Node.js/Express (ya desplegado)
- **Storage**: Backblaze B2 (S3-compatible)
- **Base de datos**: Firestore (metadata de archivos)
- **Proxy**: Sistema de upload sin CORS
- **CDN**: Cloudflare Workers (opcional)

## 📊 Comparación Rápida

| Característica | Escenario 1 | Escenario 2 |
|----------------|-------------|-------------|
| Tiempo de implementación | 5 minutos | 2-5 días |
| Complejidad | ⭐ Baja | ⭐⭐⭐⭐ Alta |
| Mantenimiento | ⭐⭐⭐⭐⭐ Fácil | ⭐⭐ Difícil |
| Latencia | ⭐⭐⭐⭐⭐ Baja | ⭐⭐ Media |
| Costos adicionales | $0 | $5-20/mes |
| SSO | ✅ Sí | ❌ No |
| Proyectos Firebase | 1 compartido | 2 separados |

## 🎓 Ejemplos de Código

### Upload básico

```typescript
import { uploadFile } from '@/lib/storage';

const fileId = await uploadFile(file, null, (progress) => {
  console.log(`Subiendo: ${progress}%`);
});

console.log('Archivo subido:', fileId);
```

### Download

```typescript
import { getDownloadUrl } from '@/lib/storage';

const url = await getDownloadUrl(fileId);
window.open(url, '_blank'); // Válido por 5 minutos
```

### Compartir

```typescript
import { shareFile } from '@/lib/storage';

const shareUrl = await shareFile(fileId, 24); // 24 horas
navigator.clipboard.writeText(shareUrl);
```

Ver ejemplos completos en **README_INTEGRACION_RAPIDA.md**.

## 🔐 Seguridad

- **Autenticación**: JWT tokens de Firebase
- **Autorización**: Claims personalizados por app
- **Aislamiento**: Archivos separados por usuario (no por app)
- **URLs temporales**: Expiración en 5 minutos
- **CORS**: Configurado por dominio
- **Validación**: En cada request del backend

## 📞 Soporte

**Documentación adicional:**
- [API_REFERENCE.md](../../API_REFERENCE.md) - Referencia completa de endpoints
- [API_INTEGRATION.md](../../API_INTEGRATION.md) - Guía técnica de integración original

**Contacto:**
- Email: soporte@controldoc.app
- Issues: GitHub del proyecto

## 🗺️ Roadmap de Integración

### Fase 1: Preparación (1 día)
- [ ] Leer documentación
- [ ] Decidir escenario
- [ ] Obtener credenciales
- [ ] Configurar CORS en backend

### Fase 2: Implementación (1-2 días)
- [ ] Configurar Firebase Auth en app externa
- [ ] Implementar cliente de ControlFile
- [ ] Crear componentes de UI
- [ ] Asignar claims a usuarios de prueba

### Fase 3: Testing (1 día)
- [ ] Probar upload/download
- [ ] Probar compartir
- [ ] Probar eliminación
- [ ] Verificar cuotas

### Fase 4: Producción
- [ ] Migrar usuarios (si aplica)
- [ ] Desplegar a producción
- [ ] Monitorear logs
- [ ] Recolectar feedback

## ✅ Checklist Rápido

### Para el equipo de desarrollo:
- [ ] Instalar `firebase` package
- [ ] Configurar Firebase Auth Central
- [ ] Copiar cliente de ControlFile
- [ ] Implementar componentes de upload/download
- [ ] Probar en desarrollo
- [ ] Desplegar a producción

### Para el administrador:
- [ ] Configurar `ALLOWED_ORIGINS` en backend
- [ ] Asignar claims a usuarios
- [ ] Verificar cuotas
- [ ] Monitorear logs

### Para todos:
- [ ] Leer la documentación relevante
- [ ] Entender el flujo de autenticación
- [ ] Conocer las limitaciones
- [ ] Tener plan de soporte

## 📝 Historial de Versiones

- **v1.0.0** (Octubre 2025) - Documentación inicial completa
  - Escenario 1: Firebase Auth Compartido
  - Escenario 2: Firebase Auth Separado
  - Guías para todas las audiencias
  - Scripts de verificación

## 🎯 Casos de Uso Comunes

### 1. App de Facturación
```
- Usuarios se autentican con Firebase Auth Central
- Facturas (datos) en Firestore propio
- PDFs de facturas en ControlFile
- Compartir facturas con clientes vía link público
```

### 2. App de Recursos Humanos
```
- Empleados se autentican con Auth Central
- Datos de empleados en Firestore propio
- Documentos (contratos, CV) en ControlFile
- Descarga segura de documentos
```

### 3. App de Gestión de Proyectos
```
- Equipo se autentica con Auth Central
- Tareas/proyectos en Firestore propio
- Archivos adjuntos en ControlFile
- Compartir archivos entre miembros del equipo
```

---

**¿Por dónde empezar?**

1. 👔 **Ejecutivo/Gerente** → Lee [RESUMEN_EJECUTIVO_INTEGRACION.md](./RESUMEN_EJECUTIVO_INTEGRACION.md)
2. 👨‍💻 **Programador** → Lee [README_INTEGRACION_RAPIDA.md](./README_INTEGRACION_RAPIDA.md) ⭐
3. 🔧 **Admin Backend** → Lee [CHECKLIST_ADMIN_INTEGRACION.md](./CHECKLIST_ADMIN_INTEGRACION.md)
4. 🏗️ **Arquitecto** → Lee [GUIA_INTEGRACION_APPS_EXTERNAS.md](./GUIA_INTEGRACION_APPS_EXTERNAS.md)

**¡Buena suerte con tu integración!** 🚀

