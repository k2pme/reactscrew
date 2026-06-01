"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrewMutation = void 0;
var _react = require("react");
var _errors = require("../errors");
var _DriverProvider = require("../components/DriverProvider");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var useScrewMutation = exports.useScrewMutation = function useScrewMutation(screwName, methodName, options) {
  var context = (0, _react.useContext)(_DriverProvider.DriverContext);
  if (!context) {
    throw new _errors.ReactScrewError('useScrewMutation must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }
  var mutationKey = (0, _react.useMemo)(function () {
    return "".concat(screwName, ":").concat(methodName);
  }, [methodName, screwName]);
  var state = (0, _react.useSyncExternalStore)(function (listener) {
    return context.client.subscribeMutation(mutationKey, listener);
  }, function () {
    return context.client.getMutationState(mutationKey);
  }, function () {
    return context.client.getMutationState(mutationKey);
  });
  var mutateAsync = function mutateAsync(variables) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return context.client.executeMutation(screwName, methodName, variables, args, options);
  };
  return _objectSpread(_objectSpread({}, state), {}, {
    mutateAsync: mutateAsync,
    mutate: mutateAsync,
    reset: function reset() {
      return context.client.resetMutationState(mutationKey);
    }
  });
};