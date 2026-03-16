// src/modules/facturacion/utils/eventBus.js
// Bus de eventos para comunicación entre componentes (sin librería externa)

const listeners = {};

const eventBus = {
  on: (event, callback) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    // Retorna función de cleanup
    return () => eventBus.off(event, callback);
  },
  off: (event, callback) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter((cb) => cb !== callback);
  },
  emit: (event, data) => {
    if (!listeners[event]) return;
    listeners[event].forEach((cb) => cb(data));
  },
};

export default eventBus;