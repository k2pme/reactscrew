"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeError = exports.ReactScrewError = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
var ReactScrewError = exports.ReactScrewError = /*#__PURE__*/function (_Error) {
  function ReactScrewError(message, options) {
    var _this;
    _classCallCheck(this, ReactScrewError);
    _this = _callSuper(this, ReactScrewError, [message]);
    _this.name = 'ReactScrewError';
    _this.code = options.code;
    _this.status = options.status;
    _this.description = options.description;
    _this.details = options.details;
    _this.cause = options.cause;
    _this.retryable = options.retryable;
    _this.uiHint = options.uiHint;
    return _this;
  }
  _inherits(ReactScrewError, _Error);
  return _createClass(ReactScrewError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var readResponseShape = function readResponseShape(error) {
  var _candidate$response;
  if (!error || _typeof(error) !== 'object') {
    return undefined;
  }
  var candidate = error;
  return (_candidate$response = candidate.response) !== null && _candidate$response !== void 0 ? _candidate$response : candidate.status || candidate.data ? candidate : undefined;
};
var inferRetryable = function inferRetryable(status) {
  if (status === undefined) {
    return undefined;
  }
  return status === 408 || status === 429 || status >= 500;
};
var findDocumentedError = function findDocumentedError(documentedErrors, status, code) {
  if (!documentedErrors || documentedErrors.length === 0) {
    return undefined;
  }
  return documentedErrors.find(function (documentedError) {
    var statusMatches = documentedError.status === undefined || documentedError.status === 'default' || String(status) === documentedError.status;
    var codeMatches = code ? documentedError.code === code : true;
    return statusMatches && codeMatches;
  });
};
var normalizeError = exports.normalizeError = function normalizeError(error, message, documentedErrors) {
  var _documentedError$retr2;
  if (error instanceof ReactScrewError) {
    return error;
  }
  var response = readResponseShape(error);
  var payload = response !== null && response !== void 0 && response.data && _typeof(response.data) === 'object' ? response.data : undefined;
  var payloadCode = typeof (payload === null || payload === void 0 ? void 0 : payload.code) === 'string' ? payload.code : undefined;
  var payloadMessage = typeof (payload === null || payload === void 0 ? void 0 : payload.message) === 'string' ? payload.message : undefined;
  var payloadDescription = typeof (payload === null || payload === void 0 ? void 0 : payload.description) === 'string' ? payload.description : undefined;
  var payloadUiHint = typeof (payload === null || payload === void 0 ? void 0 : payload.uiHint) === 'string' ? payload.uiHint : undefined;
  var payloadDetails = payload === null || payload === void 0 ? void 0 : payload.details;
  var documentedError = findDocumentedError(documentedErrors, response === null || response === void 0 ? void 0 : response.status, payloadCode);
  if (error instanceof Error) {
    var _documentedError$retr;
    return new ReactScrewError(payloadMessage || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.message) || error.message || message, {
      code: payloadCode || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.code) || 'REQUEST_FAILED',
      status: response === null || response === void 0 ? void 0 : response.status,
      description: payloadDescription || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.description),
      details: payloadDetails !== null && payloadDetails !== void 0 ? payloadDetails : response === null || response === void 0 ? void 0 : response.data,
      retryable: (_documentedError$retr = documentedError === null || documentedError === void 0 ? void 0 : documentedError.retryable) !== null && _documentedError$retr !== void 0 ? _documentedError$retr : inferRetryable(response === null || response === void 0 ? void 0 : response.status),
      uiHint: payloadUiHint || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.uiHint),
      cause: error
    });
  }
  return new ReactScrewError(payloadMessage || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.message) || message, {
    code: payloadCode || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.code) || 'REQUEST_FAILED',
    status: response === null || response === void 0 ? void 0 : response.status,
    description: payloadDescription || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.description),
    details: payloadDetails !== null && payloadDetails !== void 0 ? payloadDetails : response === null || response === void 0 ? void 0 : response.data,
    retryable: (_documentedError$retr2 = documentedError === null || documentedError === void 0 ? void 0 : documentedError.retryable) !== null && _documentedError$retr2 !== void 0 ? _documentedError$retr2 : inferRetryable(response === null || response === void 0 ? void 0 : response.status),
    uiHint: payloadUiHint || (documentedError === null || documentedError === void 0 ? void 0 : documentedError.uiHint),
    cause: error
  });
};