"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequest = void 0;
var logRequest = exports.logRequest = function logRequest(method, path, status, headers, requestBody, responseBody, durationMs) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  var now = new Date().toISOString();
  var lines = ["[".concat(now, "] ").concat(method.toUpperCase(), " ").concat(path, " ").concat(status), "Headers: ".concat(JSON.stringify(headers !== null && headers !== void 0 ? headers : {})), "Request Body: ".concat(JSON.stringify(requestBody !== null && requestBody !== void 0 ? requestBody : null)), "Response: ".concat(JSON.stringify(responseBody !== null && responseBody !== void 0 ? responseBody : null))];
  if (typeof durationMs === 'number') {
    lines.push("Duration: ".concat(durationMs, "ms"));
  }
  console.log(lines.join('\n'));
};