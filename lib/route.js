"use strict";

let koa_router = require("koa-router")
  , c = require("color-console")
  , sprintf = require('sprintf')
  , reserved = [
    "subdomain"
  ]
  , methods = [
    "HEAD",
    "OPTIONS",
    "GET",
    "PUT",
    "PATCH",
    "POST",
    "DELETE"
  ]
  // Check if exists array key in array
  , contains = function(arr, needle) {
    for (var i in arr) {
      for (var j in needle) {
        if (arr[i].toLowerCase() === needle[j].toLowerCase()) return true;
      }
    }

    return false;
  }
  // Get the controller file
  , controller = function(controller, path) {
    let ctrl = controller.split("#")[0]
      , action = controller.split("#")[1];

    path = path || "";

    let _ctrl = require(path + ctrl + "Controller");

    if (_ctrl) {
      return _ctrl[action];
    } else {
      return null;
    }
  }
  // Set the route
  , set = function(router, path, route, options) {
    let verbs = Object.keys(route);

    for (var i in verbs) {
      let verb = verbs[i].toLowerCase()
        , ctrl = controller(route[verb], options.path);

      if (!ctrl) {
        c.red([
          "[" + verb.toUpperCase() + "]",
          route[verb]
        ].join(" "));
      } else {
        router[verb](path, ctrl);
        router._routes.push(sprintf("%-13s %-40s " +  route[verb], verb.toUpperCase(), path));
      }
    }
  };

module.exports = function(routes, options) {
  options = options || {};

  let router = koa_router();
  router._routes = [];

  // Index is the only property that is accepted as string
  if (routes.index) set(router, "/", { all: routes.index }, options);

  for (let namespace in routes) {
    let route = routes[namespace];

    // Only process objects
    if ("object" !== typeof route || reserved.indexOf(namespace) > -1) continue;

    let keys = Object.keys(route);

    // Check if is a simple route
    if (contains(keys, methods)) {
      // for (let i in route) {
      //   if (i === "subdomain") continue;
        set(router, "/" + namespace, route, options);
      // }
    }
    // CHeck if is an array
    else if (route instanceof Array) {
      for (let i in route) {
        set(router, "/" + namespace, route[i], options);
      } 
    }
    // Then must be a route
    else {
      for (let i in route) {
        if (i === "subdomain") continue;
        if (route[i].constructor === Array) {
          for (let j in route[i]) {
            set(router, "/" + namespace + (i !== "index" ? "/" + i : ""), route[i][j], options);
          } 
        } else {
          set(router, "/" + namespace + (i !== "index" ? "/" + i : ""), route[i], options);
        }
      } 
    }
  }

  return router;
};