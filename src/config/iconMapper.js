// src/config/iconMapper.js - VERSIÓN MEJORADA PARA CONSULTORIO MÉDICO DINAMAX

import {
  Dashboard,
  People,
  Person,
  CalendarMonth,
  LocalHospital,
  MedicalServices,
  Science,
  LocalPharmacy,
  Receipt,
  Assessment,
  Settings,
  Inventory,
  Security,
  Group,
  Warehouse,
  ShoppingCart,
  SwapHoriz,
  PointOfSale,
  PersonAdd,
  MedicalInformation,
  Medication,
  MonitorHeart,
  Healing,
  EmergencyShare,
  Hotel,
  AttachMoney,
  AccountBalance,
  Business,
  Description,
  FolderSpecial,
  RequestQuote,
  Assignment,
  EventAvailable,
  Vaccines,
  Biotech,
  LocalOffer,
  Category,
  AddShoppingCart,
  RemoveShoppingCart,
  TrendingUp,
  Payment,
  CreditCard,
  BarChart,
  PieChart,
  ShowChart,
  SupervisorAccount,
  AdminPanelSettings,
  VerifiedUser,
  Lock,
  ManageAccounts,
  Store,
  ImportExport,
  Send,
  CompareArrows,
  ListAlt,
  Inventory2,
  LocalShipping,
} from '@mui/icons-material';

/**
 * Mapa de nombres de íconos del API a componentes MUI
 * CONSULTORIO MÉDICO DINAMAX - Versión Mejorada
 */
const iconMap = {
  // ============================================
  // DASHBOARD Y GENERALES
  // ============================================
  'Dashboard': Dashboard,
  'Inicio': Dashboard,
  'Home': Dashboard,
  
  // ============================================
  // ADMINISTRACIÓN Y SEGURIDAD
  // ============================================
  'Security': Security,
  'Seguridad': Security,
  'AdminPanelSettings': AdminPanelSettings,
  'Administracion': AdminPanelSettings,
  'SupervisorAccount': SupervisorAccount,
  'Settings': Settings,
  'Configuracion': Settings,
  'ManageAccounts': ManageAccounts,
  'GestionUsuarios': ManageAccounts,
  'Lock': Lock,
  'VerifiedUser': VerifiedUser,
  
  // ============================================
  // PACIENTES Y PERSONAS
  // ============================================
  'People': People,
  'Pacientes': People,
  'Person': Person,
  'Paciente': Person,
  'Group': Group,
  'Grupos': Group,
  'PersonAdd': PersonAdd,
  'RegistroPaciente': PersonAdd,
  'NuevoPaciente': PersonAdd,
  'Assignment': Assignment,
  'HistoriaClinica': Assignment,
  'Expediente': Assignment,
  
  // ============================================
  // AGENDAMIENTO Y CITAS
  // ============================================
  'CalendarMonth': CalendarMonth,
  'Agendamiento': CalendarMonth,
  'Calendario': CalendarMonth,
  'EventAvailable': EventAvailable,
  'Citas': EventAvailable,
  'AgendarCita': EventAvailable,
  
  // ============================================
  // CONSULTA MÉDICA Y ATENCIÓN
  // ============================================
  'LocalHospital': LocalHospital,
  'Hospital': LocalHospital,
  'Clinica': LocalHospital,
  'MedicalServices': MedicalServices,
  'ConsultaMedica': MedicalServices,
  'Consulta': MedicalServices,
  'Atencion': MedicalServices,
  'MedicalInformation': MedicalInformation,
  'InformacionMedica': MedicalInformation,
  'MonitorHeart': MonitorHeart,
  'SignosVitales': MonitorHeart,
  'Monitoreo': MonitorHeart,
  'Healing': Healing,
  'Tratamiento': Healing,
  'Terapia': Healing,
  
  // ============================================
  // SERVICIOS AUXILIARES
  // ============================================
  'Science': Science,
  'Laboratorio': Science,
  'Lab': Science,
  'Biotech': Biotech,
  'Analisis': Biotech,
  'Examenes': Science,
  'Vaccines': Vaccines,
  'Vacunas': Vaccines,
  'Inmunizacion': Vaccines,
  
  // ============================================
  // EMERGENCIAS Y HOSPITALIZACIÓN
  // ============================================
  'EmergencyShare': EmergencyShare,
  'Emergencias': EmergencyShare,
  'Urgencias': EmergencyShare,
  'Hotel': Hotel,
  'Hospitalizacion': Hotel,
  'Internacion': Hotel,
  'Camas': Hotel,
  
  // ============================================
  // FARMACIA Y MEDICAMENTOS
  // ============================================
  'LocalPharmacy': LocalPharmacy,
  'Farmacia': LocalPharmacy,
  'Pharmacy': LocalPharmacy,
  'Medication': Medication,
  'Medicamentos': Medication,
  'Medicinas': Medication,
  'Recetas': Medication,
  
  // ============================================
  // INVENTARIO Y PRODUCTOS
  // ============================================
  'Inventory': Inventory,
  'Inventario': Inventory,
  'Stock': Inventory,
  'Inventory2': Inventory2,
  'ControlInventario': Inventory2,
  'Warehouse': Warehouse,
  'Almacen': Warehouse,
  'Bodega': Warehouse,
  'Category': Category,
  'Productos': Category,
  'Categorias': Category,
  'LocalOffer': LocalOffer,
  'Ofertas': LocalOffer,
  'Promociones': LocalOffer,
  
  // ============================================
  // COMPRAS Y PROVEEDORES
  // ============================================
  'ShoppingCart': ShoppingCart,
  'Compras': ShoppingCart,
  'AddShoppingCart': AddShoppingCart,
  'NuevaCompra': AddShoppingCart,
  'AgregarCompra': AddShoppingCart,
  'RemoveShoppingCart': RemoveShoppingCart,
  'AnularCompra': RemoveShoppingCart,
  'LocalShipping': LocalShipping,
  'Proveedores': LocalShipping,
  'Proveedor': LocalShipping,
  'Store': Store,
  'Tienda': Store,
  
  // ============================================
  // VENTAS Y FACTURACIÓN
  // ============================================
  'PointOfSale': PointOfSale,
  'Ventas': PointOfSale,
  'PuntoVenta': PointOfSale,
  'Caja': PointOfSale,
  'Receipt': Receipt,
  'Facturacion': Receipt,
  'Facturas': Receipt,
  'Recibos': Receipt,
  'RequestQuote': RequestQuote,
  'Cotizacion': RequestQuote,
  'Presupuesto': RequestQuote,
  'AttachMoney': AttachMoney,
  'Dinero': AttachMoney,
  'Efectivo': AttachMoney,
  'Payment': Payment,
  'Pagos': Payment,
  'Cobros': Payment,
  'CreditCard': CreditCard,
  'Credito': CreditCard,
  'Tarjeta': CreditCard,
  
  // ============================================
  // TRASPASOS Y MOVIMIENTOS
  // ============================================
  'SwapHoriz': SwapHoriz,
  'Traspasos': SwapHoriz,
  'Transferencias': SwapHoriz,
  'CompareArrows': CompareArrows,
  'Movimientos': CompareArrows,
  'ImportExport': ImportExport,
  'ImportarExportar': ImportExport,
  'Send': Send,
  'Enviar': Send,
  'Despacho': Send,
  
  // ============================================
  // REPORTES Y ANÁLISIS
  // ============================================
  'Assessment': Assessment,
  'Reportes': Assessment,
  'Informes': Assessment,
  'BarChart': BarChart,
  'GraficoBarras': BarChart,
  'Estadisticas': BarChart,
  'PieChart': PieChart,
  'GraficoCircular': PieChart,
  'ShowChart': ShowChart,
  'Tendencias': ShowChart,
  'TrendingUp': TrendingUp,
  'Crecimiento': TrendingUp,
  'ListAlt': ListAlt,
  'Listados': ListAlt,
  
  // ============================================
  // CONTABILIDAD Y FINANZAS
  // ============================================
  'AccountBalance': AccountBalance,
  'Contabilidad': AccountBalance,
  'Finanzas': AccountBalance,
  'Banco': AccountBalance,
  'Business': Business,
  'Empresa': Business,
  'Negocio': Business,
  
  // ============================================
  // DOCUMENTOS Y ARCHIVOS
  // ============================================
  'Description': Description,
  'Documentos': Description,
  'Archivos': Description,
  'FolderSpecial': FolderSpecial,
  'CarpetaEspecial': FolderSpecial,
  'Expedientes': FolderSpecial,
  
  // ============================================
  // RECURSOS HUMANOS
  // ============================================
  'ManageAccounts': ManageAccounts,
  'RecursosHumanos': ManageAccounts,
  'Personal': ManageAccounts,
  'Empleados': Group,
  'Usuarios': People,
};

/**
 * Obtiene el componente de ícono correspondiente al nombre del API
 * 
 * @param {string} iconName - Nombre del ícono desde el API
 * @returns {React.Component} Componente de ícono de MUI
 */
export const getIconComponent = (iconName) => {
  if (!iconName) {
    console.warn('⚠️ iconMapper: Icono no especificado, usando Dashboard por defecto');
    return Dashboard;
  }

  // Intentar buscar el ícono exacto
  let IconComponent = iconMap[iconName];
  
  // Si no se encuentra, intentar buscar sin espacios y en minúsculas
  if (!IconComponent) {
    const normalizedName = iconName.replace(/\s+/g, '').toLowerCase();
    const foundKey = Object.keys(iconMap).find(
      key => key.replace(/\s+/g, '').toLowerCase() === normalizedName
    );
    IconComponent = foundKey ? iconMap[foundKey] : null;
  }
  
  if (!IconComponent) {
    console.warn(`⚠️ iconMapper: Icono no encontrado para "${iconName}", usando Dashboard por defecto`);
    return Dashboard;
  }

  console.log(`✅ iconMapper: Icono encontrado para "${iconName}"`);
  return IconComponent;
};

/**
 * Obtiene todos los iconos disponibles
 * @returns {Object} Mapa completo de iconos
 */
export const getAllIcons = () => {
  return iconMap;
};

/**
 * Verifica si un icono existe en el mapa
 * @param {string} iconName - Nombre del ícono
 * @returns {boolean} True si existe, false si no
 */
export const iconExists = (iconName) => {
  return !!iconMap[iconName];
};

export default {
  iconMap,
  getIconComponent,
  getAllIcons,
  iconExists,
};