"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateOpenApiContract = exports.parseOpenApiDocument = exports.loadOpenApiContract = exports.generateScrewsFromOpenApiFile = exports.generateScrewsFromOpenApiDocument = exports.generateScrewsFromOpenApiContract = exports.generateOpenApiArtifactsFromFile = exports.generateOpenApiArtifactsFromDocument = exports.generateOpenApiArtifacts = void 0;
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodePath = _interopRequireDefault(require("node:path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
var unique = function unique(values) {
  return values.filter(function (value, index, array) {
    return array.indexOf(value) === index;
  });
};
var sanitizeName = function sanitizeName(value) {
  return value.replace(/[^a-zA-Z0-9]+(.)/g, function (_, group) {
    return group.toUpperCase();
  }).replace(/^[A-Z]/, function (match) {
    return match.toLowerCase();
  });
};
var pascalCase = function pascalCase(value) {
  var normalized = sanitizeName(value);
  return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : 'Unnamed';
};
var quote = function quote(value) {
  return JSON.stringify(value);
};
var schemaLiteral = function schemaLiteral(schema) {
  return schema ? JSON.stringify(schema, null, 2) : 'undefined';
};
var refNameFromSchema = function refNameFromSchema(schema) {
  if (!(schema !== null && schema !== void 0 && schema.$ref)) {
    return null;
  }
  var parts = schema.$ref.split('/');
  return parts[parts.length - 1] || null;
};
var makeOperationName = function makeOperationName(method, route, operation) {
  if (operation !== null && operation !== void 0 && operation.operationId) {
    return sanitizeName(operation.operationId);
  }
  var normalizedRoute = route.replace(/[{}]/g, '').split('/').filter(Boolean).map(function (part) {
    return sanitizeName(part);
  }).join('');
  return sanitizeName("".concat(method).concat(normalizedRoute || 'root'));
};
var inferScrewName = function inferScrewName(route) {
  var _route$split$filter = route.split('/').filter(Boolean),
    _route$split$filter2 = _slicedToArray(_route$split$filter, 1),
    firstSegment = _route$split$filter2[0];
  return sanitizeName(firstSegment || 'default');
};
var parseResponseContract = function parseResponseContract(status, response) {
  var _response$content, _response$content2;
  var contentTypes = Object.keys((_response$content = response.content) !== null && _response$content !== void 0 ? _response$content : {});
  var firstContentType = contentTypes[0];
  return {
    status: status,
    description: response.description,
    contentTypes: contentTypes,
    schema: firstContentType ? (_response$content2 = response.content) === null || _response$content2 === void 0 || (_response$content2 = _response$content2[firstContentType]) === null || _response$content2 === void 0 ? void 0 : _response$content2.schema : undefined
  };
};
var parseRequestBodyContract = function parseRequestBodyContract(requestBody) {
  var _requestBody$content, _requestBody$required, _requestBody$content2;
  var contentTypes = Object.keys((_requestBody$content = requestBody.content) !== null && _requestBody$content !== void 0 ? _requestBody$content : {});
  var firstContentType = contentTypes[0];
  return {
    required: (_requestBody$required = requestBody.required) !== null && _requestBody$required !== void 0 ? _requestBody$required : false,
    description: requestBody.description,
    contentTypes: contentTypes,
    schema: firstContentType ? (_requestBody$content2 = requestBody.content) === null || _requestBody$content2 === void 0 || (_requestBody$content2 = _requestBody$content2[firstContentType]) === null || _requestBody$content2 === void 0 ? void 0 : _requestBody$content2.schema : undefined
  };
};
var isErrorStatus = function isErrorStatus(status) {
  if (status === 'default') {
    return true;
  }
  var parsed = Number(status);
  return Number.isFinite(parsed) && parsed >= 400;
};
var parseOperations = function parseOperations(document) {
  var _document$paths;
  var paths = (_document$paths = document.paths) !== null && _document$paths !== void 0 ? _document$paths : {};
  return Object.entries(paths).flatMap(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      route = _ref2[0],
      pathItem = _ref2[1];
    return HTTP_METHODS.flatMap(function (method) {
      var _pathItem$parameters, _operation$parameters, _operation$responses;
      var operation = pathItem[method];
      if (!operation) {
        return [];
      }
      var parameters = [].concat(_toConsumableArray((_pathItem$parameters = pathItem.parameters) !== null && _pathItem$parameters !== void 0 ? _pathItem$parameters : []), _toConsumableArray((_operation$parameters = operation.parameters) !== null && _operation$parameters !== void 0 ? _operation$parameters : []));
      var responses = (_operation$responses = operation.responses) !== null && _operation$responses !== void 0 ? _operation$responses : {};
      var parsedResponses = Object.entries(responses).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          status = _ref4[0],
          response = _ref4[1];
        return parseResponseContract(status, response);
      });
      return [{
        screwName: inferScrewName(route),
        methodName: makeOperationName(method, route, operation),
        httpMethod: method.toUpperCase(),
        route: route,
        summary: operation.summary,
        description: operation.description,
        parameters: parameters,
        requestBody: operation.requestBody ? parseRequestBodyContract(operation.requestBody) : undefined,
        responses: responses,
        successResponses: parsedResponses.filter(function (response) {
          return !isErrorStatus(response.status);
        }),
        errorResponses: parsedResponses.filter(function (response) {
          return isErrorStatus(response.status);
        })
      }];
    });
  });
};
var parseSchemas = function parseSchemas(document) {
  var _document$components$, _document$components;
  return Object.entries((_document$components$ = (_document$components = document.components) === null || _document$components === void 0 ? void 0 : _document$components.schemas) !== null && _document$components$ !== void 0 ? _document$components$ : {}).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      name = _ref6[0],
      schema = _ref6[1];
    return {
      name: name,
      description: schema.description,
      schema: schema
    };
  });
};
var assertOpenApiDocument = function assertOpenApiDocument(document, source) {
  if (!document.paths || _typeof(document.paths) !== 'object') {
    throw new Error("Invalid OpenAPI document from \"".concat(source, "\": missing \"paths\"."));
  }
};
var readSourceAsText = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(source) {
    var response;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (!/^https?:\/\//.test(source)) {
            _context.n = 3;
            break;
          }
          _context.n = 1;
          return fetch(source);
        case 1:
          response = _context.v;
          if (response.ok) {
            _context.n = 2;
            break;
          }
          throw new Error("Failed to fetch OpenAPI document from \"".concat(source, "\" (").concat(response.status, ")."));
        case 2:
          return _context.a(2, response.text());
        case 3:
          return _context.a(2, _promises["default"].readFile(source, 'utf8'));
      }
    }, _callee);
  }));
  return function readSourceAsText(_x) {
    return _ref7.apply(this, arguments);
  };
}();
var groupOperationsByScrew = function groupOperationsByScrew(operations) {
  var groups = new Map();
  operations.forEach(function (operation) {
    var _groups$get;
    var current = (_groups$get = groups.get(operation.screwName)) !== null && _groups$get !== void 0 ? _groups$get : [];
    current.push(operation);
    groups.set(operation.screwName, current);
  });
  return groups;
};
var buildParamsShape = function buildParamsShape(parameters) {
  if (parameters.length === 0) {
    return {
      typeSource: 'Record<string, never>',
      hasMembers: false
    };
  }
  var lines = parameters.map(function (parameter) {
    var propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(parameter.name) ? parameter.name : quote(parameter.name);
    var optionalToken = parameter.required ? '' : '?';
    var propertyType = _schemaToTypeSource(parameter.schema);
    return "".concat(propertyName).concat(optionalToken, ": ").concat(propertyType, ";");
  });
  return {
    hasMembers: true,
    typeSource: "{\n".concat(lines.map(function (line) {
      return "  ".concat(line);
    }).join('\n'), "\n}")
  };
};
var _schemaToTypeSource = function schemaToTypeSource(schema) {
  if (!schema) {
    return 'unknown';
  }
  var refName = refNameFromSchema(schema);
  if (refName) {
    return pascalCase(refName);
  }
  if (schema["enum"] && schema["enum"].length > 0) {
    return schema["enum"].map(function (value) {
      return JSON.stringify(value);
    }).join(' | ');
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return schema.oneOf.map(function (item) {
      return _schemaToTypeSource(item);
    }).join(' | ');
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return schema.anyOf.map(function (item) {
      return _schemaToTypeSource(item);
    }).join(' | ');
  }
  if (schema.allOf && schema.allOf.length > 0) {
    return schema.allOf.map(function (item) {
      return _schemaToTypeSource(item);
    }).join(' & ');
  }
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return "Array<".concat(_schemaToTypeSource(schema.items), ">");
    case 'object':
      {
        var _schema$properties, _schema$required;
        var properties = Object.entries((_schema$properties = schema.properties) !== null && _schema$properties !== void 0 ? _schema$properties : {});
        var required = new Set((_schema$required = schema.required) !== null && _schema$required !== void 0 ? _schema$required : []);
        if (properties.length === 0) {
          if (schema.additionalProperties && _typeof(schema.additionalProperties) === 'object') {
            return "Record<string, ".concat(_schemaToTypeSource(schema.additionalProperties), ">");
          }
          return 'Record<string, unknown>';
        }
        var renderedProperties = properties.map(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 2),
            name = _ref9[0],
            propertySchema = _ref9[1];
          var propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : quote(name);
          var optionalToken = required.has(name) ? '' : '?';
          return "  ".concat(propertyName).concat(optionalToken, ": ").concat(_schemaToTypeSource(propertySchema), ";");
        });
        if (schema.additionalProperties && _typeof(schema.additionalProperties) === 'object') {
          renderedProperties.push("  [key: string]: ".concat(_schemaToTypeSource(schema.additionalProperties), ";"));
        }
        return "{\n".concat(renderedProperties.join('\n'), "\n}");
      }
    default:
      return 'unknown';
  }
};
var makeOperationTypeNames = function makeOperationTypeNames(operation) {
  var baseName = pascalCase(operation.methodName);
  return {
    params: "".concat(baseName, "Params"),
    body: "".concat(baseName, "Body"),
    response: "".concat(baseName, "Response"),
    error: "".concat(baseName, "Error"),
    hook: "".concat(baseName).concat(operation.httpMethod === 'GET' ? 'Query' : 'Mutation')
  };
};
var buildParameterSchema = function buildParameterSchema(operation) {
  return {
    type: 'object',
    required: operation.parameters.filter(function (parameter) {
      return parameter.required;
    }).map(function (parameter) {
      return parameter.name;
    }),
    properties: Object.fromEntries(operation.parameters.map(function (parameter) {
      var _parameter$schema;
      return [parameter.name, (_parameter$schema = parameter.schema) !== null && _parameter$schema !== void 0 ? _parameter$schema : {
        type: 'string'
      }];
    })),
    additionalProperties: false
  };
};
var makeDocumentedErrorCode = function makeDocumentedErrorCode(operation, status) {
  return "".concat(pascalCase(operation.methodName).toUpperCase(), "_").concat(status === 'default' ? 'DEFAULT' : status);
};
var inferUiHint = function inferUiHint(status) {
  if (status === '401') {
    return 'auth';
  }
  if (status === '403') {
    return 'forbidden';
  }
  if (status === '404') {
    return 'not-found';
  }
  if (status === '409' || status === '422') {
    return 'form';
  }
  if (status === '429') {
    return 'rate-limit';
  }
  var numericStatus = Number(status);
  if (Number.isFinite(numericStatus) && numericStatus >= 500) {
    return 'retry';
  }
  return 'error';
};
var isRetryableStatus = function isRetryableStatus(status) {
  var numericStatus = Number(status);
  return status === 'default' || numericStatus === 408 || numericStatus === 429 || numericStatus >= 500;
};
var getPrimarySuccessSchema = function getPrimarySuccessSchema(operation) {
  var _operation$successRes;
  return (_operation$successRes = operation.successResponses[0]) === null || _operation$successRes === void 0 ? void 0 : _operation$successRes.schema;
};
var renderSchemaExport = function renderSchemaExport(schema) {
  var typeName = pascalCase(schema.name);
  var descriptionLine = schema.description ? "/** ".concat(schema.description, " */\n") : '';
  return "".concat(descriptionLine, "export type ").concat(typeName, " = ").concat(_schemaToTypeSource(schema.schema), ";\n");
};
var _resolveSchemaReferences = function resolveSchemaReferences(schema, contract) {
  var _schema$allOf, _schema$oneOf, _schema$anyOf, _resolveSchemaReferen5;
  var visitedRefs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
  if (!schema) {
    return undefined;
  }
  var refName = refNameFromSchema(schema);
  if (refName) {
    var _contract$schemas$fin;
    if (visitedRefs.has(refName)) {
      return {};
    }
    var target = (_contract$schemas$fin = contract.schemas.find(function (item) {
      return item.name === refName;
    })) === null || _contract$schemas$fin === void 0 ? void 0 : _contract$schemas$fin.schema;
    if (!target) {
      return {};
    }
    var nextVisited = new Set(visitedRefs);
    nextVisited.add(refName);
    return _resolveSchemaReferences(target, contract, nextVisited);
  }
  return _objectSpread(_objectSpread({}, schema), {}, {
    properties: schema.properties ? Object.fromEntries(Object.entries(schema.properties).map(function (_ref0) {
      var _resolveSchemaReferen;
      var _ref1 = _slicedToArray(_ref0, 2),
        key = _ref1[0],
        value = _ref1[1];
      return [key, (_resolveSchemaReferen = _resolveSchemaReferences(value, contract, new Set(visitedRefs))) !== null && _resolveSchemaReferen !== void 0 ? _resolveSchemaReferen : {}];
    })) : undefined,
    items: _resolveSchemaReferences(schema.items, contract, new Set(visitedRefs)),
    allOf: (_schema$allOf = schema.allOf) === null || _schema$allOf === void 0 ? void 0 : _schema$allOf.map(function (item) {
      var _resolveSchemaReferen2;
      return (_resolveSchemaReferen2 = _resolveSchemaReferences(item, contract, new Set(visitedRefs))) !== null && _resolveSchemaReferen2 !== void 0 ? _resolveSchemaReferen2 : {};
    }),
    oneOf: (_schema$oneOf = schema.oneOf) === null || _schema$oneOf === void 0 ? void 0 : _schema$oneOf.map(function (item) {
      var _resolveSchemaReferen3;
      return (_resolveSchemaReferen3 = _resolveSchemaReferences(item, contract, new Set(visitedRefs))) !== null && _resolveSchemaReferen3 !== void 0 ? _resolveSchemaReferen3 : {};
    }),
    anyOf: (_schema$anyOf = schema.anyOf) === null || _schema$anyOf === void 0 ? void 0 : _schema$anyOf.map(function (item) {
      var _resolveSchemaReferen4;
      return (_resolveSchemaReferen4 = _resolveSchemaReferences(item, contract, new Set(visitedRefs))) !== null && _resolveSchemaReferen4 !== void 0 ? _resolveSchemaReferen4 : {};
    }),
    additionalProperties: schema.additionalProperties && _typeof(schema.additionalProperties) === 'object' ? (_resolveSchemaReferen5 = _resolveSchemaReferences(schema.additionalProperties, contract, new Set(visitedRefs))) !== null && _resolveSchemaReferen5 !== void 0 ? _resolveSchemaReferen5 : {} : schema.additionalProperties
  });
};
var renderOperationTypeExports = function renderOperationTypeExports(operation) {
  var _operation$requestBod;
  var names = makeOperationTypeNames(operation);
  var paramsShape = buildParamsShape(operation.parameters);
  var responseType = _schemaToTypeSource(getPrimarySuccessSchema(operation));
  var bodyType = _schemaToTypeSource((_operation$requestBod = operation.requestBody) === null || _operation$requestBod === void 0 ? void 0 : _operation$requestBod.schema);
  var errorMembers = operation.errorResponses.length > 0 ? operation.errorResponses.map(function (errorResponse) {
    var _errorResponse$descri;
    var errorSchema = _schemaToTypeSource(errorResponse.schema);
    return "  | {\n      status: ".concat(JSON.stringify(errorResponse.status), ";\n      code: ").concat(JSON.stringify(makeDocumentedErrorCode(operation, errorResponse.status)), ";\n      description?: ").concat(JSON.stringify((_errorResponse$descri = errorResponse.description) !== null && _errorResponse$descri !== void 0 ? _errorResponse$descri : ''), ";\n      retryable?: ").concat(JSON.stringify(isRetryableStatus(errorResponse.status)), ";\n      uiHint?: ").concat(JSON.stringify(inferUiHint(errorResponse.status)), ";\n      data?: ").concat(errorSchema, ";\n    }");
  }).join('\n') : '  | never';
  var lines = ["export type ".concat(names.params, " = ").concat(paramsShape.typeSource, ";"), "export type ".concat(names.response, " = ").concat(responseType, ";"), "export type ".concat(names.error, " ="), errorMembers.endsWith('never') ? '  never;' : "".concat(errorMembers, ";")];
  if (operation.requestBody) {
    lines.splice(1, 0, "export type ".concat(names.body, " = ").concat(bodyType, ";"));
  }
  return "".concat(lines.join('\n'), "\n");
};
var escapeTemplateLiteral = function escapeTemplateLiteral(value) {
  return value.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
};
var buildRouteExpression = function buildRouteExpression(operation, typeName) {
  var pathParameters = operation.parameters.filter(function (parameter) {
    return parameter["in"] === 'path';
  });
  var queryParameters = operation.parameters.filter(function (parameter) {
    return parameter["in"] === 'query';
  });
  if (pathParameters.length === 0 && queryParameters.length === 0) {
    return quote(operation.route);
  }
  var routeWithPath = operation.route.replace(/\{([^}]+)\}/g, function (_, name) {
    return "${encodeURIComponent(String(params.".concat(sanitizeName(name), "))}");
  });
  if (queryParameters.length === 0) {
    return "(params: ".concat(typeName, ") => `").concat(escapeTemplateLiteral(routeWithPath), "`");
  }
  var queryBuilder = queryParameters.map(function (parameter) {
    var property = sanitizeName(parameter.name);
    return "    if (params.".concat(property, " !== undefined) searchParams.set(").concat(quote(parameter.name), ", String(params.").concat(property, "));");
  }).join('\n');
  return ["(params: ".concat(typeName, ") => {"), "    const pathname = `".concat(escapeTemplateLiteral(routeWithPath), "`;"), '    const searchParams = new URLSearchParams();', queryBuilder, '    const queryString = searchParams.toString();', "    return queryString ? `${pathname}?${queryString}` : pathname;", '  }'].join('\n');
};
var renderOperationAsScrewMethod = function renderOperationAsScrewMethod(operation) {
  var typeNames = makeOperationTypeNames(operation);
  var lines = ["    ".concat(operation.methodName, ": {"), "      type: '".concat(operation.httpMethod === 'GET' ? 'query' : 'mutation', "',"), "      route: ".concat(buildRouteExpression(operation, typeNames.params), ","), "      httpMethod: '".concat(operation.httpMethod, "',")];
  if (operation.parameters.length > 0) {
    lines.push("      paramsValidator: validate".concat(pascalCase(operation.methodName), "ParamsArgs,"));
  }
  if (operation.requestBody) {
    lines.push("      bodyValidator: validate".concat(pascalCase(operation.methodName), "Body,"));
  }
  if (getPrimarySuccessSchema(operation)) {
    lines.push("      responseValidator: validate".concat(pascalCase(operation.methodName), "Response,"));
  }
  if (operation.errorResponses.length > 0) {
    lines.push("      documentedErrors: ".concat(pascalCase(operation.methodName), "Errors,"));
  }
  if (operation.httpMethod === 'GET') {
    lines.push("      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],");
  }
  if (operation.summary || operation.description) {
    var _ref10, _operation$summary;
    lines.push("      description: ".concat(JSON.stringify((_ref10 = (_operation$summary = operation.summary) !== null && _operation$summary !== void 0 ? _operation$summary : operation.description) !== null && _ref10 !== void 0 ? _ref10 : ''), ","));
  }
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  lines.push('    }');
  return lines.join('\n');
};
var renderScrewsFile = function renderScrewsFile(contract) {
  var groups = groupOperationsByScrew(contract.operations);
  var declarations = _toConsumableArray(groups.entries()).map(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
      screwName = _ref12[0],
      operations = _ref12[1];
    return "export const ".concat(screwName, "Screw = {\n  name: ").concat(quote(screwName), ",\n  methods: {\n").concat(operations.map(renderOperationAsScrewMethod).join(',\n'), "\n  }\n};");
  });
  var collection = "export const generatedScrews = {\n".concat(_toConsumableArray(groups.keys()).map(function (screwName) {
    return "  ".concat(screwName, ": ").concat(screwName, "Screw,");
  }).join('\n'), "\n};");
  return "import type { ScrewsMap } from 'reactscrew';\nimport type {\n".concat(unique(contract.operations.flatMap(function (operation) {
    var names = makeOperationTypeNames(operation);
    return [names.params];
  })).map(function (name) {
    return "  ".concat(name, ",");
  }).join('\n'), "\n} from '../types';\nimport {\n").concat(contract.operations.map(function (operation) {
    var baseName = pascalCase(operation.methodName);
    var imports = [];
    if (operation.parameters.length > 0) {
      imports.push("  validate".concat(baseName, "ParamsArgs,"));
    }
    if (operation.requestBody) {
      imports.push("  validate".concat(baseName, "Body,"));
    }
    if (getPrimarySuccessSchema(operation)) {
      imports.push("  validate".concat(baseName, "Response,"));
    }
    return imports.join('\n');
  }).filter(Boolean).join('\n'), "\n} from '../validators';\nimport {\n").concat(contract.operations.filter(function (operation) {
    return operation.errorResponses.length > 0;
  }).map(function (operation) {
    return "  ".concat(pascalCase(operation.methodName), "Errors,");
  }).join('\n'), "\n} from '../errors';\n\n").concat(declarations.join('\n\n'), "\n\n").concat(collection, "\n\nexport const screws = generatedScrews satisfies ScrewsMap;\n");
};
var renderHooksFile = function renderHooksFile(contract) {
  var lines = ["import { useScrewMutation, useScrewQuery } from 'reactscrew';", "import type { QueryObserverOptions, UseScrewMutationOptions } from 'reactscrew';", "import type {"];
  var typeImports = unique(contract.operations.flatMap(function (operation) {
    var names = makeOperationTypeNames(operation);
    if (operation.httpMethod === 'GET') {
      return [names.params, names.response];
    }
    return operation.requestBody ? [names.params, names.body, names.response] : [names.params, names.response];
  }));
  lines.push(typeImports.map(function (name) {
    return "  ".concat(name, ",");
  }).join('\n'));
  lines.push("} from '../types';\n");
  contract.operations.forEach(function (operation) {
    var names = makeOperationTypeNames(operation);
    var baseHookName = "use".concat(pascalCase(operation.methodName)).concat(operation.httpMethod === 'GET' ? 'Query' : 'Mutation');
    if (operation.httpMethod === 'GET') {
      lines.push("export const ".concat(baseHookName, " = (\n  params").concat(buildParamsShape(operation.parameters).hasMembers ? '' : '?', ": ").concat(names.params, ",\n  options?: Omit<QueryObserverOptions<[").concat(names.params, "], ").concat(names.response, ">, 'args'>\n) =>\n  useScrewQuery<").concat(names.response, ">(").concat(quote(operation.screwName), ", ").concat(quote(operation.methodName), ", {\n    ...options,\n    args: params === undefined ? [] : [params]\n  });\n"));
      return;
    }
    var mutationVariableType = operation.requestBody ? names.body : 'unknown';
    var hasParams = buildParamsShape(operation.parameters).hasMembers;
    lines.push("export const ".concat(baseHookName, " = (\n  options?: UseScrewMutationOptions<").concat(names.response, ", ").concat(mutationVariableType, ">\n) => {\n  const mutation = useScrewMutation<").concat(names.response, ", ").concat(mutationVariableType, ">(\n    ").concat(quote(operation.screwName), ",\n    ").concat(quote(operation.methodName), ",\n    options\n  );\n\n  return {\n    ...mutation,\n    mutate: (body").concat(hasParams ? ": ".concat(mutationVariableType, ", params?: ").concat(names.params) : "?: ".concat(mutationVariableType), ") =>\n      mutation.mutate(body").concat(hasParams ? ', params' : '', "),\n    mutateAsync: (body").concat(hasParams ? ": ".concat(mutationVariableType, ", params?: ").concat(names.params) : "?: ".concat(mutationVariableType), ") =>\n      mutation.mutateAsync(body").concat(hasParams ? ', params' : '', ")\n  };\n};\n"));
  });
  return "".concat(lines.join('\n'));
};
var renderErrorsFile = function renderErrorsFile(contract) {
  var lines = ["import type { DocumentedErrorDefinition } from 'reactscrew';", '', 'export const generatedErrorCatalog = {'];
  contract.operations.forEach(function (operation) {
    var names = makeOperationTypeNames(operation);
    lines.push("  ".concat(names.error.replace(/Error$/, ''), ": ["));
    operation.errorResponses.forEach(function (errorResponse) {
      var _errorResponse$descri2;
      lines.push("    { status: ".concat(quote(errorResponse.status), ", code: ").concat(quote(makeDocumentedErrorCode(operation, errorResponse.status)), ", description: ").concat(quote((_errorResponse$descri2 = errorResponse.description) !== null && _errorResponse$descri2 !== void 0 ? _errorResponse$descri2 : ''), ", retryable: ").concat(JSON.stringify(isRetryableStatus(errorResponse.status)), ", uiHint: ").concat(quote(inferUiHint(errorResponse.status)), " },"));
    });
    lines.push('  ],');
  });
  lines.push('} as const;');
  lines.push('');
  contract.operations.forEach(function (operation) {
    var names = makeOperationTypeNames(operation);
    var catalogName = "".concat(pascalCase(operation.methodName), "Errors");
    lines.push("export const ".concat(catalogName, ": DocumentedErrorDefinition[] = generatedErrorCatalog.").concat(names.error.replace(/Error$/, ''), " as unknown as DocumentedErrorDefinition[];"));
  });
  return "".concat(lines.join('\n'), "\n");
};
var renderValidatorsFile = function renderValidatorsFile(contract) {
  var lines = ["import { createSchemaValidator } from 'reactscrew';", "import type { RuntimeValidator } from 'reactscrew';", "import type {"];
  var typeImports = unique(contract.operations.flatMap(function (operation) {
    var names = makeOperationTypeNames(operation);
    var items = [names.params, names.response];
    if (operation.requestBody) {
      items.push(names.body);
    }
    return items;
  }));
  lines.push(typeImports.map(function (name) {
    return "  ".concat(name, ",");
  }).join('\n'));
  lines.push("} from '../types';\n");
  contract.operations.forEach(function (operation) {
    var baseName = pascalCase(operation.methodName);
    var typeNames = makeOperationTypeNames(operation);
    if (operation.parameters.length > 0) {
      lines.push("const ".concat(baseName, "ParamsSchema = ").concat(schemaLiteral(_resolveSchemaReferences(buildParameterSchema(operation), contract)), " as const;"));
      lines.push("const validate".concat(baseName, "Params = createSchemaValidator<").concat(typeNames.params, ">(").concat(baseName, "ParamsSchema, ").concat(quote("".concat(operation.methodName, " params")), ");"));
      lines.push("export const validate".concat(baseName, "ParamsArgs: RuntimeValidator<[").concat(typeNames.params, "]> = (args) => {\n  const [params] = args;\n  return [validate").concat(baseName, "Params((params ?? {}) as ").concat(typeNames.params, ")];\n};\n"));
    }
    if (operation.requestBody) {
      lines.push("const ".concat(baseName, "BodySchema = ").concat(schemaLiteral(_resolveSchemaReferences(operation.requestBody.schema, contract)), " as const;"));
      lines.push("export const validate".concat(baseName, "Body = createSchemaValidator<").concat(typeNames.body, ">(").concat(baseName, "BodySchema, ").concat(quote("".concat(operation.methodName, " body")), ");\n"));
    }
    if (getPrimarySuccessSchema(operation)) {
      lines.push("const ".concat(baseName, "ResponseSchema = ").concat(schemaLiteral(_resolveSchemaReferences(getPrimarySuccessSchema(operation), contract)), " as const;"));
      lines.push("export const validate".concat(baseName, "Response = createSchemaValidator<").concat(typeNames.response, ">(").concat(baseName, "ResponseSchema, ").concat(quote("".concat(operation.methodName, " response")), ");\n"));
    }
  });
  return "".concat(lines.join('\n'));
};
var renderTypesFile = function renderTypesFile(contract) {
  var schemaExports = contract.schemas.map(renderSchemaExport).join('\n');
  var operationExports = contract.operations.map(renderOperationTypeExports).join('\n');
  return "".concat(schemaExports, "\n").concat(operationExports);
};
var renderGeneratedIndexFile = function renderGeneratedIndexFile() {
  return "export * from './types';\nexport * from './errors';\nexport * from './validators';\nexport * from './screws';\nexport * from './hooks';\n";
};
var renderWrappersIndexFile = function renderWrappersIndexFile() {
  return "export * from '../generated';\n";
};
var renderCustomIndexFile = function renderCustomIndexFile() {
  return "// Add project-specific wrappers here. This file is preserved across regenerations.\n";
};
var renderRootIndexFile = function renderRootIndexFile() {
  return "export * from './generated';\nexport * from './wrappers';\n";
};
var buildArtifactMap = function buildArtifactMap(contract) {
  return {
    'generated/index.ts': renderGeneratedIndexFile(),
    'generated/types/index.ts': renderTypesFile(contract),
    'generated/errors/index.ts': renderErrorsFile(contract),
    'generated/validators/index.ts': renderValidatorsFile(contract),
    'generated/screws/index.ts': renderScrewsFile(contract),
    'generated/hooks/index.ts': renderHooksFile(contract),
    'wrappers/index.ts': renderWrappersIndexFile(),
    'custom/index.ts': renderCustomIndexFile(),
    'index.ts': renderRootIndexFile()
  };
};
var writeGeneratedArtifacts = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(outputDirectory, files) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return Promise.all(Object.entries(files).map(/*#__PURE__*/function () {
            var _ref15 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_ref14) {
              var _ref16, relativePath, content, targetPath, preserveCustomFile, _t;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.p = _context2.n) {
                  case 0:
                    _ref16 = _slicedToArray(_ref14, 2), relativePath = _ref16[0], content = _ref16[1];
                    targetPath = _nodePath["default"].join(outputDirectory, relativePath);
                    _context2.n = 1;
                    return _promises["default"].mkdir(_nodePath["default"].dirname(targetPath), {
                      recursive: true
                    });
                  case 1:
                    preserveCustomFile = relativePath.startsWith('custom/') || relativePath.startsWith('wrappers/');
                    if (!preserveCustomFile) {
                      _context2.n = 5;
                      break;
                    }
                    _context2.p = 2;
                    _context2.n = 3;
                    return _promises["default"].access(targetPath);
                  case 3:
                    return _context2.a(2);
                  case 4:
                    _context2.p = 4;
                    _t = _context2.v;
                  case 5:
                    _context2.n = 6;
                    return _promises["default"].writeFile(targetPath, content, 'utf8');
                  case 6:
                    return _context2.a(2);
                }
              }, _callee2, null, [[2, 4]]);
            }));
            return function (_x4) {
              return _ref15.apply(this, arguments);
            };
          }()));
        case 1:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return function writeGeneratedArtifacts(_x2, _x3) {
    return _ref13.apply(this, arguments);
  };
}();
var parseOpenApiDocument = exports.parseOpenApiDocument = function parseOpenApiDocument(document) {
  var _document$info, _document$info2, _document$info3;
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'inline-document';
  assertOpenApiDocument(document, source);
  return {
    source: source,
    title: (_document$info = document.info) === null || _document$info === void 0 ? void 0 : _document$info.title,
    version: (_document$info2 = document.info) === null || _document$info2 === void 0 ? void 0 : _document$info2.version,
    description: (_document$info3 = document.info) === null || _document$info3 === void 0 ? void 0 : _document$info3.description,
    schemas: parseSchemas(document),
    operations: parseOperations(document)
  };
};
var loadOpenApiContract = exports.loadOpenApiContract = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(source) {
    var content, document;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return readSourceAsText(source);
        case 1:
          content = _context4.v;
          document = JSON.parse(content);
          return _context4.a(2, parseOpenApiDocument(document, source));
      }
    }, _callee4);
  }));
  return function loadOpenApiContract(_x5) {
    return _ref17.apply(this, arguments);
  };
}();
var validateOpenApiContract = exports.validateOpenApiContract = function validateOpenApiContract(contract) {
  var errors = [];
  if (contract.operations.length === 0) {
    errors.push('No operations found in contract.');
  }
  contract.operations.forEach(function (operation) {
    if (!operation.route.startsWith('/')) {
      errors.push("Operation \"".concat(operation.methodName, "\" has a non-absolute route \"").concat(operation.route, "\"."));
    }
    if (operation.httpMethod === 'GET' && operation.requestBody) {
      errors.push("GET operation \"".concat(operation.methodName, "\" should not declare a request body."));
    }
  });
  return {
    valid: errors.length === 0,
    source: contract.source,
    operationCount: contract.operations.length,
    schemaCount: contract.schemas.length,
    errors: errors
  };
};
var generateScrewsFromOpenApiContract = exports.generateScrewsFromOpenApiContract = function generateScrewsFromOpenApiContract(contract) {
  return renderScrewsFile(contract);
};
var generateScrewsFromOpenApiDocument = exports.generateScrewsFromOpenApiDocument = function generateScrewsFromOpenApiDocument(document) {
  return generateScrewsFromOpenApiContract(parseOpenApiDocument(document));
};
var generateScrewsFromOpenApiFile = exports.generateScrewsFromOpenApiFile = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(inputPath, outputPath) {
    var contract, content;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _context5.n = 1;
          return loadOpenApiContract(inputPath);
        case 1:
          contract = _context5.v;
          content = generateScrewsFromOpenApiContract(contract);
          _context5.n = 2;
          return _promises["default"].mkdir(_nodePath["default"].dirname(outputPath), {
            recursive: true
          });
        case 2:
          _context5.n = 3;
          return _promises["default"].writeFile(outputPath, content, 'utf8');
        case 3:
          return _context5.a(2);
      }
    }, _callee5);
  }));
  return function generateScrewsFromOpenApiFile(_x6, _x7) {
    return _ref18.apply(this, arguments);
  };
}();
var generateOpenApiArtifacts = exports.generateOpenApiArtifacts = function generateOpenApiArtifacts(contract) {
  return {
    contract: contract,
    files: buildArtifactMap(contract)
  };
};
var generateOpenApiArtifactsFromDocument = exports.generateOpenApiArtifactsFromDocument = function generateOpenApiArtifactsFromDocument(document) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'inline-document';
  return generateOpenApiArtifacts(parseOpenApiDocument(document, source));
};
var generateOpenApiArtifactsFromFile = exports.generateOpenApiArtifactsFromFile = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(inputPath, outputDirectory) {
    var contract, artifacts;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          _context6.n = 1;
          return loadOpenApiContract(inputPath);
        case 1:
          contract = _context6.v;
          artifacts = generateOpenApiArtifacts(contract);
          _context6.n = 2;
          return writeGeneratedArtifacts(outputDirectory, artifacts.files);
        case 2:
          return _context6.a(2, artifacts);
      }
    }, _callee6);
  }));
  return function generateOpenApiArtifactsFromFile(_x8, _x9) {
    return _ref19.apply(this, arguments);
  };
}();