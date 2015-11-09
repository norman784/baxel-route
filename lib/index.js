"use strict";

let chalk = require("chalk")
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
    "DELETE",
    "SOCKET"
  ];

// Return formated url

let url = function() {
  let args = [];

  for (let i in arguments) {
    if (arguments[i] === "index" || arguments[i] === "root") continue;
    args.push(arguments[i]);
  }

  let str = args.join("/");

  return str[0] === "/" ? str : "/" + str;
}

// Apply middlewares to route

let apply = function(fn, url, route) {
  console.log(chalk.red(url, JSON.stringify(route)));
}

// Digest route

let digest = function (route, path) {
  path = path || "/";

  let data = [];

  if (!route) return data;
  else if (route.constructor === String) {
    data.push({
      verb: "ALL",
      url: url(path),
      controller: route
    });
  } else if (route.constructor === Array) {
    for (let i in route) {
      data = data.concat(digest(route[i], path));
    }
  } else if (route.constructor === Object) {
    for (let i in route) {
      if (methods.indexOf(i.toUpperCase()) > -1) {
        data.push({
          verb: i.toUpperCase(),
          url: url(path),
          controller: route[i]
        });
      } else {
        data = data.concat(digest(route[i], url(path, i)));
      }
    }
  }

  return data;
}

// Loop over routes

let explore = function (routes) {
  let data = [];

  for (let namespace in routes) {
    if (reserved.indexOf(namespace) > -1) continue;
    data = data.concat(digest(routes[namespace], namespace));
  }

  return data;
}

module.exports = explore;