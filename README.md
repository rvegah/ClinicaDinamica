# 🏥 SI CLINICA FARMA - Sistema ERP Clínico

Sistema integral de gestión clínica desarrollado con React, Material-UI y Vite.

## 🚀 Características

- ✅ Sistema de autenticación con roles y permisos
- ✅ Dashboard responsivo con modo claro/oscuro
- ✅ Gestión de usuarios con diferentes niveles de acceso
- ✅ Interfaz moderna con Material-UI v5
- ✅ Tema corporativo personalizado
- ✅ Sidebar dinámico según permisos

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Notifications**: Notistack
- **HTTP Client**: Axios

## 📋 Módulos del Sistema

- 👥 Gestión de Pacientes
- 📅 Agenda de Citas
- 🩺 Consultas Médicas
- 💊 Farmacia e Inventario
- 🧪 Laboratorio
- 💰 Facturación
- 📊 Reportes y Estadísticas
- 👤 Gestión de Usuarios
- ⚙️ Configuración del Sistema

## 🔐 Usuarios de Prueba
admin / admin123          - Administrador (acceso total)
dr.perez / medico123      - Médico
enf.lopez / enfermero123  - Enfermero
recep.garcia / recepcion123 - Recepcionista

## 💻 Instalación y Uso
```bash
# Clonar el repositorio
git clone https://github.com/rvegah/ClinicaDinamica.git

# Instalar dependencias
cd ClinicaDinamica
npm install

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build
🎨 Colores Corporativos

Primary: #0066CC (Azul médico)
Secondary: #00A86B (Verde salud)

📁 Estructura del Proyecto
src/
├── app/                    # Configuración de la app
│   ├── AppRoutes.jsx
│   ├── theme.js
│   └── ThemeContext.jsx
├── modules/                # Módulos del sistema
│   ├── patients/
│   ├── appointments/
│   ├── consultations/
│   └── ...
├── shared/                 # Componentes compartidos
│   └── components/
└── config/                 # Configuraciones
    └── menuPermissions.js
    
🐳 Docker (Próximamente)
El proyecto incluirá soporte para Docker con:

Dockerfile optimizado
docker-compose.yml
Nginx para producción

📝 Licencia
© 2025 SI CLINICA FARMA - Todos los derechos reservados
👨‍💻 Autor
Rodrigo Vega - GitHub