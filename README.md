# kue-common

[![Build Status](https://travis-ci.org/lykmapipo/kue-common.svg?branch=master)](https://travis-ci.org/lykmapipo/kue-common)
[![Dependencies Status](https://david-dm.org/lykmapipo/kue-common.svg)](https://david-dm.org/lykmapipo/kue-common)
[![Coverage Status](https://coveralls.io/repos/github/lykmapipo/kue-common/badge.svg?branch=master)](https://coveralls.io/github/lykmapipo/kue-common?branch=master)
[![GitHub License](https://img.shields.io/github/license/lykmapipo/kue-common)](https://github.com/lykmapipo/kue-common/blob/master/LICENSE) 

[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![npm version](https://img.shields.io/npm/v/@lykmapipo/kue-common)](https://www.npmjs.com/package/@lykmapipo/kue-common)

Re-usable helpers for [kue](https://github.com/Automattic/kue).


## Requirements

- [NodeJS v12+](https://nodejs.org)
- [npm v6+](https://www.npmjs.com/)

## Installation

```sh
npm install --save @lykmapipo/kue-common
```

## Usage

- Job Definition in `jobs/email.js`
```js
exports.type = 'email';
exports.process = (job, done) => done(null, { success: true });
```

- Main Process e.g in `index.js`
```js
const { dispatch } = require('@lykmapipo/kue-common');
dispatch({ type: 'email', data: { to: 'l@j.z' } });
```

- Worker Process(s) in `worker.js`
```js
const { start } = require('@lykmapipo/kue-common');
start();
```

- Environment Variables in `.env`
```js
KUE_TIMEOUT=5000
KUE_CONCURRENCY=10
KUE_MAX_ATTEMPTS=3
KUE_PRIORITY=normal
KUE_JOB_EVENTS=false
KUE_JOBS_PATH=`${process.cwd()}/jobs`
KUE_REMOVE_ON_COMPLETE=true
KUE_REDIS_URL=redis://127.0.0.1:3000
KUE_HTTP_PORT=5000
KUE_HTTP_USERNAME=kue
KUE_HTTP_PASSWORD=kue
REDIS_URL=redis://127.0.0.1:3000
```

- Start Main Process
```js
$ node index.js
```

- Start Worker Process
```js
$ node worker.js
```

- Heroku Procfile
```js
web: NODE_ENV=production node index.js
worker: NODE_ENV=production node worker.js

```

## Test

- Clone this repository

- Install all dependencies

```sh
npm install
```

- Then run test

```sh
npm test
```

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence

The MIT License (MIT)

Copyright (c) lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
