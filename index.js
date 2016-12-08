module.exports = exec

var PATH = 'PATH'
var path = require('path')
var _spawn = require('child_process').spawn
var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var which = require('which')

if (process.platform === 'win32') {
	PATH = 'Path'
	Object.keys(process.env).forEach(function (e) {
		if (e.match(/^PATH$/i)) {
			PATH = e
		}
	})
}

function exec(stage, pkg, wd, cb) {
	if (typeof cb !== 'function') {
		cb = wd
		wd = process.cwd()
	}
	if (typeof cb !== 'function') {
		cb = pkg
		pkg = {
			scripts: {}
		}
	}
	if (typeof cb !== 'function') {
		cb = stage
		stage = null
	}

	var env = makeEnv(pkg)
	env.npm_lifecycle_event = stage
	env.npm_node_execpath = env.NODE = env.NODE || process.execPath
	env.npm_execpath = require.main.filename

	var pathArr = []
	var p = wd.split(/[\\\/]node_modules[\\\/]/)
	var acc = path.resolve(p.shift())

	p.forEach(function (pp) {
		pathArr.unshift(path.join(acc, 'node_modules', '.bin'))
		acc = path.join(acc, 'node_modules', pp)
	})
	pathArr.unshift(path.join(acc, 'node_modules', '.bin'))

	// we also unshift the bundled node-gyp-bin folder so that
	// the bundled one will be used for installing things.
	pathArr.unshift(path.join(__dirname, '..', '..', 'bin', 'node-gyp-bin'))

	if (shouldPrependCurrentNodeDirToPATH()) {
		// prefer current node interpreter in child scripts
		pathArr.push(path.dirname(process.execPath))
	}

	if (env[PATH]) pathArr.push(env[PATH])
	env[PATH] = pathArr.join(process.platform === 'win32' ? ';' : ':')

	env.npm_lifecycle_script = pkg.scripts[stage]

	if (pkg.scripts[stage]) {
		runCmd(pkg.scripts[stage], env, wd, cb)
	} else {
		fs.stat(path.join(wd, 'node_modules', '.bin', stage), function (er, stat) {
			if (er || !stat.isDirectory()) {
				return cb(new Error("Could not find script: " + stage))
			}
			return runCmd(path.resolve(path.join(wd, 'node_modules', '.bin', stage)), env, wd, cb)
		})
	}
}

function makeEnv(data, prefix, env) {
	prefix = prefix || 'npm_package_'
	if (!env) {
		env = {}
		for (var i in process.env) {
			if (!i.match(/^npm_/)) {
				env[i] = process.env[i]
			}
		}
	} else if (!data.hasOwnProperty('_lifecycleEnv')) {
		Object.defineProperty(data, '_lifecycleEnv', {
			value: env,
			enumerable: false
		})
	}

	for (i in data) {
		if (i.charAt(0) !== '_') {
			var envKey = (prefix + i).replace(/[^a-zA-Z0-9_]/g, '_')
			if (i === 'readme') {
				continue
			}
			if (data[i] && typeof data[i] === 'object') {
				try {
					// quick and dirty detection for cyclical structures
					JSON.stringify(data[i])
					makeEnv(data[i], envKey + '_', env)
				} catch (ex) {
					// usually these are package objects.
					// just get the path and basic details.
					var d = data[i]
					makeEnv({
							name: d.name,
							version: d.version,
							path: d.path
						},
						envKey + '_',
						env
					)
				}
			} else {
				env[envKey] = String(data[i])
				env[envKey] = env[envKey].indexOf('\n') !== -1 ?
					JSON.stringify(env[envKey]) :
					env[envKey]
			}
		}
	}

	if (prefix !== 'npm_package_') return env
	var pkgConfig = data.config || {}

	prefix = 'npm_package_config_'
	for (var i in pkgConfig) {
		var envKey = (prefix + i)
		env[envKey] = pkgConfig[i]
	}

	return env
}

function shouldPrependCurrentNodeDirToPATH() {
	var isWindows = process.platform === 'win32'
	try {
		var foundExecPath = which.sync(path.basename(process.execPath), {
			pathExt: isWindows ? ';' : ':'
		})
		return process.execPath.toUpperCase() !== foundExecPath.toUpperCase()
	} catch (e) {
		return true
	}
}

function runCmd(cmd, env, wd, cb_) {
	function cb() {
		cb_.apply(null, arguments)
	}

	var conf = {
		cwd: wd,
		env: env,
		stdio: [0, 1, 2]
	}

	var sh = 'sh'
	var shFlag = '-c'

	if (process.platform === 'win32') {
		sh = process.env.comspec || 'cmd'
		shFlag = '/d /s /c'
		conf.windowsVerbatimArguments = true
	}

	var proc = spawn(sh, [shFlag, cmd], conf)

	proc.on('error', procError)
	proc.on('close', function (code, signal) {
		if (signal) {
			process.kill(process.pid, signal)
		} else if (code) {
			var er = new Error('Exit status ' + code)
		}
		procError(er)
	})
	process.once('SIGTERM', procKill)

	function procError(er) {
		if (er) {
			er.message = '`' + cmd + '`\n' +
				er.message
			if (er.code !== 'EPERM') {
				er.code = 'ELIFECYCLE'
			}
			er.script = cmd
		}
		process.removeListener('SIGTERM', procKill)
		return cb(er)
	}

	function procKill() {
		proc.kill()
	}
}

function spawn(cmd, args, options) {
	var raw = _spawn(cmd, args, options)
	var cooked = new EventEmitter()

	raw.on('error', function (er) {
		er.file = cmd
		cooked.emit('error', er)
	}).on('close', function (code, signal) {
		// Create ENOENT error because Node.js v0.8 will not emit
		// an `error` event if the command could not be found.
		if (code === 127) {
			var er = new Error('spawn ENOENT')
			er.code = 'ENOENT'
			er.errno = 'ENOENT'
			er.syscall = 'spawn'
			er.file = cmd
			cooked.emit('error', er)
		} else {
			cooked.emit('close', code, signal)
		}
	})

	cooked.stdin = raw.stdin
	cooked.stdout = raw.stdout
	cooked.stderr = raw.stderr
	cooked.kill = function (sig) {
		return raw.kill(sig)
	}

	return cooked
}
