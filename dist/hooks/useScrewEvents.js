"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrewEvents = void 0;
var _react = require("react");
var _useScrewClient = require("./useScrewClient");
var useScrewEvents = exports.useScrewEvents = function useScrewEvents(listener) {
  var client = (0, _useScrewClient.useScrewClient)();
  (0, _react.useEffect)(function () {
    return client.subscribeEvents(listener);
  }, [client, listener]);
};