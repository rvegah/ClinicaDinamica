// src/services/api/facturacionServices.js
// Todos los servicios que necesita FacturacionPage
// facturacionService + siatService + eventosService + medicoService + productoService + configuracionService

import siatApiClient from "./siatApiClient";

// =====================================================
// FACTURACIÓN
// =====================================================
export const facturacionService = {
  emitirFactura: async (request, userId = 1) => {
    try {
      const res = await siatApiClient.post(
        `/Facturacion/emitir?userId=${userId}`,
        request,
      );
      return res.data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "";
      if (
        msg.includes("1037") ||
        msg.toLowerCase().includes("nit no es valido")
      ) {
        const err = new Error(msg);
        err.code = "INVALID_NIT";
        throw err;
      }
      throw error;
    }
  },

  obtenerFactura: async (id) => {
    const res = await siatApiClient.get(`/Facturacion/${id}`);
    return res.data.data;
  },
};

// PDF
export const imprimirFactura = async (invoiceId, format = "normal") => {
  const response = await siatApiClient.get(`/Facturacion/${invoiceId}/pdf`, {
    params: { format },
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(url);
      }, 1000);
    }, 100);
  };
};

// =====================================================
// CATÁLOGOS SIAT
// =====================================================
export const siatService = {
  getTiposDocumentoIdentidad: async () => {
    const res = await siatApiClient.get(
      "/Sincronizacion/tipos-documento-identidad",
    );
    return res.data.data || [];
  },
  getMetodosPago: async () => {
    const res = await siatApiClient.get("/Sincronizacion/metodos-pago");
    return res.data.data || [];
  },
  getProductosServicios: async (codigoActividad) => {
    const url = codigoActividad
      ? `/Sincronizacion/productos-servicios?codigoActividad=${codigoActividad}`
      : "/Sincronizacion/productos-servicios";
    const res = await siatApiClient.get(url);
    return res.data.data || [];
  },
  getLeyendas: async () => {
    const res = await siatApiClient.get("/Sincronizacion/leyendas");
    return res.data.data || [];
  },
  getEventosCatalogo: async () => {
    const res = await siatApiClient.get("/Sincronizacion/eventos");
    return res.data.data || [];
  },
};

// =====================================================
// EVENTOS SIGNIFICATIVOS
// =====================================================
export const eventosService = {
  verificarConexion: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get("/Eventos/verificar-conexion", {
      params: { sucursalId, puntoVentaId },
    });
    return res.data;
  },
  obtenerEventoActivo: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get("/Eventos/activo", {
      params: { sucursalId, puntoVentaId },
    });
    return res.data;
  },
};

// =====================================================
// MÉDICOS (SECTOR 17)
// =====================================================
export const medicoService = {
  obtenerMedicos: async () => {
    const res = await siatApiClient.get("/Medicos");
    return res.data.data || [];
  },
  obtenerModalidades: async () => {
    const res = await siatApiClient.get("/Medicos/modalidades");
    return res.data.data || [];
  },
};

// =====================================================
// PRODUCTOS / BÚSQUEDA
// =====================================================
export const productoService = {
  buscarProductos: async (keyword) => {
    const res = await siatApiClient.get("/Productos/buscar", {
      params: { keyword },
    });
    // Backend devuelve array directo, NO envuelto en data.data
    const data = res.data;
    const lista = Array.isArray(data) ? data : data.data || [];
    // Normalizar campos PascalCase → camelCase
    return lista.map((p) => ({
      id: p.Id || p.id,
      codigoProducto: p.Codigo || p.codigo || "",
      codigoProductoSin: p.CodigoSin || p.codigoSin || "",
      descripcion: p.Nombre || p.nombre || p.descripcion || "",
      precio: p.Precio || p.precio || 0,
      codigoBarras: p.CodigoBarras || p.codigoBarras || "",
      codigoActividad: p.CodigoActividad || p.codigoActividad || "",
      unidadMedida: p.UnidadMedida || p.unidadMedida || 62,
    }));
  },
};

// =====================================================
// CONFIGURACIÓN
// =====================================================
export const configuracionService = {
  obtenerFormatoPdfEmail: async () => {
    const res = await siatApiClient.get("/Configuracion/formato-pdf-email");
    return res.data.data || { formatoPdf: "normal", enviarEmail: true };
  },
};
