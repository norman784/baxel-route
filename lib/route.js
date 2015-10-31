"use strict";

let koa_router = require("koa-router")
  , c = require("color-console")
  , sprintf = require('sprintf')
  , helper_path = null
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
    let ctrl = controller.split("#")[0];

    path = path || "";

    let _ctrl = require(path + ctrl + "Controller");

    if (_ctrl) {
      return _ctrl;
    } else {
      return null;
    }
  }
  // Set the route
  , set = function(router, path, route, options) {
    let verbs = Object.keys(route);

    for (var i in verbs) {
      let verb = verbs[i].toLowerCase()
        , ctrl = controller(route[verb], options.controller_path)
        , action = route[verb].split("#")[1];

      if (!ctrl) {
        c.red([
          "[" + verb.toUpperCase() + "]",
          route[verb]
        ].join(" "));
      } else {
        let middleware = null;

        if (ctrl.before_action) {
          if (ctrl.before_action.except) {
            let except = ctrl.before_action.except;
            if (except.constructor === String && except !== action) {
              middleware = ctrl.before_action.helper;
            } else if (except.constructor === Array && except.indexOf(action) === -1) {
              middleware = ctrl.before_action.helper;
            }
          } else if (ctrl.before_action.only) {
            let only = ctrl.before_action.only;
            if (only.constructor === String && only === action) {
              middleware = ctrl.before_action.helper;
            } else if (only.constructor === Array && only.indexOf(action) > -1) {
              middleware = ctrl.before_action.helper;
            }
          } else {
            middleware = ctrl.before_action.helper;
          }
        }

        let add = true;

        if (middleware) {
          let m = require(options.helper_path + "/" + middleware);
          if (m.constructor.name === "GeneratorFunction") {
            router[verb](path, m, ctrl[action]);
          } else {
            c.red("\t\t\t'" + middleware + "' should be a generator function if is intended to use as middleware");
          }
        } else {
          router[verb](path, ctrl[action]);
        }

        if (add) {
          let s = sprintf("%-13s %-40s %s %s", verb.toUpperCase(), path, route[verb], middleware ? ">> " + middleware : "");
          router._routes.push(s);
        }
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
        else if (i === "resource") {
          set(router, "/" + namespace + "/", { "get" : route[i] + "#index" }, options);
          set(router, "/" + namespace + "/new", { 
            "get" : route[i] + "#form",
            "post" : route[i] + "#save",
          },   options);
          set(router, "/" + namespace + "/:id/edit", { 
            "get" : route[i] + "#form",
            "post" : route[i] + "#save",
          },   options);
          set(router, "/" + namespace + "/:id", { 
            "get" : route[i] + "#show",
            "post" : route[i] + "#destroy",
          },   options);
        } else if (route[i].constructor === Array) {
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