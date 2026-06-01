"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrewDevtools = void 0;
var _react = require("react");
var _useScrewClient = require("./useScrewClient");
var useScrewDevtools = exports.useScrewDevtools = function useScrewDevtools() {
  var client = (0, _useScrewClient.useScrewClient)();
  (0, _react.useSyncExternalStore)(function (listener) {
    return client.subscribeEvents(listener);
  }, function () {
    return client.getEvents().length;
  }, function () {
    return client.getEvents().length;
  });
  return {
    queries: client.getQuerySnapshots(),
    mutations: client.getMutationSnapshots(),
    metrics: client.getMetrics(),
    events: client.getEvents()
  };
};