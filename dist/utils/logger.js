"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequest = void 0;
// src/utils/logger.js
var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
var fs = null;
if (isNode) {
  try {
    fs = require('fs');
  } catch (e) {
    fs = null;
  }
}
var LOG_FILE = 'logs.txt';
var logRequest = exports.logRequest = function logRequest(method, path, status, headers, requestBody, responseBody) {
  var now = new Date().toISOString();
  var logMessage = "[".concat(now, "] ").concat(method.toUpperCase(), " ").concat(path, " ").concat(status, "\n") + "Headers: ".concat(JSON.stringify(headers), "\n") + "Request Body: ".concat(JSON.stringify(requestBody), "\n") + "Response: ".concat(JSON.stringify(responseBody), "\n\n");
  if (process.env.NODE_ENV === 'development') {
    console.log(logMessage);

    // Écrire dans le fichier uniquement si fs est disponible (c'est-à-dire dans Node)
    if (fs) {
      fs.appendFile(LOG_FILE, logMessage, function (err) {
        if (err) {
          console.error('Erreur lors de l\'écriture du log:', err);
        }
      });
    }
  }
};