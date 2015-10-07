Baxel Route
---

Routes for [Baxel](http://github.com/norman784/baxel)

Installation
---

```
npm install --save baxel-route
```

Usage
---

Prepare root routes

```javascript
var route = require('baxel-route')
  // Returns a koa-router instance
  , router = route({
    // Root
    root: 'home#index',
    // namespace example
    example: {
      index: { get: 'example#index' },
      search: { get: 'example#search' },
    }
  });
```

Prepare subdomain routes, subdomain are used by [baxel](http://github.com/norman784/baxel) and its used with [vhost](https://github.com/Treri/koa-vhost)

```javascript
var route = require('baxel-route')
  // Returns a koa-router instance
  , router = route({
    subdomain: ['subdomain', 'subdomain-dev'],
    // Root
    root: 'subdomain#index',
  });
```

Limitations
---

Doesn't support nested namespaces ATM

License
---

MIT
