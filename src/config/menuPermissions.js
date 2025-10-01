import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ScienceIcon from '@mui/icons-material/Science';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';

// Configuración del menú con permisos
export const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icono: DashboardIcon,
    permisos: [] // Todos tienen acceso
  },
  {
    id: 'pacientes',
    label: 'Pacientes',
    icono: PeopleIcon,
    permisos: ['paciente_ver'],
    submenu: [
      { label: 'Lista de Pacientes', path: '/patients', permisos: ['paciente_ver'] },
      { label: 'Nuevo Paciente', path: '/patients/new', permisos: ['paciente_crear'] },
      { label: 'Historias Clínicas', path: '/medical-records', permisos: ['historia_clinica_ver'] }
    ]
  },
  {
    id: 'citas',
    label: 'Citas',
    icono: CalendarMonthIcon,
    permisos: ['cita_ver'],
    submenu: [
      { label: 'Agenda', path: '/appointments', permisos: ['cita_ver'] },
      { label: 'Nueva Cita', path: '/appointments/new', permisos: ['cita_crear'] }
    ]
  },
  {
    id: 'consultas',
    label: 'Consultas',
    icono: LocalHospitalIcon,
    permisos: ['consulta_ver'],
    submenu: [
      { label: 'Consultas del Día', path: '/consultations', permisos: ['consulta_ver'] },
      { label: 'Nueva Consulta', path: '/consultations/new', permisos: ['consulta_crear'] },
      { label: 'Recetas', path: '/prescriptions', permisos: ['receta_ver'] }
    ]
  },
  {
    id: 'laboratorio',
    label: 'Laboratorio',
    icono: ScienceIcon,
    permisos: ['orden_lab_ver'],
    submenu: [
      { label: 'Órdenes', path: '/lab-orders', permisos: ['orden_lab_ver'] },
      { label: 'Resultados', path: '/lab-results', permisos: ['resultado_lab_ver'] }
    ]
  },
  {
    id: 'farmacia',
    label: 'Farmacia',
    icono: LocalPharmacyIcon,
    permisos: ['medicamento_ver'],
    submenu: [
      { label: 'Dispensación', path: '/pharmacy/dispense', permisos: ['medicamento_dispensar'] },
      { label: 'Inventario', path: '/pharmacy/inventory', permisos: ['medicamento_ver'] },
      { label: 'Stock', path: '/pharmacy/stock', permisos: ['stock_ver'] }
    ]
  },
  {
    id: 'facturacion',
    label: 'Facturación',
    icono: ReceiptIcon,
    permisos: ['factura_ver'],
    submenu: [
      { label: 'Facturas', path: '/billing', permisos: ['factura_ver'] },
      { label: 'Pagos', path: '/payments', permisos: ['pago_ver'] }
    ]
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icono: AssessmentIcon,
    permisos: ['reporte_pacientes', 'reporte_consultas', 'reporte_ingresos'],
    submenu: [
      { label: 'Pacientes', path: '/reports/patients', permisos: ['reporte_pacientes'] },
      { label: 'Consultas', path: '/reports/consultations', permisos: ['reporte_consultas'] },
      { label: 'Ingresos', path: '/reports/income', permisos: ['reporte_ingresos'] }
    ]
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icono: InventoryIcon,
    permisos: ['medicamento_gestionar'],
    submenu: [
      { label: 'Productos', path: '/inventory/products', permisos: ['medicamento_ver'] },
      { label: 'Movimientos', path: '/inventory/movements', permisos: ['stock_ver'] }
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icono: PersonIcon,
    permisos: ['usuario_ver'],
    submenu: [
      { label: 'Gestión de Usuarios', path: '/users', permisos: ['usuario_ver'] },
      { label: 'Mi Perfil', path: '/profile', permisos: [] }
    ]
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icono: SettingsIcon,
    permisos: ['config_general'],
    submenu: [
      { label: 'General', path: '/settings/general', permisos: ['config_general'] },
      { label: 'Sucursales', path: '/settings/branches', permisos: ['sucursal_gestionar'] },
      { label: 'Especialidades', path: '/settings/specialties', permisos: ['especialidad_gestionar'] }
    ]
  }
];

// Función para filtrar menú según permisos del usuario
export const getFilteredMenuItems = (userPermissions) => {
  return menuItems.filter(item => {
    // Si no requiere permisos, mostrar
    if (item.permisos.length === 0) return true;
    
    // Si requiere permisos, verificar si el usuario tiene al menos uno
    const hasPermission = item.permisos.some(permiso => 
      userPermissions.includes(permiso)
    );
    
    if (!hasPermission) return false;
    
    // Si tiene submenú, filtrar también los items del submenú
    if (item.submenu) {
      item.submenu = item.submenu.filter(subitem => {
        if (subitem.permisos.length === 0) return true;
        return subitem.permisos.some(permiso => 
          userPermissions.includes(permiso)
        );
      });
      
      // Si después de filtrar no quedan subitems, no mostrar el menú principal
      return item.submenu.length > 0;
    }
    
    return true;
  });
};