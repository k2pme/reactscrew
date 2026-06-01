"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runValidator = void 0;
var _errors = require("../errors");
var runValidator = exports.runValidator = function runValidator(validator, value, code, message) {
  if (!validator) {
    return value;
  }
  try {
    var result = validator(value);
    return result === undefined ? value : result;
  } catch (error) {
    throw new _errors.ReactScrewError(message, {
      code: code,
      cause: error
    });
  }
};