"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DriverProvider = exports.DriverContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var _localforage = _interopRequireDefault(require("localforage"));
var _logger = require("../utils/logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // src/components/DriverProvider.jsx
var DriverContext = exports.DriverContext = /*#__PURE__*/(0, _react.createContext)();
var createInitialState = function createInitialState(screws) {
  var state = {};
  Object.keys(screws).forEach(function (key) {
    state[key] = {
      isLoading: false,
      data: null,
      error: null
    };
  });
  return state;
};
function driverReducer(state, action) {
  switch (action.type) {
    case 'REQUEST_START':
      return _objectSpread(_objectSpread({}, state), {}, _defineProperty({}, action.screwName, _objectSpread(_objectSpread({}, state[action.screwName]), {}, {
        isLoading: true,
        error: null
      })));
    case 'REQUEST_SUCCESS':
      return _objectSpread(_objectSpread({}, state), {}, _defineProperty({}, action.screwName, {
        isLoading: false,
        data: action.payload,
        error: null
      }));
    case 'REQUEST_FAILURE':
      return _objectSpread(_objectSpread({}, state), {}, _defineProperty({}, action.screwName, {
        isLoading: false,
        data: null,
        error: action.error
      }));
    default:
      return state;
  }
}
var DriverProvider = exports.DriverProvider = function DriverProvider(_ref) {
  var children = _ref.children,
    apiInstance = _ref.apiInstance,
    screws = _ref.screws;
  var initialState = createInitialState(screws);
  var _useReducer = (0, _react.useReducer)(driverReducer, initialState),
    _useReducer2 = _slicedToArray(_useReducer, 2),
    state = _useReducer2[0],
    dispatch = _useReducer2[1];

  // Fonction générique pour exécuter une méthode d'un screw
  var executeMethod = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(screwName, methodName) {
      var screw,
        _routeDef,
        _len,
        args,
        _key,
        route,
        httpMethod,
        _config,
        response,
        data,
        cachedData,
        _args = arguments;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            screw = screws[screwName];
            if (!(!screw || !screw.methods[methodName])) {
              _context.next = 3;
              break;
            }
            throw new Error("La m\xE9thode ".concat(methodName, " n'est pas d\xE9finie pour le screw ").concat(screwName));
          case 3:
            dispatch({
              type: 'REQUEST_START',
              screwName: screwName
            });
            _context.prev = 4;
            // Déterminer la route (si c'est une fonction, la générer avec les arguments)
            _routeDef = screw.methods[methodName].route;
            for (_len = _args.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = _args[_key];
            }
            route = typeof _routeDef === 'function' ? _routeDef.apply(void 0, args) : _routeDef;
            httpMethod = screw.methods[methodName].httpMethod || 'GET'; // Construire la configuration de la requête
            _config = {
              method: httpMethod,
              url: route
            }; // Ajouter les headers personnalisés si fournis
            if (screw.methods[methodName].headers) {
              _config.headers = screw.methods[methodName].headers;
            }

            // Pour les méthodes d'écriture, on attend éventuellement une data en premier argument
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod.toUpperCase()) && args[0]) {
              _config.data = args[0];
            }
            _context.next = 14;
            return apiInstance(_config);
          case 14:
            response = _context.sent;
            data = response.data; // Log complet de la requête en mode développement
            (0, _logger.logRequest)(httpMethod, route, response.status, response.headers, _config.data || null, data);

            // Sauvegarde en cache si l'option persistence est activée
            if (!screw.persistence) {
              _context.next = 20;
              break;
            }
            _context.next = 20;
            return _localforage["default"].setItem(screw.name, data);
          case 20:
            dispatch({
              type: 'REQUEST_SUCCESS',
              screwName: screwName,
              payload: data
            });
            return _context.abrupt("return", data);
          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](4);
            // En cas d'erreur, tenter de loguer la réponse d'erreur si elle est disponible
            if (_context.t0.response) {
              (0, _logger.logRequest)(screw.methods[methodName].httpMethod, routeDef, _context.t0.response.status, _context.t0.response.headers, config.data || null, _context.t0.response.data);
            }

            // En cas d'échec, tente de récupérer les données depuis localforage si la persistance est activée
            if (!screw.persistence) {
              _context.next = 35;
              break;
            }
            _context.next = 30;
            return _localforage["default"].getItem(screw.name);
          case 30:
            cachedData = _context.sent;
            if (!cachedData) {
              _context.next = 35;
              break;
            }
            console.warn("Using cached data for screw ".concat(screwName, " due to fetch error."));
            dispatch({
              type: 'REQUEST_SUCCESS',
              screwName: screwName,
              payload: cachedData
            });
            return _context.abrupt("return", cachedData);
          case 35:
            dispatch({
              type: 'REQUEST_FAILURE',
              screwName: screwName,
              error: _context.t0
            });
            throw _context.t0;
          case 37:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[4, 24]]);
    }));
    return function executeMethod(_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  // Initialisation des screws qui demandent une exécution au lancement
  (0, _react.useEffect)(function () {
    Object.values(screws).forEach(/*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(screw) {
        var data;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!(screw.executeOnLaunch && screw.methods.init)) {
                _context2.next = 19;
                break;
              }
              data = null;
              if (!screw.persistence) {
                _context2.next = 6;
                break;
              }
              _context2.next = 5;
              return _localforage["default"].getItem(screw.name);
            case 5:
              data = _context2.sent;
            case 6:
              if (data) {
                _context2.next = 18;
                break;
              }
              _context2.prev = 7;
              _context2.next = 10;
              return executeMethod(screw.name, 'init');
            case 10:
              data = _context2.sent;
              _context2.next = 16;
              break;
            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2["catch"](7);
              console.error("Erreur lors de l'initialisation du screw ".concat(screw.name, " :"), _context2.t0);
            case 16:
              _context2.next = 19;
              break;
            case 18:
              dispatch({
                type: 'REQUEST_SUCCESS',
                screwName: screw.name,
                payload: data
              });
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[7, 13]]);
      }));
      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());
  }, [apiInstance, screws]);
  var actions = {
    executeMethod: executeMethod
  };
  return /*#__PURE__*/_react["default"].createElement(DriverContext.Provider, {
    value: {
      state: state,
      actions: actions
    }
  }, children);
};