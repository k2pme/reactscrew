"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrewClient = void 0;
var _react = require("react");
var _DriverProvider = require("../components/DriverProvider");
var _errors = require("../errors");
var useScrewClient = exports.useScrewClient = function useScrewClient() {
  var context = (0, _react.useContext)(_DriverProvider.DriverContext);
  if (!context) {
    throw new _errors.ReactScrewError('useScrewClient must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }
  return context.client;
};