"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateValueAgainstSchema = exports.createSchemaValidator = exports.createParameterSchema = void 0;
var _errors = require("../errors");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var isPlainObject = function isPlainObject(value) {
  return _typeof(value) === 'object' && value !== null && !Array.isArray(value);
};
var readRefName = function readRefName(schema) {
  var ref = schema === null || schema === void 0 ? void 0 : schema.$ref;
  if (!ref) {
    return undefined;
  }
  var parts = ref.split('/');
  return parts[parts.length - 1];
};
var validateEnum = function validateEnum(value, schema, context) {
  if (schema["enum"] && !schema["enum"].includes(value)) {
    throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
      code: 'SCHEMA_VALIDATION_FAILED',
      description: "Expected one of ".concat(schema["enum"].map(function (item) {
        return JSON.stringify(item);
      }).join(', '), "."),
      details: {
        context: context,
        expected: schema["enum"],
        received: value
      }
    });
  }
};
var _validateValueAgainstSchema = exports.validateValueAgainstSchema = function validateValueAgainstSchema(value, schema) {
  var _schema$oneOf, _schema$anyOf, _schema$allOf;
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'value';
  if (!schema) {
    return value;
  }
  var refName = readRefName(schema);
  if (refName) {
    return value;
  }
  validateEnum(value, schema, context);
  if ((_schema$oneOf = schema.oneOf) !== null && _schema$oneOf !== void 0 && _schema$oneOf.length) {
    var passes = schema.oneOf.some(function (item) {
      try {
        _validateValueAgainstSchema(value, item, context);
        return true;
      } catch (_unused) {
        return false;
      }
    });
    if (!passes) {
      throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
        code: 'SCHEMA_VALIDATION_FAILED',
        description: "Value does not match any allowed schema for ".concat(context, "."),
        details: {
          context: context,
          received: value
        }
      });
    }
    return value;
  }
  if ((_schema$anyOf = schema.anyOf) !== null && _schema$anyOf !== void 0 && _schema$anyOf.length) {
    var _passes = schema.anyOf.some(function (item) {
      try {
        _validateValueAgainstSchema(value, item, context);
        return true;
      } catch (_unused2) {
        return false;
      }
    });
    if (!_passes) {
      throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
        code: 'SCHEMA_VALIDATION_FAILED',
        description: "Value does not match any variant for ".concat(context, "."),
        details: {
          context: context,
          received: value
        }
      });
    }
    return value;
  }
  if ((_schema$allOf = schema.allOf) !== null && _schema$allOf !== void 0 && _schema$allOf.length) {
    schema.allOf.forEach(function (item) {
      _validateValueAgainstSchema(value, item, context);
    });
    return value;
  }
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: "Expected string for ".concat(context, "."),
          details: {
            context: context,
            received: value
          }
        });
      }
      return value;
    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: "Expected integer for ".concat(context, "."),
          details: {
            context: context,
            received: value
          }
        });
      }
      return value;
    case 'number':
      if (typeof value !== 'number') {
        throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: "Expected number for ".concat(context, "."),
          details: {
            context: context,
            received: value
          }
        });
      }
      return value;
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: "Expected boolean for ".concat(context, "."),
          details: {
            context: context,
            received: value
          }
        });
      }
      return value;
    case 'array':
      if (!Array.isArray(value)) {
        throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: "Expected array for ".concat(context, "."),
          details: {
            context: context,
            received: value
          }
        });
      }
      value.forEach(function (item, index) {
        _validateValueAgainstSchema(item, schema.items, "".concat(context, "[").concat(index, "]"));
      });
      return value;
    case 'object':
      {
        var _schema$required, _schema$properties;
        if (!isPlainObject(value)) {
          throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
            code: 'SCHEMA_VALIDATION_FAILED',
            description: "Expected object for ".concat(context, "."),
            details: {
              context: context,
              received: value
            }
          });
        }
        var required = new Set((_schema$required = schema.required) !== null && _schema$required !== void 0 ? _schema$required : []);
        required.forEach(function (key) {
          if (!(key in value)) {
            throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
              code: 'SCHEMA_VALIDATION_FAILED',
              description: "Missing required field \"".concat(key, "\" in ").concat(context, "."),
              details: {
                context: context,
                missing: key,
                received: value
              }
            });
          }
        });
        Object.entries((_schema$properties = schema.properties) !== null && _schema$properties !== void 0 ? _schema$properties : {}).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            propertySchema = _ref2[1];
          if (key in value) {
            _validateValueAgainstSchema(value[key], propertySchema, "".concat(context, ".").concat(key));
          }
        });
        if (schema.additionalProperties === false) {
          var _schema$properties2;
          var allowed = new Set(Object.keys((_schema$properties2 = schema.properties) !== null && _schema$properties2 !== void 0 ? _schema$properties2 : {}));
          Object.keys(value).forEach(function (key) {
            if (!allowed.has(key)) {
              throw new _errors.ReactScrewError("Validation failed for ".concat(context, "."), {
                code: 'SCHEMA_VALIDATION_FAILED',
                description: "Unexpected field \"".concat(key, "\" in ").concat(context, "."),
                details: {
                  context: context,
                  field: key,
                  received: value
                }
              });
            }
          });
        }
        if (schema.additionalProperties && _typeof(schema.additionalProperties) === 'object') {
          var additionalPropertiesSchema = schema.additionalProperties;
          Object.entries(value).forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              itemValue = _ref4[1];
            if (!(schema.properties && key in schema.properties)) {
              _validateValueAgainstSchema(itemValue, additionalPropertiesSchema, "".concat(context, ".").concat(key));
            }
          });
        }
        return value;
      }
    default:
      return value;
  }
};
var createSchemaValidator = exports.createSchemaValidator = function createSchemaValidator(schema) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';
  return function (value) {
    return _validateValueAgainstSchema(value, schema, context);
  };
};
var createParameterSchema = exports.createParameterSchema = function createParameterSchema(parameters) {
  return {
    type: 'object',
    required: parameters.filter(function (parameter) {
      return parameter.required;
    }).map(function (parameter) {
      return parameter.name;
    }),
    properties: Object.fromEntries(parameters.map(function (parameter) {
      var _parameter$schema;
      return [parameter.name, (_parameter$schema = parameter.schema) !== null && _parameter$schema !== void 0 ? _parameter$schema : {
        type: 'string'
      }];
    })),
    additionalProperties: false
  };
};