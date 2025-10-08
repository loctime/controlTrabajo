# Bolsa de Trabajo - Sistema de Gestión de CVs

Sistema completo para la gestión de currículums vitae con integración de ControlFile para almacenamiento de archivos.

## 🚀 Características

- **Gestión de CVs**: Carga, revisión y aprobación de currículums vitae
- **Fotos de perfil**: Soporte para imágenes de perfil con ControlFile y Firebase Storage
- **Dashboard administrativo**: Panel completo para administradores
- **Sistema de autenticación**: Login y registro de usuarios
- **Notificaciones por email**: Integración con EmailJS
- **Responsive design**: Optimizado para móviles y desktop

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── common/
│   │   └── ControlFileAvatar.jsx    # Componente para mostrar fotos de perfil
│   ├── pages/
│   │   ├── cargaCv/                 # Formulario de carga de CV
│   │   ├── dashboard/               # Panel administrativo
│   │   └── ...
│   └── ...
├── utils/
│   └── shareUrl.js                  # Utilidades para enlaces de ControlFile
└── ...
```

## 🖼️ Fotos de Perfil

El sistema soporta dos tipos de almacenamiento para fotos de perfil:

### Firebase Storage (CVs antiguos)
- URLs directas con formato: `https://firebasestorage.googleapis.com/...`
- Se muestran directamente en el avatar

### ControlFile (CVs nuevos)
- Enlaces de compartido: `https://files.controldoc.app/share/TOKEN`
- Se convierten automáticamente a URLs de imagen: `https://files.controldoc.app/api/shares/TOKEN/image`
- El componente `ControlFileAvatar` maneja la conversión automáticamente

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **UI**: Material-UI (MUI)
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Almacenamiento**: ControlFile + Firebase Storage
- **Email**: EmailJS
- **Routing**: React Router

## 📦 Instalación

```bash
npm install
```

## 🚀 Desarrollo

```bash
npm run dev
```

## 📝 Configuración

Ver archivos de configuración en la carpeta `integracion/` para:
- Configuración de Firebase
- Configuración de ControlFile
- Configuración de EmailJS
- Guías de migración y integración