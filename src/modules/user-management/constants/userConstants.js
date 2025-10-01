// 🔐 BASE DE DATOS MOCK - USUARIOS Y PERMISOS
// SI CLINICA FARMA ERP

// Mapeo de dispositivos permitidos por IP
export const deviceIPMapping = {
  'PC-RECEPCION-01': ['192.168.0.10', '192.168.1.110'],
  'PC-CONSULTORIO-01': ['192.168.0.20', '192.168.1.120'],
  'PC-ENFERMERIA-01': ['192.168.0.30', '192.168.1.130'],
  'PC-FARMACIA-01': ['192.168.0.40', '192.168.1.140'],
  'PC-ADMIN-01': ['192.168.0.50', '192.168.1.150'],
  'LAPTOP-DIRECTOR': ['192.168.0.100', '192.168.1.200']
};

// Lista de todas las sedes/sucursales
export const sucursales = [
  'SEDE_PRINCIPAL',
  'SEDE_NORTE',
  'SEDE_SUR',
  'SEDE_CENTRO'
];

// Roles del sistema
export const roles = [
  'ADMINISTRADOR',
  'MEDICO',
  'ENFERMERO',
  'RECEPCIONISTA',
  'LABORATORISTA',
  'FARMACEUTICO_CLINICO'
];

// Permisos por categoría
export const permissionCategories = {
  'Pacientes': [
    { id: 'paciente_crear', label: 'Crear pacientes' },
    { id: 'paciente_ver', label: 'Ver pacientes' },
    { id: 'paciente_editar', label: 'Editar pacientes' },
    { id: 'paciente_eliminar', label: 'Eliminar pacientes' },
    { id: 'historia_clinica_ver', label: 'Ver historia clínica' },
    { id: 'historia_clinica_editar', label: 'Editar historia clínica' }
  ],
  'Citas': [
    { id: 'cita_crear', label: 'Crear citas' },
    { id: 'cita_ver', label: 'Ver citas' },
    { id: 'cita_editar', label: 'Editar citas' },
    { id: 'cita_cancelar', label: 'Cancelar citas' },
    { id: 'agenda_ver', label: 'Ver agenda' },
    { id: 'agenda_gestionar', label: 'Gestionar agenda' }
  ],
  'Consultas': [
    { id: 'consulta_crear', label: 'Registrar consulta' },
    { id: 'consulta_ver', label: 'Ver consultas' },
    { id: 'consulta_editar', label: 'Editar consultas' },
    { id: 'diagnostico_crear', label: 'Crear diagnósticos' },
    { id: 'receta_crear', label: 'Generar recetas' },
    { id: 'receta_ver', label: 'Ver recetas' }
  ],
  'Farmacia': [
    { id: 'medicamento_dispensar', label: 'Dispensar medicamentos' },
    { id: 'medicamento_ver', label: 'Ver inventario medicamentos' },
    { id: 'medicamento_gestionar', label: 'Gestionar medicamentos' },
    { id: 'stock_ver', label: 'Ver stock' },
    { id: 'stock_ajustar', label: 'Ajustar stock' }
  ],
  'Laboratorio': [
    { id: 'orden_lab_crear', label: 'Crear orden laboratorio' },
    { id: 'orden_lab_ver', label: 'Ver órdenes' },
    { id: 'resultado_lab_registrar', label: 'Registrar resultados' },
    { id: 'resultado_lab_ver', label: 'Ver resultados' }
  ],
  'Facturación': [
    { id: 'factura_crear', label: 'Crear facturas' },
    { id: 'factura_ver', label: 'Ver facturas' },
    { id: 'factura_anular', label: 'Anular facturas' },
    { id: 'pago_registrar', label: 'Registrar pagos' },
    { id: 'pago_ver', label: 'Ver pagos' }
  ],
  'Reportes': [
    { id: 'reporte_pacientes', label: 'Reporte de pacientes' },
    { id: 'reporte_consultas', label: 'Reporte de consultas' },
    { id: 'reporte_ingresos', label: 'Reporte de ingresos' },
    { id: 'reporte_inventario', label: 'Reporte de inventario' },
    { id: 'reporte_general', label: 'Reportes generales' }
  ],
  'Usuarios y Seguridad': [
    { id: 'usuario_crear', label: 'Crear usuarios' },
    { id: 'usuario_ver', label: 'Ver usuarios' },
    { id: 'usuario_editar', label: 'Editar usuarios' },
    { id: 'usuario_eliminar', label: 'Eliminar usuarios' },
    { id: 'rol_gestionar', label: 'Gestionar roles' },
    { id: 'permiso_asignar', label: 'Asignar permisos' },
    { id: 'auditoria_ver', label: 'Ver auditoría' }
  ],
  'Configuración': [
    { id: 'config_general', label: 'Configuración general' },
    { id: 'sucursal_gestionar', label: 'Gestionar sucursales' },
    { id: 'especialidad_gestionar', label: 'Gestionar especialidades' },
    { id: 'precio_gestionar', label: 'Gestionar precios' }
  ]
};

// Obtener todos los permisos disponibles
export const getAllPermissions = () => {
  const allPermissions = [];
  Object.values(permissionCategories).forEach(category => {
    category.forEach(permission => {
      allPermissions.push(permission.id);
    });
  });
  return allPermissions;
};

// Usuarios del sistema (mock data)
export const mockUsers = [
  {
    id: 1,
    usuario: 'admin',
    password: 'admin123',
    nombreCompleto: 'Dr. Carlos Administrador',
    nombreEquipo: 'PC-ADMIN-01',
    email: 'admin@siclinicafarma.com',
    rol: 'ADMINISTRADOR',
    sucursal: 'SEDE_PRINCIPAL',
    permisos: getAllPermissions(), // Acceso total
    estado: 'Activo',
    ultimoAcceso: '2025-09-30 10:30:00',
    telefono: '+591 70000000',
    especialidad: 'Administración',
    horario: {
      lunes: { activo: true, inicio: '08:00', fin: '18:00' },
      martes: { activo: true, inicio: '08:00', fin: '18:00' },
      miercoles: { activo: true, inicio: '08:00', fin: '18:00' },
      jueves: { activo: true, inicio: '08:00', fin: '18:00' },
      viernes: { activo: true, inicio: '08:00', fin: '18:00' },
      sabado: { activo: false, inicio: '', fin: '' },
      domingo: { activo: false, inicio: '', fin: '' }
    }
  },
  {
    id: 2,
    usuario: 'dr.perez',
    password: 'medico123',
    nombreCompleto: 'Dr. Juan Pérez',
    nombreEquipo: 'PC-CONSULTORIO-01',
    email: 'jperez@siclinicafarma.com',
    rol: 'MEDICO',
    sucursal: 'SEDE_PRINCIPAL',
    permisos: [
      'paciente_ver', 'historia_clinica_ver', 'historia_clinica_editar',
      'cita_ver', 'agenda_ver', 
      'consulta_crear', 'consulta_ver', 'consulta_editar',
      'diagnostico_crear', 'receta_crear', 'receta_ver',
      'orden_lab_crear', 'orden_lab_ver', 'resultado_lab_ver',
      'reporte_consultas'
    ],
    estado: 'Activo',
    ultimoAcceso: '2025-09-30 09:15:00',
    telefono: '+591 71111111',
    especialidad: 'Medicina General',
    horario: {
      lunes: { activo: true, inicio: '09:00', fin: '17:00' },
      martes: { activo: true, inicio: '09:00', fin: '17:00' },
      miercoles: { activo: true, inicio: '09:00', fin: '17:00' },
      jueves: { activo: true, inicio: '09:00', fin: '17:00' },
      viernes: { activo: true, inicio: '09:00', fin: '17:00' },
      sabado: { activo: false, inicio: '', fin: '' },
      domingo: { activo: false, inicio: '', fin: '' }
    }
  },
  {
    id: 3,
    usuario: 'enf.lopez',
    password: 'enfermero123',
    nombreCompleto: 'María López',
    nombreEquipo: 'PC-ENFERMERIA-01',
    email: 'mlopez@siclinicafarma.com',
    rol: 'ENFERMERO',
    sucursal: 'SEDE_PRINCIPAL',
    permisos: [
      'paciente_crear', 'paciente_ver', 'paciente_editar',
      'historia_clinica_ver',
      'cita_ver',
      'orden_lab_crear', 'orden_lab_ver',
      'medicamento_dispensar', 'medicamento_ver'
    ],
    estado: 'Activo',
    ultimoAcceso: '2025-09-30 08:45:00',
    telefono: '+591 72222222',
    especialidad: 'Enfermería',
    horario: {
      lunes: { activo: true, inicio: '07:00', fin: '15:00' },
      martes: { activo: true, inicio: '07:00', fin: '15:00' },
      miercoles: { activo: true, inicio: '07:00', fin: '15:00' },
      jueves: { activo: true, inicio: '07:00', fin: '15:00' },
      viernes: { activo: true, inicio: '07:00', fin: '15:00' },
      sabado: { activo: true, inicio: '07:00', fin: '13:00' },
      domingo: { activo: false, inicio: '', fin: '' }
    }
  },
  {
    id: 4,
    usuario: 'recep.garcia',
    password: 'recepcion123',
    nombreCompleto: 'Ana García',
    nombreEquipo: 'PC-RECEPCION-01',
    email: 'agarcia@siclinicafarma.com',
    rol: 'RECEPCIONISTA',
    sucursal: 'SEDE_PRINCIPAL',
    permisos: [
      'paciente_crear', 'paciente_ver', 'paciente_editar',
      'cita_crear', 'cita_ver', 'cita_editar', 'cita_cancelar',
      'agenda_ver',
      'factura_crear', 'factura_ver', 'pago_registrar', 'pago_ver'
    ],
    estado: 'Activo',
    ultimoAcceso: '2025-09-30 08:00:00',
    telefono: '+591 73333333',
    especialidad: 'Atención al Cliente',
    horario: {
      lunes: { activo: true, inicio: '08:00', fin: '16:00' },
      martes: { activo: true, inicio: '08:00', fin: '16:00' },
      miercoles: { activo: true, inicio: '08:00', fin: '16:00' },
      jueves: { activo: true, inicio: '08:00', fin: '16:00' },
      viernes: { activo: true, inicio: '08:00', fin: '16:00' },
      sabado: { activo: true, inicio: '08:00', fin: '12:00' },
      domingo: { activo: false, inicio: '', fin: '' }
    }
  }
];

// Función para validar credenciales
export const validateCredentials = (username, password) => {
  const user = mockUsers.find(
    u => u.usuario === username && u.password === password && u.estado === 'Activo'
  );
  return user || null;
};

export default {
  deviceIPMapping,
  sucursales,
  roles,
  permissionCategories,
  mockUsers,
  validateCredentials,
  getAllPermissions
};