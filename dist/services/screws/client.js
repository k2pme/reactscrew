"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userScrew = void 0;
var _schema = _interopRequireDefault(require("../schema"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// src/services/screws/user.js
var userScrew = exports.userScrew = {
  name: 'user',
  executeOnLaunch: true,
  persistence: true,
  type: 'list',
  methods: {
    // Récupère la liste des utilisateurs
    init: {
      route: '/users',
      httpMethod: 'GET',
      returnType: 'list',
      schema: _schema["default"].userSchema
      // Vous pouvez ajouter ici des headers spécifiques si besoin, par exemple :
      // headers: { Authorization: 'Bearer token' }
    },
    // Récupère un utilisateur par son ID
    getById: {
      route: function route(id) {
        return "/users/".concat(id);
      },
      httpMethod: 'GET',
      returnType: 'object',
      schema: _schema["default"].userSchema
    },
    // Exemple de mutation avec POST (création d'un utilisateur)
    create: {
      route: '/users',
      httpMethod: 'POST',
      returnType: 'object',
      schema: _schema["default"].userSchema,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    // Exemple de mise à jour avec PUT
    update: {
      route: function route(id) {
        return "/users/".concat(id);
      },
      httpMethod: 'PUT',
      returnType: 'object',
      schema: _schema["default"].userSchema,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    // Exemple de suppression avec DELETE
    remove: {
      route: function route(id) {
        return "/users/".concat(id);
      },
      httpMethod: 'DELETE',
      returnType: 'object',
      schema: null
    }
  }
};