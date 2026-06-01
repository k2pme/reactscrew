"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeQueryKey = exports.normalizeMatchInput = exports.keyStartsWith = exports.DEFAULT_STALE_TIME = exports.DEFAULT_CACHE_TIME = void 0;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var DEFAULT_STALE_TIME = exports.DEFAULT_STALE_TIME = 0;
var DEFAULT_CACHE_TIME = exports.DEFAULT_CACHE_TIME = 5 * 60 * 1000;
var _stableSerializeValue = function stableSerializeValue(value) {
  if (Array.isArray(value)) {
    return "[".concat(value.map(_stableSerializeValue).join(','), "]");
  }
  if (value && _typeof(value) === 'object') {
    var entries = Object.entries(value).sort(function (_ref, _ref2) {
      var _ref3 = _slicedToArray(_ref, 1),
        left = _ref3[0];
      var _ref4 = _slicedToArray(_ref2, 1),
        right = _ref4[0];
      return left.localeCompare(right);
    }).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        key = _ref6[0],
        nestedValue = _ref6[1];
      return "".concat(JSON.stringify(key), ":").concat(_stableSerializeValue(nestedValue));
    });
    return "{".concat(entries.join(','), "}");
  }
  return JSON.stringify(value);
};
var serializeQueryKey = exports.serializeQueryKey = function serializeQueryKey(queryKey) {
  return queryKey.map(_stableSerializeValue).join('|');
};
var keyStartsWith = exports.keyStartsWith = function keyStartsWith(queryKey, prefix) {
  if (prefix.length > queryKey.length) {
    return false;
  }
  return prefix.every(function (item, index) {
    return _stableSerializeValue(item) === _stableSerializeValue(queryKey[index]);
  });
};
var normalizeMatchInput = exports.normalizeMatchInput = function normalizeMatchInput(input) {
  if (!input) {
    return undefined;
  }
  if (Array.isArray(input)) {
    return {
      queryKey: input
    };
  }
  return input;
};