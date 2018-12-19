# express-load-routers

Load routers from specific folders for Express 4.x

- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [Router](#Router)
- [License](#license)

## Install

```
npm i express-load-routers
```

## Usage

```js
const path = require('path');
const express = require('express');
const loadRouters = require('express-load-routers');

const app = express();

app.use(loadRoutes('./routes'));
```

### Options

```js
loadRouters(directory, options);
```

option         |  type | default | decription
---------------|-------|---------|------------
exclude        | Array | ['_*']  | This array contain match patterns that will excludes.


### Router

ex) routes/sample.js (http://localhost/sample/)
```js
module.exports = router = require('express').Router();
router.get('/', (req, res, next)=>{
  res.send('OK');
});
```

ex) routes/camel/index.js (http://localhost/camel/)
ex) routes/one/two.js (http://localhost/one/two/three/)
```js
module.exports = router = require('express').Router();
router.get('/three', (req, res, next)=>{
  res.send('OK');
});
```

## License

MIT License.