// src/modules/facturacion/hooks/useSiatStatus.js
// Detecta: ¿SIAT online? ¿Evento activo de contingencia?
// Se suscribe a eventBus para actualizarse cuando cierran/crean eventos

import { useState, useEffect, useCallback } from 'react';
import { eventosService } from '../../../services/api/facturacionServices';
import eventBus from '../utils/eventBus';

/**
 * @param {number} sucursalId
 * @param {number} puntoVentaId
 * @returns {{
 *   siatOnline: boolean,
 *   eventoActivo: object|null,
 *   isContingencia: boolean,
 *   loading: boolean,
 *   refetch: () => void
 * }}
 */
const useSiatStatus = (sucursalId = 0, puntoVentaId = 0) => {
  const [siatOnline, setSiatOnline] = useState(true);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [conexionRes, eventoRes] = await Promise.all([
        eventosService.verificarConexion(sucursalId, puntoVentaId).catch(() => ({
          siatOnline: false,
        })),
        eventosService.obtenerEventoActivo(sucursalId, puntoVentaId).catch(() => ({
          eventoActivo: false,
          evento: null,
        })),
      ]);

      setSiatOnline(conexionRes?.siatOnline ?? false);
      setEventoActivo(eventoRes?.eventoActivo ? eventoRes.evento : null);
    } catch {
      setSiatOnline(false);
      setEventoActivo(null);
    } finally {
      setLoading(false);
    }
  }, [sucursalId, puntoVentaId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Escuchar eventos del bus para recargar automáticamente
  useEffect(() => {
    const unsubCreate = eventBus.on('evento-creado', checkStatus);
    const unsubClose  = eventBus.on('evento-cerrado', checkStatus);
    const unsubCufd   = eventBus.on('cufd-updated', checkStatus);
    return () => {
      unsubCreate();
      unsubClose();
      unsubCufd();
    };
  }, [checkStatus]);

  // isContingencia: evento activo con tipo 5, 6 o 7
  const isContingencia =
    eventoActivo !== null &&
    eventoActivo.eventoId >= 5 &&
    eventoActivo.eventoId <= 7;

  return {
    siatOnline,
    eventoActivo,
    isContingencia,
    loading,
    refetch: checkStatus,
  };
};

export default useSiatStatus;