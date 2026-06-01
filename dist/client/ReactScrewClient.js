"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReactScrewClient = exports.DefaultReactScrewClient = void 0;
var _localforage = _interopRequireDefault(require("localforage"));
var _errors = require("../errors");
var _logger = require("../utils/logger");
var _queryKey = require("../utils/queryKey");
var _validators = require("../utils/validators");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var WRITE_METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);
var createQueryState = function createQueryState(overrides) {
  return _objectSpread({
    status: 'idle',
    data: null,
    error: null,
    isLoading: false,
    isFetching: false,
    isRefetching: false,
    updatedAt: null,
    invalidatedAt: null
  }, overrides);
};
var createMutationState = function createMutationState(overrides) {
  return _objectSpread({
    status: 'idle',
    data: null,
    error: null,
    isPending: false
  }, overrides);
};
var idleQueryState = createQueryState();
var idleMutationState = createMutationState();
var DEFAULT_PERSIST_NAMESPACE = 'reactscrew-cache';
var inferMethodType = function inferMethodType(method) {
  var _method$httpMethod;
  if (method.type) {
    return method.type;
  }
  var httpMethod = ((_method$httpMethod = method.httpMethod) !== null && _method$httpMethod !== void 0 ? _method$httpMethod : 'GET').toUpperCase();
  return httpMethod === 'GET' ? 'query' : 'mutation';
};
var isQueryDefinition = function isQueryDefinition(method) {
  return inferMethodType(method) === 'query';
};
var isMutationDefinition = function isMutationDefinition(method) {
  return inferMethodType(method) === 'mutation';
};
var defaultQueryKey = function defaultQueryKey(screwName, methodName, args) {
  return [screwName, methodName].concat(_toConsumableArray(args));
};
var shouldUseBody = function shouldUseBody(method) {
  return WRITE_METHODS_WITH_BODY.has(method.toUpperCase());
};
var resolveRouteArgs = function resolveRouteArgs(httpMethod, args) {
  return shouldUseBody(httpMethod) ? args.slice(0, -1) : args;
};
var resolveBody = function resolveBody(httpMethod, args) {
  return shouldUseBody(httpMethod) && args.length > 0 ? args[args.length - 1] : undefined;
};
var resolveRoute = function resolveRoute(definition, args) {
  var _definition$httpMetho;
  var httpMethod = (_definition$httpMetho = definition.httpMethod) !== null && _definition$httpMetho !== void 0 ? _definition$httpMetho : 'GET';
  var routeArgs = resolveRouteArgs(httpMethod, args);
  return typeof definition.route === 'function' ? definition.route.apply(definition, _toConsumableArray(routeArgs)) : definition.route;
};
var mergeInvalidationTarget = function mergeInvalidationTarget(target) {
  return {
    screwName: target.screwName,
    methodName: target.methodName,
    queryKey: target.args && target.methodName ? [target.screwName, target.methodName].concat(_toConsumableArray(target.args)) : undefined
  };
};
var DefaultReactScrewClient = exports.DefaultReactScrewClient = /*#__PURE__*/function () {
  function DefaultReactScrewClient(apiInstance, screws, _options) {
    var _this = this;
    _classCallCheck(this, DefaultReactScrewClient);
    _defineProperty(this, "queryEntries", new Map());
    _defineProperty(this, "queryListeners", new Map());
    _defineProperty(this, "mutationStates", new Map());
    _defineProperty(this, "mutationListeners", new Map());
    _defineProperty(this, "eventListeners", new Set());
    _defineProperty(this, "eventLog", []);
    _defineProperty(this, "metrics", {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      dedupedRequests: 0,
      averageRequestDurationMs: 0
    });
    _defineProperty(this, "totalRequestDurationMs", 0);
    _defineProperty(this, "subscribeQuery", function (queryKey, listener) {
      var _this$queryListeners$;
      var keyHash = (0, _queryKey.serializeQueryKey)(queryKey);
      var listeners = (_this$queryListeners$ = _this.queryListeners.get(keyHash)) !== null && _this$queryListeners$ !== void 0 ? _this$queryListeners$ : new Set();
      listeners.add(listener);
      _this.queryListeners.set(keyHash, listeners);
      return function () {
        var current = _this.queryListeners.get(keyHash);
        if (!current) {
          return;
        }
        current["delete"](listener);
        if (current.size === 0) {
          _this.queryListeners["delete"](keyHash);
        }
      };
    });
    _defineProperty(this, "getQueryKey", function (screwName, methodName, options) {
      var _options$args, _definition$queryKey, _definition$queryKey2;
      var definition = _this.getMethodDefinition(screwName, methodName, 'query');
      var args = (_options$args = options === null || options === void 0 ? void 0 : options.args) !== null && _options$args !== void 0 ? _options$args : [];
      return (_definition$queryKey = (_definition$queryKey2 = definition.queryKey) === null || _definition$queryKey2 === void 0 ? void 0 : _definition$queryKey2.call(definition, {
        screwName: screwName,
        methodName: methodName,
        args: args
      })) !== null && _definition$queryKey !== void 0 ? _definition$queryKey : defaultQueryKey(screwName, methodName, args);
    });
    _defineProperty(this, "hasMethod", function (screwName, methodName) {
      var _this$screws$screwNam;
      return Boolean((_this$screws$screwNam = _this.screws[screwName]) === null || _this$screws$screwNam === void 0 ? void 0 : _this$screws$screwNam.methods[methodName]);
    });
    _defineProperty(this, "subscribeMutation", function (mutationKey, listener) {
      var _this$mutationListene;
      var listeners = (_this$mutationListene = _this.mutationListeners.get(mutationKey)) !== null && _this$mutationListene !== void 0 ? _this$mutationListene : new Set();
      listeners.add(listener);
      _this.mutationListeners.set(mutationKey, listeners);
      return function () {
        var current = _this.mutationListeners.get(mutationKey);
        if (!current) {
          return;
        }
        current["delete"](listener);
        if (current.size === 0) {
          _this.mutationListeners["delete"](mutationKey);
        }
      };
    });
    _defineProperty(this, "subscribeEvents", function (listener) {
      _this.eventListeners.add(listener);
      return function () {
        _this.eventListeners["delete"](listener);
      };
    });
    _defineProperty(this, "registerQueryObserver", function (screwName, methodName, options) {
      var entry = _this.ensureQueryEntry(screwName, methodName, options);
      entry.observers += 1;
      if (entry.gcTimeoutId) {
        clearTimeout(entry.gcTimeoutId);
        entry.gcTimeoutId = undefined;
      }
      return entry;
    });
    _defineProperty(this, "unregisterQueryObserver", function (queryKey) {
      var keyHash = (0, _queryKey.serializeQueryKey)(queryKey);
      var entry = _this.queryEntries.get(keyHash);
      if (!entry) {
        return;
      }
      entry.observers = Math.max(0, entry.observers - 1);
      if (entry.observers === 0) {
        entry.gcTimeoutId = setTimeout(function () {
          var current = _this.queryEntries.get(keyHash);
          if (current && current.observers === 0) {
            var _current$abortControl;
            (_current$abortControl = current.abortController) === null || _current$abortControl === void 0 || _current$abortControl.abort();
            _this.queryEntries["delete"](keyHash);
            _this.queryListeners["delete"](keyHash);
          }
        }, entry.cacheTime);
        if (typeof entry.gcTimeoutId.unref === 'function') {
          entry.gcTimeoutId.unref();
        }
      }
    });
    _defineProperty(this, "getQueryState", function (queryKey) {
      var _this$queryEntries$ge, _this$queryEntries$ge2;
      var keyHash = (0, _queryKey.serializeQueryKey)(queryKey);
      return (_this$queryEntries$ge = (_this$queryEntries$ge2 = _this.queryEntries.get(keyHash)) === null || _this$queryEntries$ge2 === void 0 ? void 0 : _this$queryEntries$ge2.state) !== null && _this$queryEntries$ge !== void 0 ? _this$queryEntries$ge : idleQueryState;
    });
    _defineProperty(this, "getMutationState", function (mutationKey) {
      var _this$mutationStates$;
      return (_this$mutationStates$ = _this.mutationStates.get(mutationKey)) !== null && _this$mutationStates$ !== void 0 ? _this$mutationStates$ : idleMutationState;
    });
    _defineProperty(this, "resetMutationState", function (mutationKey) {
      _this.mutationStates.set(mutationKey, createMutationState());
      _this.notifyMutation(mutationKey);
    });
    _defineProperty(this, "fetchQuery", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(screwName, methodName, options, fetchOptions) {
        var _options$args2;
        var entry, definition, requestId, isFirstLoad, abortController, args, startedAt, requestPromise;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              entry = _this.ensureQueryEntry(screwName, methodName, options);
              definition = _this.getMethodDefinition(screwName, methodName, 'query');
              if (!(entry.inFlight && !(fetchOptions !== null && fetchOptions !== void 0 && fetchOptions.force))) {
                _context4.n = 1;
                break;
              }
              _this.metrics.dedupedRequests += 1;
              return _context4.a(2, entry.inFlight);
            case 1:
              if (entry.abortController && fetchOptions !== null && fetchOptions !== void 0 && fetchOptions.force) {
                entry.abortController.abort();
              }
              requestId = entry.requestId + 1;
              isFirstLoad = entry.state.updatedAt === null && entry.state.data === null;
              abortController = new AbortController();
              entry.requestId = requestId;
              entry.abortController = abortController;
              entry.state = _objectSpread(_objectSpread({}, entry.state), {}, {
                status: isFirstLoad ? 'loading' : entry.state.status,
                isLoading: isFirstLoad,
                isFetching: true,
                isRefetching: !isFirstLoad,
                error: null
              });
              _this.notifyQuery(entry.queryKey);
              _this.emitEvent({
                type: 'query:start',
                screwName: screwName,
                methodName: methodName,
                queryKey: entry.queryKey,
                timestamp: Date.now()
              });
              _this.metrics.cacheMisses += 1;
              _this.metrics.networkRequests += 1;
              args = (_options$args2 = options === null || options === void 0 ? void 0 : options.args) !== null && _options$args2 !== void 0 ? _options$args2 : entry.args;
              startedAt = Date.now();
              requestPromise = Promise.resolve().then(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
                var _definition$httpMetho2;
                var validatedArgs, route, response;
                return _regenerator().w(function (_context) {
                  while (1) switch (_context.n) {
                    case 0:
                      validatedArgs = (0, _validators.runValidator)(definition.paramsValidator, args, 'QUERY_PARAMS_VALIDATION_FAILED', "Query params validation failed for ".concat(screwName, ".").concat(methodName, "."));
                      route = resolveRoute(definition, validatedArgs);
                      _context.n = 1;
                      return _this.apiInstance({
                        method: (_definition$httpMetho2 = definition.httpMethod) !== null && _definition$httpMetho2 !== void 0 ? _definition$httpMetho2 : 'GET',
                        url: route,
                        headers: definition.headers,
                        signal: abortController.signal
                      });
                    case 1:
                      response = _context.v;
                      return _context.a(2, {
                        response: response,
                        route: route
                      });
                  }
                }, _callee);
              }))).then(/*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(response) {
                  var _definition$httpMetho3, _definition$onSuccess, _definition$onSettled, _options$onSuccess, _options$onSettled;
                  var latestEntry, validatedResponse, durationMs;
                  return _regenerator().w(function (_context2) {
                    while (1) switch (_context2.n) {
                      case 0:
                        latestEntry = _this.queryEntries.get(entry.keyHash);
                        if (!(!latestEntry || latestEntry.requestId !== requestId)) {
                          _context2.n = 1;
                          break;
                        }
                        return _context2.a(2, latestEntry === null || latestEntry === void 0 ? void 0 : latestEntry.state.data);
                      case 1:
                        validatedResponse = (0, _validators.runValidator)(definition.responseValidator, response.response.data, 'QUERY_RESPONSE_VALIDATION_FAILED', "Query response validation failed for ".concat(screwName, ".").concat(methodName, "."));
                        durationMs = Date.now() - startedAt;
                        latestEntry.lastUpdatedDurationMs = durationMs;
                        _this.recordRequestDuration(durationMs);
                        latestEntry.inFlight = undefined;
                        latestEntry.abortController = undefined;
                        latestEntry.state = {
                          status: 'success',
                          data: validatedResponse,
                          error: null,
                          isLoading: false,
                          isFetching: false,
                          isRefetching: false,
                          updatedAt: Date.now(),
                          invalidatedAt: null
                        };
                        (0, _logger.logRequest)((_definition$httpMetho3 = definition.httpMethod) !== null && _definition$httpMetho3 !== void 0 ? _definition$httpMetho3 : 'GET', response.route, response.response.status, response.response.headers, undefined, validatedResponse, durationMs);
                        if (!_this.screws[screwName].persistence) {
                          _context2.n = 2;
                          break;
                        }
                        _context2.n = 2;
                        return _localforage["default"].setItem(_this.getPersistenceKey(entry.queryKey), validatedResponse);
                      case 2:
                        _context2.n = 3;
                        return (_definition$onSuccess = definition.onSuccess) === null || _definition$onSuccess === void 0 ? void 0 : _definition$onSuccess.call(definition, validatedResponse);
                      case 3:
                        _context2.n = 4;
                        return (_definition$onSettled = definition.onSettled) === null || _definition$onSettled === void 0 ? void 0 : _definition$onSettled.call(definition, validatedResponse, null);
                      case 4:
                        _context2.n = 5;
                        return options === null || options === void 0 || (_options$onSuccess = options.onSuccess) === null || _options$onSuccess === void 0 ? void 0 : _options$onSuccess.call(options, validatedResponse);
                      case 5:
                        _context2.n = 6;
                        return options === null || options === void 0 || (_options$onSettled = options.onSettled) === null || _options$onSettled === void 0 ? void 0 : _options$onSettled.call(options, validatedResponse, null);
                      case 6:
                        _this.notifyQuery(entry.queryKey);
                        _this.emitEvent({
                          type: 'query:success',
                          screwName: screwName,
                          methodName: methodName,
                          queryKey: entry.queryKey,
                          status: response.response.status,
                          durationMs: durationMs,
                          timestamp: Date.now()
                        });
                        return _context2.a(2, validatedResponse);
                    }
                  }, _callee2);
                }));
                return function (_x5) {
                  return _ref3.apply(this, arguments);
                };
              }())["catch"](/*#__PURE__*/function () {
                var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(error) {
                  var _definition$onError, _definition$onSettled2, _options$onError, _options$onSettled2;
                  var latestEntry, normalized, cachedData;
                  return _regenerator().w(function (_context3) {
                    while (1) switch (_context3.n) {
                      case 0:
                        if (!(error.name === 'AbortError')) {
                          _context3.n = 1;
                          break;
                        }
                        throw error;
                      case 1:
                        latestEntry = _this.queryEntries.get(entry.keyHash);
                        normalized = (0, _errors.normalizeError)(error, "Query failed for ".concat(screwName, ".").concat(methodName, "."), definition.documentedErrors);
                        if (!(!latestEntry || latestEntry.requestId !== requestId)) {
                          _context3.n = 2;
                          break;
                        }
                        throw normalized;
                      case 2:
                        latestEntry.inFlight = undefined;
                        latestEntry.abortController = undefined;
                        if (!_this.screws[screwName].persistence) {
                          _context3.n = 4;
                          break;
                        }
                        _context3.n = 3;
                        return _localforage["default"].getItem(_this.getPersistenceKey(entry.queryKey));
                      case 3:
                        cachedData = _context3.v;
                        if (!(cachedData !== null && cachedData !== undefined)) {
                          _context3.n = 4;
                          break;
                        }
                        latestEntry.state = {
                          status: 'success',
                          data: cachedData,
                          error: null,
                          isLoading: false,
                          isFetching: false,
                          isRefetching: false,
                          updatedAt: Date.now(),
                          invalidatedAt: null
                        };
                        _this.notifyQuery(entry.queryKey);
                        return _context3.a(2, cachedData);
                      case 4:
                        latestEntry.state = _objectSpread(_objectSpread({}, latestEntry.state), {}, {
                          status: 'error',
                          error: normalized,
                          isLoading: false,
                          isFetching: false,
                          isRefetching: false
                        });
                        _context3.n = 5;
                        return (_definition$onError = definition.onError) === null || _definition$onError === void 0 ? void 0 : _definition$onError.call(definition, normalized);
                      case 5:
                        _context3.n = 6;
                        return (_definition$onSettled2 = definition.onSettled) === null || _definition$onSettled2 === void 0 ? void 0 : _definition$onSettled2.call(definition, undefined, normalized);
                      case 6:
                        _context3.n = 7;
                        return options === null || options === void 0 || (_options$onError = options.onError) === null || _options$onError === void 0 ? void 0 : _options$onError.call(options, normalized);
                      case 7:
                        _context3.n = 8;
                        return options === null || options === void 0 || (_options$onSettled2 = options.onSettled) === null || _options$onSettled2 === void 0 ? void 0 : _options$onSettled2.call(options, undefined, normalized);
                      case 8:
                        _this.notifyQuery(entry.queryKey);
                        _this.emitEvent({
                          type: 'query:error',
                          screwName: screwName,
                          methodName: methodName,
                          queryKey: entry.queryKey,
                          error: normalized,
                          timestamp: Date.now()
                        });
                        throw normalized;
                      case 9:
                        return _context3.a(2);
                    }
                  }, _callee3);
                }));
                return function (_x6) {
                  return _ref4.apply(this, arguments);
                };
              }());
              entry.inFlight = requestPromise;
              return _context4.a(2, requestPromise);
          }
        }, _callee4);
      }));
      return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }());
    _defineProperty(this, "prefetchQuery", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(screwName, methodName, options) {
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              return _context5.a(2, _this.fetchQuery(screwName, methodName, options));
          }
        }, _callee5);
      }));
      return function (_x7, _x8, _x9) {
        return _ref5.apply(this, arguments);
      };
    }());
    _defineProperty(this, "executeMutation", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(screwName, methodName, variables) {
        var _yield$options$optimi, _options$optimisticUp, _definition$optimisti;
        var args,
          options,
          definition,
          mutationKey,
          mutationState,
          validatedVariables,
          validatedArgs,
          optimisticRollback,
          routeArgs,
          route,
          requestData,
          startedAt,
          _definition$httpMetho4,
          _definition$httpMetho5,
          _definition$onSuccess2,
          _definition$onSettled3,
          _options$onSuccess2,
          _options$onSettled3,
          response,
          validatedResponse,
          _definition$onError2,
          _definition$onSettled4,
          _options$onError2,
          _options$onSettled4,
          normalized,
          _args6 = arguments,
          _t,
          _t2,
          _t3,
          _t4;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              args = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : [];
              options = _args6.length > 4 ? _args6[4] : undefined;
              definition = _this.getMethodDefinition(screwName, methodName, 'mutation');
              mutationKey = _this.getMutationKey(screwName, methodName);
              mutationState = createMutationState({
                status: 'pending',
                data: null,
                error: null,
                isPending: true
              });
              _this.mutationStates.set(mutationKey, mutationState);
              _this.notifyMutation(mutationKey);
              _this.emitEvent({
                type: 'mutation:start',
                screwName: screwName,
                methodName: methodName,
                mutationKey: mutationKey,
                timestamp: Date.now()
              });
              validatedVariables = (0, _validators.runValidator)(definition.bodyValidator, variables, 'MUTATION_BODY_VALIDATION_FAILED', "Mutation body validation failed for ".concat(screwName, ".").concat(methodName, "."));
              validatedArgs = (0, _validators.runValidator)(definition.paramsValidator, args, 'MUTATION_PARAMS_VALIDATION_FAILED', "Mutation params validation failed for ".concat(screwName, ".").concat(methodName, "."));
              _context6.n = 1;
              return options === null || options === void 0 || (_options$optimisticUp = options.optimisticUpdate) === null || _options$optimisticUp === void 0 ? void 0 : _options$optimisticUp.call(options, {
                client: _this,
                variables: validatedVariables
              });
            case 1:
              _t2 = _yield$options$optimi = _context6.v;
              _t = _t2 !== null;
              if (!_t) {
                _context6.n = 2;
                break;
              }
              _t = _yield$options$optimi !== void 0;
            case 2:
              if (!_t) {
                _context6.n = 3;
                break;
              }
              _t3 = _yield$options$optimi;
              _context6.n = 5;
              break;
            case 3:
              _context6.n = 4;
              return (_definition$optimisti = definition.optimisticUpdate) === null || _definition$optimisti === void 0 ? void 0 : _definition$optimisti.call(definition, {
                client: _this,
                variables: validatedVariables
              });
            case 4:
              _t3 = _context6.v;
            case 5:
              optimisticRollback = _t3;
              routeArgs = validatedVariables === undefined ? validatedArgs : [].concat(_toConsumableArray(validatedArgs), [validatedVariables]);
              route = resolveRoute(definition, routeArgs);
              requestData = validatedVariables;
              startedAt = Date.now();
              _context6.p = 6;
              _this.metrics.networkRequests += 1;
              _context6.n = 7;
              return _this.apiInstance({
                method: (_definition$httpMetho4 = definition.httpMethod) !== null && _definition$httpMetho4 !== void 0 ? _definition$httpMetho4 : 'POST',
                url: route,
                headers: definition.headers,
                data: requestData
              });
            case 7:
              response = _context6.v;
              validatedResponse = (0, _validators.runValidator)(definition.responseValidator, response.data, 'MUTATION_RESPONSE_VALIDATION_FAILED', "Mutation response validation failed for ".concat(screwName, ".").concat(methodName, "."));
              _this.mutationStates.set(mutationKey, createMutationState({
                status: 'success',
                data: validatedResponse,
                error: null,
                isPending: false
              }));
              _this.notifyMutation(mutationKey);
              _this.recordRequestDuration(Date.now() - startedAt);
              (0, _logger.logRequest)((_definition$httpMetho5 = definition.httpMethod) !== null && _definition$httpMetho5 !== void 0 ? _definition$httpMetho5 : 'POST', route, response.status, response.headers, requestData, validatedResponse, Date.now() - startedAt);
              _context6.n = 8;
              return _this.invalidateTargets(definition.invalidateQueries);
            case 8:
              _context6.n = 9;
              return (_definition$onSuccess2 = definition.onSuccess) === null || _definition$onSuccess2 === void 0 ? void 0 : _definition$onSuccess2.call(definition, validatedResponse);
            case 9:
              _context6.n = 10;
              return (_definition$onSettled3 = definition.onSettled) === null || _definition$onSettled3 === void 0 ? void 0 : _definition$onSettled3.call(definition, validatedResponse, null);
            case 10:
              _context6.n = 11;
              return options === null || options === void 0 || (_options$onSuccess2 = options.onSuccess) === null || _options$onSuccess2 === void 0 ? void 0 : _options$onSuccess2.call(options, validatedResponse, validatedVariables);
            case 11:
              _context6.n = 12;
              return options === null || options === void 0 || (_options$onSettled3 = options.onSettled) === null || _options$onSettled3 === void 0 ? void 0 : _options$onSettled3.call(options, validatedResponse, null, validatedVariables);
            case 12:
              _this.emitEvent({
                type: 'mutation:success',
                screwName: screwName,
                methodName: methodName,
                mutationKey: mutationKey,
                status: response.status,
                durationMs: Date.now() - startedAt,
                timestamp: Date.now()
              });
              return _context6.a(2, validatedResponse);
            case 13:
              _context6.p = 13;
              _t4 = _context6.v;
              normalized = (0, _errors.normalizeError)(_t4, "Mutation failed for ".concat(screwName, ".").concat(methodName, "."), definition.documentedErrors);
              if (!optimisticRollback) {
                _context6.n = 14;
                break;
              }
              _context6.n = 14;
              return optimisticRollback.rollback();
            case 14:
              _this.mutationStates.set(mutationKey, createMutationState({
                status: 'error',
                data: null,
                error: normalized,
                isPending: false
              }));
              _this.notifyMutation(mutationKey);
              _context6.n = 15;
              return (_definition$onError2 = definition.onError) === null || _definition$onError2 === void 0 ? void 0 : _definition$onError2.call(definition, normalized);
            case 15:
              _context6.n = 16;
              return (_definition$onSettled4 = definition.onSettled) === null || _definition$onSettled4 === void 0 ? void 0 : _definition$onSettled4.call(definition, undefined, normalized);
            case 16:
              _context6.n = 17;
              return options === null || options === void 0 || (_options$onError2 = options.onError) === null || _options$onError2 === void 0 ? void 0 : _options$onError2.call(options, normalized, validatedVariables);
            case 17:
              _context6.n = 18;
              return options === null || options === void 0 || (_options$onSettled4 = options.onSettled) === null || _options$onSettled4 === void 0 ? void 0 : _options$onSettled4.call(options, undefined, normalized, validatedVariables);
            case 18:
              _this.emitEvent({
                type: 'mutation:error',
                screwName: screwName,
                methodName: methodName,
                mutationKey: mutationKey,
                error: normalized,
                timestamp: Date.now()
              });
              throw normalized;
            case 19:
              return _context6.a(2);
          }
        }, _callee6, null, [[6, 13]]);
      }));
      return function (_x0, _x1, _x10) {
        return _ref6.apply(this, arguments);
      };
    }());
    _defineProperty(this, "getQueryData", function (match) {
      var _ref7;
      var entry = _this.findFirstMatch(match);
      if (!entry) {
        return null;
      }
      _this.metrics.cacheHits += 1;
      return (_ref7 = entry.state.data) !== null && _ref7 !== void 0 ? _ref7 : null;
    });
    _defineProperty(this, "setQueryData", function (match, updater) {
      var entry = _this.findFirstMatch(match);
      if (!entry) {
        var normalized = (0, _queryKey.normalizeMatchInput)(match);
        if (normalized !== null && normalized !== void 0 && normalized.queryKey) {
          var keyHash = (0, _queryKey.serializeQueryKey)(normalized.queryKey);
          var created = _this.createDetachedEntry(normalized.queryKey);
          _this.queryEntries.set(keyHash, created);
          created.state = _objectSpread(_objectSpread({}, created.state), {}, {
            status: 'success',
            data: typeof updater === 'function' ? updater(null) : updater,
            updatedAt: Date.now()
          });
          _this.notifyQuery(created.queryKey);
        }
        return;
      }
      var nextData = typeof updater === 'function' ? updater(entry.state.data) : updater;
      entry.state = _objectSpread(_objectSpread({}, entry.state), {}, {
        status: 'success',
        data: nextData,
        error: null,
        updatedAt: Date.now(),
        invalidatedAt: null
      });
      _this.notifyQuery(entry.queryKey);
    });
    _defineProperty(this, "patchQueryState", function (match, patch) {
      var entry = _this.findFirstMatch(match);
      if (!entry) {
        return;
      }
      entry.state = _objectSpread(_objectSpread({}, entry.state), patch);
      _this.notifyQuery(entry.queryKey);
    });
    _defineProperty(this, "invalidateQueries", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(match) {
        var entries;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              entries = _this.findMatchingEntries(match);
              _context8.n = 1;
              return Promise.all(entries.map(/*#__PURE__*/function () {
                var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(entry) {
                  return _regenerator().w(function (_context7) {
                    while (1) switch (_context7.n) {
                      case 0:
                        entry.state = _objectSpread(_objectSpread({}, entry.state), {}, {
                          status: 'stale',
                          invalidatedAt: Date.now()
                        });
                        _this.notifyQuery(entry.queryKey);
                        _this.emitEvent({
                          type: 'query:invalidate',
                          screwName: entry.screwName,
                          methodName: entry.methodName,
                          queryKey: entry.queryKey,
                          timestamp: Date.now()
                        });
                        if (!(entry.observers > 0)) {
                          _context7.n = 1;
                          break;
                        }
                        _context7.n = 1;
                        return _this.fetchQuery(entry.screwName, entry.methodName, {
                          args: entry.args,
                          staleTime: entry.staleTime,
                          cacheTime: entry.cacheTime,
                          refetchOnReconnect: entry.refetchOnReconnect,
                          refetchOnWindowFocus: entry.refetchOnWindowFocus
                        }, {
                          force: true
                        });
                      case 1:
                        return _context7.a(2);
                    }
                  }, _callee7);
                }));
                return function (_x12) {
                  return _ref9.apply(this, arguments);
                };
              }()));
            case 1:
              return _context8.a(2);
          }
        }, _callee8);
      }));
      return function (_x11) {
        return _ref8.apply(this, arguments);
      };
    }());
    _defineProperty(this, "handleWindowFocus", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return _this.refetchMatching(function (entry) {
              return entry.observers > 0 && entry.refetchOnWindowFocus;
            });
          case 1:
            return _context9.a(2);
        }
      }, _callee9);
    })));
    _defineProperty(this, "handleReconnect", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            _context0.n = 1;
            return _this.refetchMatching(function (entry) {
              return entry.observers > 0 && entry.refetchOnReconnect;
            });
          case 1:
            return _context0.a(2);
        }
      }, _callee0);
    })));
    _defineProperty(this, "getMetrics", function () {
      return _objectSpread({}, _this.metrics);
    });
    _defineProperty(this, "getQuerySnapshots", function () {
      return _toConsumableArray(_this.queryEntries.values()).map(function (entry) {
        return {
          queryKey: entry.queryKey,
          state: _objectSpread({}, entry.state)
        };
      });
    });
    _defineProperty(this, "getMutationSnapshots", function () {
      return _toConsumableArray(_this.mutationStates.entries()).map(function (_ref10) {
        var _ref11 = _slicedToArray(_ref10, 2),
          mutationKey = _ref11[0],
          state = _ref11[1];
        return {
          mutationKey: mutationKey,
          state: _objectSpread({}, state)
        };
      });
    });
    _defineProperty(this, "getEvents", function () {
      return _toConsumableArray(_this.eventLog);
    });
    _defineProperty(this, "dehydrate", function () {
      var _this$options, _this$options2;
      return {
        queries: _toConsumableArray(_this.queryEntries.values()).map(function (entry) {
          return {
            queryKey: entry.queryKey,
            screwName: entry.screwName,
            methodName: entry.methodName,
            args: entry.args,
            state: _objectSpread({}, entry.state),
            staleTime: entry.staleTime,
            cacheTime: entry.cacheTime,
            refetchOnWindowFocus: entry.refetchOnWindowFocus,
            refetchOnReconnect: entry.refetchOnReconnect
          };
        }),
        mutations: _toConsumableArray(_this.mutationStates.entries()).map(function (_ref12) {
          var _ref13 = _slicedToArray(_ref12, 2),
            mutationKey = _ref13[0],
            state = _ref13[1];
          return {
            mutationKey: mutationKey,
            state: _objectSpread({}, state)
          };
        }),
        meta: {
          persistedAt: Date.now(),
          version: (_this$options = _this.options) === null || _this$options === void 0 || (_this$options = _this$options.persist) === null || _this$options === void 0 ? void 0 : _this$options.version,
          tenantId: (_this$options2 = _this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2.tenantId
        }
      };
    });
    _defineProperty(this, "hydrate", function (state) {
      var _this$options3;
      var version = (_this$options3 = _this.options) === null || _this$options3 === void 0 || (_this$options3 = _this$options3.persist) === null || _this$options3 === void 0 ? void 0 : _this$options3.version;
      if (version && state.meta.version && version !== state.meta.version) {
        return;
      }
      state.queries.forEach(function (query) {
        var keyHash = (0, _queryKey.serializeQueryKey)(query.queryKey);
        _this.queryEntries.set(keyHash, {
          queryKey: query.queryKey,
          keyHash: keyHash,
          screwName: query.screwName,
          methodName: query.methodName,
          args: query.args,
          state: _objectSpread({}, query.state),
          staleTime: query.staleTime,
          cacheTime: query.cacheTime,
          refetchOnWindowFocus: query.refetchOnWindowFocus,
          refetchOnReconnect: query.refetchOnReconnect,
          observers: 0,
          requestId: 0
        });
        _this.notifyQuery(query.queryKey);
      });
      state.mutations.forEach(function (mutation) {
        _this.mutationStates.set(mutation.mutationKey, _objectSpread({}, mutation.state));
        _this.notifyMutation(mutation.mutationKey);
      });
    });
    _defineProperty(this, "persistCache", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
      var _this$options4;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.n) {
          case 0:
            if ((_this$options4 = _this.options) !== null && _this$options4 !== void 0 && _this$options4.persist) {
              _context1.n = 1;
              break;
            }
            return _context1.a(2);
          case 1:
            _context1.n = 2;
            return _localforage["default"].setItem(_this.getPersistStoreKey(), _this.dehydrate());
          case 2:
            return _context1.a(2);
        }
      }, _callee1);
    })));
    _defineProperty(this, "restorePersistedCache", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
      var _this$options5;
      var state;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.n) {
          case 0:
            if ((_this$options5 = _this.options) !== null && _this$options5 !== void 0 && _this$options5.persist) {
              _context10.n = 1;
              break;
            }
            return _context10.a(2);
          case 1:
            _context10.n = 2;
            return _localforage["default"].getItem(_this.getPersistStoreKey());
          case 2:
            state = _context10.v;
            if (state) {
              _this.hydrate(state);
            }
          case 3:
            return _context10.a(2);
        }
      }, _callee10);
    })));
    _defineProperty(this, "executeLegacyMethod", /*#__PURE__*/function () {
      var _ref16 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(screwName, methodName) {
        var _definition$httpMetho6, _definition$httpMetho7;
        var definition,
          _len,
          args,
          _key,
          variables,
          routeArgs,
          _args11 = arguments;
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              definition = _this.getMethodDefinition(screwName, methodName);
              for (_len = _args11.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = _args11[_key];
              }
              if (!isQueryDefinition(definition)) {
                _context11.n = 1;
                break;
              }
              return _context11.a(2, _this.fetchQuery(screwName, methodName, {
                args: args
              }));
            case 1:
              variables = resolveBody((_definition$httpMetho6 = definition.httpMethod) !== null && _definition$httpMetho6 !== void 0 ? _definition$httpMetho6 : 'POST', args);
              routeArgs = resolveRouteArgs((_definition$httpMetho7 = definition.httpMethod) !== null && _definition$httpMetho7 !== void 0 ? _definition$httpMetho7 : 'POST', args);
              return _context11.a(2, _this.executeMutation(screwName, methodName, variables, routeArgs));
          }
        }, _callee11);
      }));
      return function (_x13, _x14) {
        return _ref16.apply(this, arguments);
      };
    }());
    _defineProperty(this, "ensureQueryEntry", function (screwName, methodName, options) {
      var _options$args3, _options$initialData, _ref21, _options$staleTime2, _ref22, _options$cacheTime2, _ref23, _options$refetchOnWin2, _ref24, _options$refetchOnRec2;
      var definition = _this.getMethodDefinition(screwName, methodName, 'query');
      var args = (_options$args3 = options === null || options === void 0 ? void 0 : options.args) !== null && _options$args3 !== void 0 ? _options$args3 : [];
      var queryKey = _this.getQueryKey(screwName, methodName, options);
      var keyHash = (0, _queryKey.serializeQueryKey)(queryKey);
      var existing = _this.queryEntries.get(keyHash);
      if (existing) {
        var _ref17, _options$staleTime, _ref18, _options$cacheTime, _ref19, _options$refetchOnRec, _ref20, _options$refetchOnWin;
        existing.args = args;
        existing.staleTime = (_ref17 = (_options$staleTime = options === null || options === void 0 ? void 0 : options.staleTime) !== null && _options$staleTime !== void 0 ? _options$staleTime : definition.staleTime) !== null && _ref17 !== void 0 ? _ref17 : existing.staleTime;
        existing.cacheTime = (_ref18 = (_options$cacheTime = options === null || options === void 0 ? void 0 : options.cacheTime) !== null && _options$cacheTime !== void 0 ? _options$cacheTime : definition.cacheTime) !== null && _ref18 !== void 0 ? _ref18 : existing.cacheTime;
        existing.refetchOnReconnect = (_ref19 = (_options$refetchOnRec = options === null || options === void 0 ? void 0 : options.refetchOnReconnect) !== null && _options$refetchOnRec !== void 0 ? _options$refetchOnRec : definition.refetchOnReconnect) !== null && _ref19 !== void 0 ? _ref19 : existing.refetchOnReconnect;
        existing.refetchOnWindowFocus = (_ref20 = (_options$refetchOnWin = options === null || options === void 0 ? void 0 : options.refetchOnWindowFocus) !== null && _options$refetchOnWin !== void 0 ? _options$refetchOnWin : definition.refetchOnWindowFocus) !== null && _ref20 !== void 0 ? _ref20 : existing.refetchOnWindowFocus;
        return existing;
      }
      var initialData = (_options$initialData = options === null || options === void 0 ? void 0 : options.initialData) !== null && _options$initialData !== void 0 ? _options$initialData : options === null || options === void 0 ? void 0 : options.placeholderData;
      var entry = {
        queryKey: queryKey,
        keyHash: keyHash,
        screwName: screwName,
        methodName: methodName,
        args: args,
        state: createQueryState(initialData !== undefined ? {
          status: 'success',
          data: initialData,
          updatedAt: Date.now()
        } : undefined),
        staleTime: (_ref21 = (_options$staleTime2 = options === null || options === void 0 ? void 0 : options.staleTime) !== null && _options$staleTime2 !== void 0 ? _options$staleTime2 : definition.staleTime) !== null && _ref21 !== void 0 ? _ref21 : _queryKey.DEFAULT_STALE_TIME,
        cacheTime: (_ref22 = (_options$cacheTime2 = options === null || options === void 0 ? void 0 : options.cacheTime) !== null && _options$cacheTime2 !== void 0 ? _options$cacheTime2 : definition.cacheTime) !== null && _ref22 !== void 0 ? _ref22 : _queryKey.DEFAULT_CACHE_TIME,
        refetchOnWindowFocus: (_ref23 = (_options$refetchOnWin2 = options === null || options === void 0 ? void 0 : options.refetchOnWindowFocus) !== null && _options$refetchOnWin2 !== void 0 ? _options$refetchOnWin2 : definition.refetchOnWindowFocus) !== null && _ref23 !== void 0 ? _ref23 : true,
        refetchOnReconnect: (_ref24 = (_options$refetchOnRec2 = options === null || options === void 0 ? void 0 : options.refetchOnReconnect) !== null && _options$refetchOnRec2 !== void 0 ? _options$refetchOnRec2 : definition.refetchOnReconnect) !== null && _ref24 !== void 0 ? _ref24 : true,
        observers: 0,
        requestId: 0
      };
      _this.queryEntries.set(keyHash, entry);
      return entry;
    });
    _defineProperty(this, "createDetachedEntry", function (queryKey) {
      var _queryKey$, _queryKey$2;
      return {
        queryKey: queryKey,
        keyHash: (0, _queryKey.serializeQueryKey)(queryKey),
        screwName: String((_queryKey$ = queryKey[0]) !== null && _queryKey$ !== void 0 ? _queryKey$ : 'detached'),
        methodName: String((_queryKey$2 = queryKey[1]) !== null && _queryKey$2 !== void 0 ? _queryKey$2 : 'detached'),
        args: queryKey.slice(2),
        state: createQueryState(),
        staleTime: _queryKey.DEFAULT_STALE_TIME,
        cacheTime: _queryKey.DEFAULT_CACHE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        observers: 0,
        requestId: 0
      };
    });
    this.apiInstance = apiInstance;
    this.screws = screws;
    this.options = _options;
  }
  return _createClass(DefaultReactScrewClient, [{
    key: "getMethodDefinition",
    value: function getMethodDefinition(screwName, methodName, expectedType) {
      var screw = this.screws[screwName];
      var definition = screw === null || screw === void 0 ? void 0 : screw.methods[methodName];
      if (!screw || !definition) {
        throw new _errors.ReactScrewError("Method \"".concat(methodName, "\" is not defined for screw \"").concat(screwName, "\"."), {
          code: 'SCREW_METHOD_NOT_FOUND'
        });
      }
      if (expectedType && inferMethodType(definition) !== expectedType) {
        throw new _errors.ReactScrewError("Method \"".concat(methodName, "\" on screw \"").concat(screwName, "\" is not a ").concat(expectedType, "."), {
          code: 'INVALID_METHOD_TYPE'
        });
      }
      return definition;
    }
  }, {
    key: "notifyQuery",
    value: function notifyQuery(queryKey) {
      var _this$queryListeners$2;
      var keyHash = (0, _queryKey.serializeQueryKey)(queryKey);
      (_this$queryListeners$2 = this.queryListeners.get(keyHash)) === null || _this$queryListeners$2 === void 0 || _this$queryListeners$2.forEach(function (listener) {
        return listener();
      });
    }
  }, {
    key: "notifyMutation",
    value: function notifyMutation(mutationKey) {
      var _this$mutationListene2;
      (_this$mutationListene2 = this.mutationListeners.get(mutationKey)) === null || _this$mutationListene2 === void 0 || _this$mutationListene2.forEach(function (listener) {
        return listener();
      });
    }
  }, {
    key: "emitEvent",
    value: function emitEvent(event) {
      var _this$options6, _this$options6$onEven;
      this.eventLog.push(event);
      if (this.eventLog.length > 200) {
        this.eventLog.shift();
      }
      (_this$options6 = this.options) === null || _this$options6 === void 0 || (_this$options6 = _this$options6.observer) === null || _this$options6 === void 0 || (_this$options6$onEven = _this$options6.onEvent) === null || _this$options6$onEven === void 0 || _this$options6$onEven.call(_this$options6, event);
      this.eventListeners.forEach(function (listener) {
        return listener(event);
      });
    }
  }, {
    key: "recordRequestDuration",
    value: function recordRequestDuration(durationMs) {
      this.totalRequestDurationMs += durationMs;
      var count = this.metrics.networkRequests || 1;
      this.metrics.averageRequestDurationMs = this.totalRequestDurationMs / count;
    }
  }, {
    key: "getMutationKey",
    value: function getMutationKey(screwName, methodName) {
      return "".concat(screwName, ":").concat(methodName);
    }
  }, {
    key: "findFirstMatch",
    value: function findFirstMatch(match) {
      return this.findMatchingEntries(match)[0];
    }
  }, {
    key: "findMatchingEntries",
    value: function findMatchingEntries(match) {
      var normalized = (0, _queryKey.normalizeMatchInput)(match);
      var entries = _toConsumableArray(this.queryEntries.values());
      if (!normalized) {
        return entries;
      }
      return entries.filter(function (entry) {
        if (normalized.queryKey) {
          return (0, _queryKey.serializeQueryKey)(entry.queryKey) === (0, _queryKey.serializeQueryKey)(normalized.queryKey);
        }
        if (normalized.prefix && !(0, _queryKey.keyStartsWith)(entry.queryKey, normalized.prefix)) {
          return false;
        }
        if (normalized.screwName && entry.screwName !== normalized.screwName) {
          return false;
        }
        if (normalized.methodName && entry.methodName !== normalized.methodName) {
          return false;
        }
        return true;
      });
    }
  }, {
    key: "invalidateTargets",
    value: function () {
      var _invalidateTargets = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(targets) {
        var _this2 = this;
        return _regenerator().w(function (_context12) {
          while (1) switch (_context12.n) {
            case 0:
              if (targets !== null && targets !== void 0 && targets.length) {
                _context12.n = 1;
                break;
              }
              return _context12.a(2);
            case 1:
              _context12.n = 2;
              return Promise.all(targets.map(function (target) {
                return _this2.invalidateQueries(mergeInvalidationTarget(target));
              }));
            case 2:
              return _context12.a(2);
          }
        }, _callee12);
      }));
      function invalidateTargets(_x15) {
        return _invalidateTargets.apply(this, arguments);
      }
      return invalidateTargets;
    }()
  }, {
    key: "refetchMatching",
    value: function () {
      var _refetchMatching = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(predicate) {
        var _this3 = this;
        var entries;
        return _regenerator().w(function (_context13) {
          while (1) switch (_context13.n) {
            case 0:
              entries = _toConsumableArray(this.queryEntries.values()).filter(predicate);
              _context13.n = 1;
              return Promise.all(entries.map(function (entry) {
                return _this3.fetchQuery(entry.screwName, entry.methodName, {
                  args: entry.args,
                  staleTime: entry.staleTime,
                  cacheTime: entry.cacheTime,
                  refetchOnReconnect: entry.refetchOnReconnect,
                  refetchOnWindowFocus: entry.refetchOnWindowFocus
                }, {
                  force: true
                })["catch"](function () {
                  return undefined;
                });
              }));
            case 1:
              return _context13.a(2);
          }
        }, _callee13, this);
      }));
      function refetchMatching(_x16) {
        return _refetchMatching.apply(this, arguments);
      }
      return refetchMatching;
    }()
  }, {
    key: "getPersistenceKey",
    value: function getPersistenceKey(queryKey) {
      return "".concat(this.getPersistStoreKey(), ":query:").concat((0, _queryKey.serializeQueryKey)(queryKey));
    }
  }, {
    key: "getPersistStoreKey",
    value: function getPersistStoreKey() {
      var _this$options$persist, _this$options7, _this$options$persist2, _this$options8, _this$options9;
      var namespace = (_this$options$persist = (_this$options7 = this.options) === null || _this$options7 === void 0 || (_this$options7 = _this$options7.persist) === null || _this$options7 === void 0 ? void 0 : _this$options7.namespace) !== null && _this$options$persist !== void 0 ? _this$options$persist : DEFAULT_PERSIST_NAMESPACE;
      var version = (_this$options$persist2 = (_this$options8 = this.options) === null || _this$options8 === void 0 || (_this$options8 = _this$options8.persist) === null || _this$options8 === void 0 ? void 0 : _this$options8.version) !== null && _this$options$persist2 !== void 0 ? _this$options$persist2 : 'v1';
      var tenantSuffix = (_this$options9 = this.options) !== null && _this$options9 !== void 0 && _this$options9.tenantId ? ":".concat(this.options.tenantId) : '';
      return "".concat(namespace, ":").concat(version).concat(tenantSuffix);
    }
  }]);
}();
var createReactScrewClient = exports.createReactScrewClient = function createReactScrewClient(apiInstance, screws, options) {
  return new DefaultReactScrewClient(apiInstance, screws, options);
};