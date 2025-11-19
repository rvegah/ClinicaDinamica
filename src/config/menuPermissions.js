// src/config/menuPermissions.js - Mapeo de permisos a elementos del menú

import {
  Group,
  Inventory,
  Warehouse,
  ShoppingCart,
  SwapHoriz,
  PointOfSale,
  Assessment,
  Security
} from '@mui/icons-material';

// Función para crear los elementos del menú con íconos
const createMenuItems = () => [
  {
    texto: 'Usuarios',
    icono: Group,
    ruta: '/users',
    requiredPermissions: ['usuario_lista', 'usuario_crear'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Nuevo Usuario', 
        ruta: '/users/new',
        requiredPermissions: ['usuario_crear']
      },
      { 
        texto: 'Lista de Usuarios', 
        ruta: '/users/list',
        requiredPermissions: ['usuario_lista']
      }
    ]
  },
  {
    texto: 'Productos',
    icono: Inventory,
    ruta: '/productos',
    requiredPermissions: ['producto_ver'],
    subElementos: [
      { 
        texto: 'Ver Productos', 
        ruta: '/productos/ver',
        requiredPermissions: ['producto_ver']
      },
      { 
        texto: 'Agregar Producto', 
        ruta: '/productos/agregar',
        requiredPermissions: ['producto_crear']
      }
    ]
  },
  {
    texto: 'Compras',
    icono: ShoppingCart,
    ruta: '/compras',
    requiredPermissions: ['compra_crear', 'compra_editar', 'compra_salida'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Nueva Compra', 
        ruta: '/compras/nueva',
        requiredPermissions: ['compra_crear']
      },
      { 
        texto: 'Nueva Salida', 
        ruta: '/compras/salida',
        requiredPermissions: ['compra_salida']
      },
      { 
        texto: 'Compras a Credito', 
        ruta: '/compras/credito',
        requiredPermissions: ['compra_credito']
      },
      { 
        texto: 'Ingresos del Día', 
        ruta: '/compras/ingresos',
        requiredPermissions: ['compra_ingresos']
      }
    ]
  },
  {
    texto: 'Proveedor',
    icono: Warehouse,
    ruta: '/proveedor',
    requiredPermissions: ['proveedor_ver', 'proveedor_crear'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Nuevo Proveedor', 
        ruta: '/proveedor/nuevo',
        requiredPermissions: ['proveedor_crear']
      }
    ]
  },
  {
    texto: 'Ventas',
    icono: PointOfSale,
    ruta: '/ventas',
    requiredPermissions: ['venta_crear', 'venta_pedidos'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Nueva Venta', 
        ruta: '/ventas/nueva',
        requiredPermissions: ['venta_crear']
      },
      { 
        texto: 'Realizar Pedidos', 
        ruta: '/ventas/pedidos',
        requiredPermissions: ['venta_pedidos']
      },
      { 
        texto: 'Mis Pedidos', 
        ruta: '/ventas/mis-pedidos',
        requiredPermissions: ['venta_mis_pedidos']
      }
    ]
  },
  {
    texto: 'Traspasos',
    icono: SwapHoriz,
    ruta: '/traspasos',
    requiredPermissions: ['traspaso_crear', 'traspaso_aprobar'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Nuevo Traspaso', 
        ruta: '/traspasos/nuevo',
        requiredPermissions: ['traspaso_crear']
      }
    ]
  },
  {
    texto: 'Reportes',
    icono: Assessment,
    ruta: '/reportes',
    requiredPermissions: ['reporte_diario', 'reporte_mensual', 'reporte_ventas'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Reporte Diario', 
        ruta: '/reportes/diario',
        requiredPermissions: ['reporte_diario']
      },
      { 
        texto: 'Reporte Mensual', 
        ruta: '/reportes/mensual',
        requiredPermissions: ['reporte_mensual']
      },
      { 
        texto: 'Reporte Todos', 
        ruta: '/reportes/todos',
        requiredPermissions: ['reporte_ventas', 'reporte_compras']
      },
      { 
        texto: 'Reporte Productos', 
        ruta: '/reportes/productos',
        requiredPermissions: ['reporte_productos']
      },
      { 
        texto: 'Reporte por sucursales', 
        ruta: '/reportes/sucursales',
        requiredPermissions: ['reporte_sucursales']
      },
      { 
        texto: 'Kardex', 
        ruta: '/reportes/kardex',
        requiredPermissions: ['reporte_kardex']
      }
    ]
  },
  {
    texto: 'Configuracion',
    icono: Security,
    ruta: '/configuracion',
    requiredPermissions: ['sistema_configuracion', 'sistema_sucursales'],
    requireAll: false,
    subElementos: [
      { 
        texto: 'Ordenar sucursales', 
        ruta: '/configuracion/sucursales',
        requiredPermissions: ['sistema_sucursales']
      }
    ]
  }
];

// Exportar la función que genera los items
export const menuItemsWithPermissions = createMenuItems();

/**
 * Verifica si el usuario tiene los permisos necesarios para un elemento del menú
 */
export const hasMenuAccess = (userPermissions, requiredPermissions, requireAll = false) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (requireAll) {
    return requiredPermissions.every(perm => userPermissions.includes(perm));
  } else {
    return requiredPermissions.some(perm => userPermissions.includes(perm));
  }
};

/**
 * Filtra los elementos del menú según los permisos del usuario
 */
export const getFilteredMenuItems = (userPermissions) => {
  return menuItemsWithPermissions
    .filter(item => hasMenuAccess(userPermissions, item.requiredPermissions, item.requireAll))
    .map(item => ({
      ...item,
      subElementos: item.subElementos 
        ? item.subElementos.filter(subItem => 
            hasMenuAccess(userPermissions, subItem.requiredPermissions, false)
          )
        : []
    }))
    .filter(item => !item.subElementos || item.subElementos.length > 0);
};