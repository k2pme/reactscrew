"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _axios = _interopRequireDefault(require("axios"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// src/services/api.js (dans votre projet)

var api = _axios["default"].create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000
});
var _default = exports["default"] = api;