"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postScrew = void 0;
// src/services/screws/post.js
var postScrew = exports.postScrew = {
  name: 'post',
  executeOnLaunch: true,
  persistence: false,
  type: 'list',
  methods: {
    init: {
      route: '/posts',
      httpMethod: 'GET',
      returnType: 'list'
    },
    getById: {
      route: function route(id) {
        return "/posts/".concat(id);
      },
      httpMethod: 'GET',
      returnType: 'object'
    },
    create: {
      route: '/posts',
      httpMethod: 'POST',
      returnType: 'object',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    update: {
      route: function route(id) {
        return "/posts/".concat(id);
      },
      httpMethod: 'PUT',
      returnType: 'object',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    remove: {
      route: function route(id) {
        return "/posts/".concat(id);
      },
      httpMethod: 'DELETE',
      returnType: 'object'
    }
  }
};