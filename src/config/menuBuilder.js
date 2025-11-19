// src/config/menuBuilder.js - Construye el menú dinámicamente desde el API
// SI CLINICA FARMA - Reemplaza a menuPermissions.js

import { getIconComponent } from './iconMapper';

/**
 * Construye el menú dinámicamente desde los permisos del API
 * 
 * @param {Array} apiPermissions - Array de permisos desde el API
 * @returns {Array} Array de elementos del menú para DashboardLayout
 * 
 * Entrada (API):
 * [{
 *   nombreOpcion: "Administración",
 *   icono: "Security",
 *   color: "#4A5FFF",
 *   orden: 1,
 *   ruta: "/administracion",
 *   subOpcionesMenu: [...]
 * }]
 * 
 * Salida (para DashboardLayout):
 * [{
 *   id: "administracion",
 *   label: "Administración",
 *   icono: Security, // Componente MUI
 *   path: "/administracion",
 *   color: "#4A5FFF",
 *   submenu: [...]
 * }]
 */
export const buildMenuFromApi = (apiPermissions) => {
  if (!apiPermissions || !Array.isArray(apiPermissions)) {
    console.warn('⚠️ menuBuilder: No se recibieron permisos del API');
    return [];
  }

  console.log('🔨 menuBuilder: Construyendo menú desde API...', {
    modulos: apiPermissions.length
  });

  const menu = apiPermissions
    .filter(module => {
      // Solo mostrar módulos que tengan al menos 1 subopción
      const hasSubOptions = module.subOpcionesMenu && module.subOpcionesMenu.length > 0;
      if (!hasSubOptions) {
        console.log(`⚠️ Módulo "${module.nombreOpcion}" sin subopciones, se omite`);
      }
      return hasSubOptions;
    })
    .map(module => {
      console.log(`📦 Procesando módulo: ${module.nombreOpcion}`);
      
      // Construir elemento principal del menú
      const menuItem = {
        id: module.nombreOpcion.toLowerCase().replace(/\s+/g, '-'),
        label: module.nombreOpcion,
        icono: getIconComponent(module.icono),
        path: module.ruta || `/${module.nombreOpcion.toLowerCase().replace(/\s+/g, '-')}`,
        color: module.color,
        submenu: [],
      };

      // Construir subelementos
      if (module.subOpcionesMenu) {
        menuItem.submenu = module.subOpcionesMenu
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(subOption => {
            const subRoute = subOption.ruta || `${menuItem.path}/${subOption.nombreOpcion.toLowerCase().replace(/\s+/g, '-')}`;
            
            console.log(`  └─ Subopción: ${subOption.nombreOpcion} → ${subRoute}`);
            
            return {
              label: subOption.nombreOpcion,
              path: subRoute,
            };
          });
      }

      console.log(`✅ Módulo "${module.nombreOpcion}" procesado:`, {
        path: menuItem.path,
        subopciones: menuItem.submenu.length
      });

      return menuItem;
    })
    .sort((a, b) => {
      // Ordenar por el orden del API si está disponible
      const orderA = apiPermissions.find(m => m.nombreOpcion === a.label)?.orden || 999;
      const orderB = apiPermissions.find(m => m.nombreOpcion === b.label)?.orden || 999;
      return orderA - orderB;
    });

  console.log('✅ menuBuilder: Menú construido exitosamente', {
    elementos: menu.length,
    menu: menu
  });

  return menu;
};

/**
 * Función de compatibilidad con el código existente
 * Reemplaza a getFilteredMenuItems() de menuPermissions.js
 * 
 * @param {Array} apiPermissions - Permisos desde el API
 * @returns {Array} Menú construido
 */
export const getFilteredMenuItems = (apiPermissions) => {
  console.log('🔄 getFilteredMenuItems llamado con:', apiPermissions?.length, 'módulos');
  return buildMenuFromApi(apiPermissions);
};

export default {
  buildMenuFromApi,
  getFilteredMenuItems,
};