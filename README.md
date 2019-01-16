# kue-common(WIP)

[![Build module-starter](https://travis-ci.org/lykmapipo/kue-common.svg?branch=master)](https://travis-ci.org/lykmapipo/kue-common)
[![Dependencies module-starter](https://david-dm.org/lykmapipo/kue-common.svg?style=flat-square)](https://david-dm.org/lykmapipo/kue-common)

Re-usable helpers for [kue](https://github.com/Automattic/kue).


## Requirements

- [NodeJS v8.11.1+](https://nodejs.org)
- [npm v5.6.0+](https://www.npmjs.com/)

## Installation

```sh
npm install --save @lykmapipo/kue-common
```

## Usage

```js

```

### Environment
If below options are available in `process.env` will be used as default.
```js
process.env.REDIS_URL
process.env.KUE_REDIS_URL
process.env.KUE_CONCURRENCY
process.env.KUE_MAX_ATTEMPTS
process.env.KUE_PRIORITY
process.env.KUE_REMOVE_ON_COMPLETE
process.env.KUE_TIMEOUT
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

Copyright (c) 2018 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
