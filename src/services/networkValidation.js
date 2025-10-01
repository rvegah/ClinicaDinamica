// Servicio de validación de IP usando WebRTC
export const getLocalIP = () => {
  return new Promise((resolve, reject) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    const noop = () => {};
    
    pc.createDataChannel('');
    
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(reject);
    
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        pc.close();
        return;
      }
      
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const ipMatch = ipRegex.exec(ice.candidate.candidate);
      
      if (ipMatch) {
        resolve(ipMatch[1]);
        pc.close();
      }
    };
    
    // Timeout de 5 segundos
    setTimeout(() => {
      reject(new Error('Timeout al obtener IP'));
      pc.close();
    }, 5000);
  });
};

// Validar si la IP está autorizada para el dispositivo
export const validateDeviceIP = async (deviceName, deviceIPMapping) => {
  try {
    const localIP = await getLocalIP();
    const allowedIPs = deviceIPMapping[deviceName] || [];
    
    return {
      isValid: allowedIPs.includes(localIP),
      detectedIP: localIP,
      allowedIPs: allowedIPs
    };
  } catch (error) {
    console.error('Error validando IP:', error);
    return {
      isValid: false,
      detectedIP: null,
      allowedIPs: [],
      error: error.message
    };
  }
};

export default {
  getLocalIP,
  validateDeviceIP
};