"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _joi = _interopRequireDefault(require("joi"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// src/utils/validator.js

var schema = {
  userSchema: _joi["default"].object({
    id: _joi["default"].number().required(),
    name: _joi["default"].string().required(),
    email: _joi["default"].string().email().required()
  }),
  postSchema: _joi["default"].object({
    id: _joi["default"].number().required(),
    title: _joi["default"].string().required(),
    content: _joi["default"].string().allow('') // ou Joi.string().required() selon vos besoins
  })
};
var _default = exports["default"] = schema;