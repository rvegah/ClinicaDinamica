// src/modules/user-management/constants/userConstants.js - Con sistema de permisos Y TÍTULOS

// Constantes de configuración
export const sucursales = ['BRASIL', 'SAN MARTIN', 'URUGUAY', 'TIQUIPAYA'];
export const roles = ['ADMIN', 'FARMACEUTICO', 'VENDEDOR', 'SUPERVISOR', 'CONTADOR'];
export const tiposUsuario = ['ADMINISTRADOR', 'USUARIO NORMAL', 'INVITADO'];
export const generos = ['Masculino', 'Femenino'];

// 🆕 NUEVO: Títulos académicos con códigos para el API
export const titulos = [
  { codigo: "Tec", descripcion: "Técnico" },
  { codigo: "Lic", descripcion: "Licenciado" },
  { codigo: "Ing", descripcion: "Ingeniero" },
  { codigo: "MSc", descripcion: "Master" },
  { codigo: "Doc", descripcion: "Doctor" },
  { codigo: "Phd", descripcion: "PhD" },
];

// Mapeo de equipos a IPs autorizadas
export const deviceIPMapping = {
  'PC-BRASIL-01': ['192.168.0.8', '192.168.1.101'],
  'PC-BRASIL-02': ['192.168.0.8', '192.168.1.102'],  
  'PC-SANMARTIN-01': ['192.168.1.201'],
  'PC-SANMARTIN-02': ['192.168.0.8'],
  'PC-URUGUAY-01': ['192.168.1.301'],
  'PC-TIQUIPAYA-01': ['192.168.1.401']
};

// Credenciales de usuarios para login
export const loginCredentials = [
  { usuario: 'brasil_admin', password: '123', nombreEquipo: 'PC-BRASIL-01' },
  { usuario: 'brasil_farm01', password: '123', nombreEquipo: 'PC-BRASIL-02' },
  { usuario: 'sanmartin_admin', password: '123', nombreEquipo: 'PC-SANMARTIN-01' },
  { usuario: 'veronica_brasil', password: '123', nombreEquipo: 'PC-SANMARTIN-02' },
  { usuario: 'valerio_valerolo', password: '123', nombreEquipo: 'PC-URUGUAY-01' },
  { usuario: 'xinienio_xinienito', password: '123', nombreEquipo: 'PC-TIQUIPAYA-01' }
];

// NUEVO: Permisos por defecto según rol
const defaultPermissionsByRole = {
  ADMIN: [
    // Usuarios
    'usuario_crear', 'usuario_lista', 'usuario_editar', 'usuario_eliminar', 'usuario_permisos',
    // Productos
    'producto_ver', 'producto_crear', 'producto_editar', 'producto_eliminar', 'producto_categorias', 'producto_inventario',
    // Compras
    'compra_crear', 'compra_editar', 'compra_salida', 'compra_credito', 'compra_ingresos', 'compra_almacen', 'compra_ordenes',
    // Proveedor
    'proveedor_crear', 'proveedor_editar', 'proveedor_ver', 'proveedor_eliminar',
    // Ventas
    'venta_crear', 'venta_editar', 'venta_pedidos', 'venta_mis_pedidos', 'venta_cancelar', 'venta_devoluciones',
    // Traspasos
    'traspaso_crear', 'traspaso_aprobar', 'traspaso_recibir', 'traspaso_historial',
    // Reportes (todos)
    'reporte_diario', 'reporte_mensual', 'reporte_productos', 'reporte_ventas', 'reporte_compras', 
    'reporte_inventario', 'reporte_vencidos', 'reporte_stock', 'reporte_sucursales', 
    'reporte_productos_vencidos', 'reporte_categorias', 'reporte_proveedores', 
    'reporte_mas_vendidos', 'reporte_asistencia', 'reporte_kardex', 'reporte_pedidos',
    // Sistema
    'sistema_respaldos', 'sistema_configuracion', 'sistema_sucursales', 'sistema_logs', 
    'sistema_mantenimiento', 'sistema_actualizaciones', 'sistema_seguridad', 'sistema_base_datos'
  ],
  FARMACEUTICO: [
    'producto_ver', 'producto_editar', 'producto_inventario',
    'venta_crear', 'venta_pedidos', 'venta_devoluciones',
    'farmacia_recetas', 'farmacia_controlados', 'farmacia_preparaciones', 'farmacia_consulta', 'farmacia_control_inventario',
    'cliente_ver', 'cliente_historial',
    'reporte_diario', 'reporte_inventario', 'reporte_vencidos', 'reporte_kardex'
  ],
  VENDEDOR: [
    'producto_ver',
    'venta_crear', 'venta_mis_pedidos',
    'cliente_crear', 'cliente_ver', 'cliente_historial',
    'reporte_diario'
  ],
  SUPERVISOR: [
    'producto_ver', 'producto_editar',
    'venta_crear', 'venta_pedidos', 'venta_cancelar',
    'compra_crear', 'compra_editar',
    'traspaso_crear', 'traspaso_aprobar', 'traspaso_historial',
    'cliente_ver', 'cliente_editar', 'cliente_historial', 'cliente_credito',
    'reporte_diario', 'reporte_mensual', 'reporte_ventas', 'reporte_inventario', 
    'reporte_compras', 'reporte_sucursales', 'reporte_asistencia'
  ],
  CONTADOR: [
    'finanzas_ingresos_diarios', 'finanzas_ingresos_mensuales', 'finanzas_gastos', 
    'finanzas_flujo_caja', 'finanzas_cuentas', 'finanzas_pagos',
    'reporte_diario', 'reporte_mensual', 'reporte_ventas', 'reporte_compras', 'reporte_sucursales',
    'proveedor_ver',
    'cliente_ver', 'cliente_credito'
  ]
};

// Datos completos de usuarios - CON PERMISOS
export const allUsers = [
  {
    id: 1,
    usuario: 'brasil_admin',
    nombreCompleto: 'Brasil Admin',
    nombreEquipo: 'PC-BRASIL-01',
    email: 'brazil@hotmail.es',
    cedula: '12345678',
    telefono: '655999',
    rol: 'ADMIN',
    sucursal: 'BRASIL',
    genero: 'Masculino',
    direccion: 'Av. Principal 123',
    estado: 'Activo',
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-09-16 10:30',
    permisos: defaultPermissionsByRole.ADMIN
  },
  {
    id: 2,
    usuario: 'brasil_farm01',
    nombreCompleto: 'MARCELA VILCA',
    nombreEquipo: 'PC-BRASIL-02',
    email: 'marcela@sifarma.com',
    cedula: '87654321',
    telefono: '77788899',
    rol: 'FARMACEUTICO',
    sucursal: 'BRASIL',
    genero: 'Femenino',
    direccion: 'Calle Brasil 456',
    estado: 'Habilitado',
    fechaCreacion: '2024-02-10',
    ultimoAcceso: '2024-09-15 16:45',
    permisos: defaultPermissionsByRole.FARMACEUTICO
  },
  {
    id: 3,
    usuario: 'sanmartin_admin',
    nombreCompleto: 'USUARIO DE PRUEBA',
    nombreEquipo: 'PC-SANMARTIN-01',
    email: 'sanmartin@sifarma.com',
    cedula: '11223344',
    telefono: '66677788',
    rol: 'ADMIN',
    sucursal: 'SAN MARTIN',
    genero: 'Masculino',
    direccion: 'Av. San Martin 789',
    estado: 'Habilitado',
    fechaCreacion: '2024-03-05',
    ultimoAcceso: '2024-09-10 14:20',
    permisos: defaultPermissionsByRole.ADMIN
  },
  {
    id: 4,
    usuario: 'veronica_brasil',
    nombreCompleto: 'VERONICA OCAÑA',
    nombreEquipo: 'PC-SANMARTIN-02',
    email: 'veronica@sifarma.com',
    cedula: '55443322',
    telefono: '99887766',
    rol: 'VENDEDOR',
    sucursal: 'SAN MARTIN',
    genero: 'Femenino',
    direccion: 'Calle Veronica 321',
    estado: 'Habilitado',
    fechaCreacion: '2024-04-12',
    ultimoAcceso: '2024-09-12 11:30',
    permisos: defaultPermissionsByRole.VENDEDOR
  },
  {
    id: 5,
    usuario: 'valerio_valerolo',
    nombreCompleto: 'Valerio Valerolo',
    nombreEquipo: 'PC-URUGUAY-01',
    email: 'valerio@sifarma.com',
    cedula: '44556677',
    telefono: '88776655',
    rol: 'SUPERVISOR',
    sucursal: 'URUGUAY',
    genero: 'Masculino',
    direccion: 'Uruguay Central 654',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-05-20',
    ultimoAcceso: '2024-09-05 09:15',
    permisos: defaultPermissionsByRole.SUPERVISOR
  },
  {
    id: 6,
    usuario: 'xinienio_xinienito',
    nombreCompleto: 'Xinienio Xinienito',
    nombreEquipo: 'PC-TIQUIPAYA-01',
    email: 'xinienio@sifarma.com',
    cedula: '33445566',
    telefono: '77665544',
    rol: 'FARMACEUTICO',
    sucursal: 'TIQUIPAYA',
    genero: 'Masculino',
    direccion: 'Tiquipaya Norte 987',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-06-15',
    ultimoAcceso: '2024-08-30 15:45',
    permisos: defaultPermissionsByRole.FARMACEUTICO
  }
];

// Configuración de usuario actual (simulando sesión)
export const currentUserConfig = {
  sucursal: 'BRASIL',
  isAdmin: true
};

// Estructura del formulario inicial
export const initialFormState = {
  sucursal_ID: "",               // ID numérico o vacío
  sucursal: "",                  // nombre opcional
  rol_ID: "",                    // ID numérico o vacío
  tipoUsuarioInterno: "",        // INT, EXT, API, etc.
  tipoUsuarioDescripcion: "",    // descripción auxiliar
  usuario: "",
  password: "",
  cedula: "",
  nombreCompleto: "",
  apellidos: "",
  titulo: "",
  genero: "M",                   // "M" = Masculino, "F" = Femenino
  telefono: "",
  email: "",
  direccion: "",
  nombreEquipo: "",
  equipoComputo_ID: "",          // opcional
};

// Campos obligatorios para validación
export const requiredFields = ['usuario', 'password', 'nombreCompleto', 'email'];
export const requiredFieldsEdit = ['usuario', 'nombreCompleto', 'email'];

// Función helper para obtener IPs autorizadas de un equipo
export const getAuthorizedIPs = (nombreEquipo) => {
  return deviceIPMapping[nombreEquipo] || [];
};

// Función helper para validar credenciales y obtener nombreEquipo + PERMISOS
export const validateCredentials = (usuario, password) => {
  const credentials = loginCredentials.find(cred => 
    cred.usuario === usuario && cred.password === password
  );
  
  if (credentials) {
    // Buscar el usuario completo para obtener sus permisos
    const fullUser = allUsers.find(u => u.usuario === usuario);
    return {
      ...credentials,
      permisos: fullUser?.permisos || []
    };
  }
  
  return null;
};

// NUEVO: Función para obtener permisos por defecto según rol
export const getDefaultPermissionsByRole = (rol) => {
  return defaultPermissionsByRole[rol] || [];
};