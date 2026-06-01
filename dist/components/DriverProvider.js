"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DriverProvider = exports.DriverContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var _ReactScrewClient = require("../client/ReactScrewClient");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var DriverContext = exports.DriverContext = /*#__PURE__*/(0, _react.createContext)(null);
var DriverProvider = exports.DriverProvider = function DriverProvider(_ref) {
  var children = _ref.children,
    apiInstance = _ref.apiInstance,
    screws = _ref.screws,
    clientOptions = _ref.clientOptions,
    dehydratedState = _ref.dehydratedState;
  var client = (0, _react.useMemo)(function () {
    var nextClient = (0, _ReactScrewClient.createReactScrewClient)(apiInstance, screws, clientOptions);
    if (dehydratedState) {
      nextClient.hydrate(dehydratedState);
    }
    return nextClient;
  }, [apiInstance, clientOptions, dehydratedState, screws]);
  (0, _react.useEffect)(function () {
    void client.restorePersistedCache();
  }, [client]);
  (0, _react.useEffect)(function () {
    void Promise.all(Object.values(screws).filter(function (screw) {
      return screw.executeOnLaunch && screw.methods.init;
    }).map(function (screw) {
      var queryKey = client.getQueryKey(screw.name, 'init');
      var state = client.getQueryState(queryKey);
      if (state.updatedAt !== null && state.status === 'success') {
        return Promise.resolve();
      }
      return client.fetchQuery(screw.name, 'init')["catch"](function () {
        return undefined;
      });
    }));
  }, [client, screws]);
  (0, _react.useEffect)(function () {
    return function () {
      void client.persistCache();
    };
  }, [client]);
  (0, _react.useEffect)(function () {
    if (typeof window === 'undefined') {
      return undefined;
    }
    var focusHandler = function focusHandler() {
      void client.handleWindowFocus();
    };
    var onlineHandler = function onlineHandler() {
      void client.handleReconnect();
    };
    window.addEventListener('focus', focusHandler);
    window.addEventListener('online', onlineHandler);
    return function () {
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('online', onlineHandler);
    };
  }, [client]);
  return /*#__PURE__*/_react["default"].createElement(DriverContext.Provider, {
    value: {
      client: client
    }
  }, children);
};