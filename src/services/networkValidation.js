// src/services/networkValidation.js
import { deviceIPMapping } from "../modules/user-management/constants/userConstants";

class NetworkValidationService {
  // Detectar IP local usando WebRTC
  static async getLocalIP() {
    return new Promise((resolve, reject) => {
      const RTCPeerConnection =
        window.RTCPeerConnection ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        reject("WebRTC no soportado");
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.createDataChannel("");
      let resolved = false;

      pc.onicecandidate = (event) => {
        if (event.candidate && !resolved) {
          const candidate = event.candidate.candidate;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const match = candidate.match(ipRegex);

          if (match) {
            const ip = match[1];

            if (
              ip.startsWith("192.168.") ||
              ip.startsWith("10.") ||
              ip.startsWith("172.")
            ) {
              resolved = true;
              pc.close();
              resolve(ip);
            }
          }
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(reject);

      // Timeout más corto: 2 segundos
      setTimeout(() => {
        if (!resolved) {
          pc.close();
          reject("Timeout detectando IP");
        }
      }, 2000);
    });
  }

  static async validateDeviceIP(nombreEquipo) {
    try {
      if (!nombreEquipo || nombreEquipo.trim() === "") {
        return {
          success: true,
          message: "Sin restricción de equipo",
          detectedIP: null,
        };
      }

      let detectedIP;
      try {
        detectedIP = await this.getLocalIP();
      } catch (error) {
        // Fallback inmediato para desarrollo
        detectedIP = "192.168.0.8";
      }

      const allowedIPs = deviceIPMapping[nombreEquipo] || [];
      const isAuthorized = allowedIPs.includes(detectedIP);

      return {
        success: isAuthorized,
        detectedIP,
        expectedIPs: allowedIPs,
        nombreEquipo,
        message: isAuthorized
          ? `Dispositivo autorizado: ${nombreEquipo}`
          : `IP ${detectedIP} no autorizada para ${nombreEquipo}`,
      };
    } catch (error) {
      return {
        success: false,
        error: true,
        message: `Error detectando red: ${error}`,
        detectedIP: null,
      };
    }
  }

  // Validar si la IP actual está autorizada para el equipo del usuario
  static async validateDeviceIP(nombreEquipo) {
    try {
      if (!nombreEquipo || nombreEquipo.trim() === "") {
        return {
          success: true,
          message: "Sin restricción de equipo",
          detectedIP: null,
        };
      }

      let detectedIP;
      try {
        detectedIP = await this.getLocalIP();
      } catch (error) {
        // Fallback para desarrollo
        console.warn("WebRTC falló, usando IP de desarrollo");
        detectedIP = "192.168.0.8";
      }

      const allowedIPs = deviceIPMapping[nombreEquipo] || [];
      const isAuthorized = allowedIPs.includes(detectedIP);

      return {
        success: isAuthorized,
        detectedIP,
        expectedIPs: allowedIPs,
        nombreEquipo,
        message: isAuthorized
          ? `Dispositivo autorizado: ${nombreEquipo}`
          : `IP ${detectedIP} no autorizada para ${nombreEquipo}`,
      };
    } catch (error) {
      return {
        success: false,
        error: true,
        message: `Error detectando red: ${error}`,
        detectedIP: null,
      };
    }
  }
}

export default NetworkValidationService;
