// src/utils/codigo.js
const QRCode = require('qrcode');

/**
 * Genera un código alfanumérico único para el tiquete
 * Formato: CIN-XXXX-XXXX-XXXX
 */
const generarCodigo = () => {
  const chars   = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O, I, 0, 1 para evitar confusión
  const segment = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CIN-${segment(4)}-${segment(4)}-${segment(4)}`;
};

/**
 * Genera QR como Data URL (base64 PNG) a partir del código del tiquete
 */
const generarQR = async (codigo) => {
  try {
    const dataUrl = await QRCode.toDataURL(codigo, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    return dataUrl;
  } catch {
    return null;
  }
};

module.exports = { generarCodigo, generarQR };
