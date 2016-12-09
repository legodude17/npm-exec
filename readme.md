# npm-exec

> A util for just running a npm script


<!-- vscode-markdown-toc -->
* 1. [Install](#Install)
* 2. [Usage](#Usage)
* 3. [API](#API)
	* 3.1. [npmExec(name, argsForScript, pkgdata, wd, cb)](#npmExecnameargsForScriptpkgdatawdcb)
		* 3.1.1. [input](#input)
		* 3.1.2. [argsForScript](#argsForScript)
		* 3.1.3. [pkgdata](#pkgdata)
		* 3.1.4. [wd](#wd)
		* 3.1.5. [cb](#cb)
* 4. [CLI](#CLI)
* 5. [License](#License)

<!-- /vscode-markdown-toc -->

##  1. <a name='Install'></a>Install

```
$ npm install --save npm-exec
```


##  2. <a name='Usage'></a>Usage

```js
const npmExec = require('npm-exec');

npmExec(script, args, pkgdata, wd, function (er) {
  if (er) {
    // Something bad happened
  }
  // Yay!
});
```


##  3. <a name='API'></a>API

###  3.1. <a name='npmExecnameargsForScriptpkgdatawdcb'></a>npmExec(name, argsForScript, pkgdata, wd, cb)

####  3.1.1. <a name='input'></a>input

Type: `string`

The script name to execute. Can either be a script defined in `pkgdata` or the name of a file in `wd/node_modules/.bin`.

####  3.1.2. <a name='argsForScript'></a>argsForScript

Type: `Array<string>`

Any args for the script you are running.

####  3.1.3. <a name='pkgdata'></a>pkgdata

Type: `Object`

The parsed `package.json` data for where the script should be executed.

####  3.1.4. <a name='wd'></a>wd

Type: `path`

The working directory of where to find executables and where to execute the scripts.

####  3.1.5. <a name='cb'></a>cb

Type: `function(err)`

The function to be called when it is done.


##  4. <a name='CLI'></a>CLI

```
$ npm install --global npm-exec
```

```
$ npm-exec --help
Usage
npm-exec [name] [args...]

Arguments
  name: Name of script to run or executable
    If not provided, npm-exec will prompt you to give it a name
  args: Arguments for the script [Default: None]

Examples
  $ npm-exec
  $ npm-exec test
  $ npm-exec eslint *.js

```


##  5. <a name='License'></a>License

MIT © [legodude17](https://legodude17.github.io)
