// src/utils/logger.js
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
let fs = null;
if (isNode) {
  try {
    fs = require('fs');
  } catch (e) {
    fs = null;
  }
}

const LOG_FILE = 'logs.txt';

export const logRequest = (method, path, status, headers, requestBody, responseBody) => {
  const now = new Date().toISOString();
  const logMessage = `[${now}] ${method.toUpperCase()} ${path} ${status}\n` +
                     `Headers: ${JSON.stringify(headers)}\n` +
                     `Request Body: ${JSON.stringify(requestBody)}\n` +
                     `Response: ${JSON.stringify(responseBody)}\n\n`;

  if (process.env.NODE_ENV === 'development') {
    console.log(logMessage);

    // Écrire dans le fichier uniquement si fs est disponible (c'est-à-dire dans Node)
    if (fs) {
      fs.appendFile(LOG_FILE, logMessage, (err) => {
        if (err) {
          console.error('Erreur lors de l\'écriture du log:', err);
        }
      });
    }
  }
};
