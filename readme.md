# npm-exec [![Build Status](https://travis-ci.org/legodude17/npm-exec.svg?branch=master)](https://travis-ci.org/legodude17/npm-exec)

> A util for just running a npm script


## Install

```
$ npm install --save npm-exec
```


## Usage

```js
const npmExec = require('npm-exec');

npmExec('unicorns');
//=> 'unicorns & rainbows'
```


## API

### npmExec(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## CLI

```
$ npm install --global npm-exec
```

```
$ npm-exec --help

  Usage
    npm-exec [input]

  Options
    --foo  Lorem ipsum [Default: false]

  Examples
    $ npm-exec
    unicorns & rainbows
    $ npm-exec ponies
    ponies & rainbows
```


## License

MIT © [legodude17](https://legodude17.github.io)
