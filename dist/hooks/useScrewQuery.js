"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrewQuery = void 0;
var _react = require("react");
var _errors = require("../errors");
var _DriverProvider = require("../components/DriverProvider");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var useScrewQuery = exports.useScrewQuery = function useScrewQuery(screwName, methodName, options) {
  var _ref, _ref2;
  var context = (0, _react.useContext)(_DriverProvider.DriverContext);
  if (!context) {
    throw new _errors.ReactScrewError('useScrewQuery must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }
  var queryKey = (0, _react.useMemo)(function () {
    return context.client.getQueryKey(screwName, methodName, options);
  }, [context.client, methodName, options, screwName]);
  (0, _react.useEffect)(function () {
    context.client.registerQueryObserver(screwName, methodName, options);
    return function () {
      context.client.unregisterQueryObserver(queryKey);
    };
  }, [context.client, methodName, options, queryKey, screwName]);
  var state = (0, _react.useSyncExternalStore)(function (listener) {
    return context.client.subscribeQuery(queryKey, listener);
  }, function () {
    return context.client.getQueryState(queryKey);
  }, function () {
    return context.client.getQueryState(queryKey);
  });
  (0, _react.useEffect)(function () {
    var _options$enabled;
    var isEnabled = (_options$enabled = options === null || options === void 0 ? void 0 : options.enabled) !== null && _options$enabled !== void 0 ? _options$enabled : true;
    var hasData = state.data !== null || (options === null || options === void 0 ? void 0 : options.initialData) !== undefined;
    if (!isEnabled) {
      return;
    }
    var shouldFetch = !state.isFetching && (state.status === 'idle' || !hasData && state.status !== 'success' || state.invalidatedAt !== null);
    if (shouldFetch) {
      void context.client.fetchQuery(screwName, methodName, options, {
        force: state.invalidatedAt !== null
      })["catch"](function () {
        return undefined;
      });
    }
  }, [context.client, methodName, options, screwName, state.data, state.invalidatedAt, state.isFetching, state.status]);
  var selectedData = state.data !== null && options !== null && options !== void 0 && options.select ? options.select(state.data) : state.data;
  var data = (_ref = (_ref2 = selectedData !== null && selectedData !== void 0 ? selectedData : options === null || options === void 0 ? void 0 : options.placeholderData) !== null && _ref2 !== void 0 ? _ref2 : options === null || options === void 0 ? void 0 : options.initialData) !== null && _ref !== void 0 ? _ref : null;
  return _objectSpread(_objectSpread({}, state), {}, {
    data: data,
    refetch: function refetch() {
      return context.client.fetchQuery(screwName, methodName, options, {
        force: true
      });
    },
    queryKey: queryKey
  });
};