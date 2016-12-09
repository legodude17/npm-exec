#! /usr/bin/env node

var npmExec = require('./')
var fs = require('fs')
var path = require('path')
var read = require('read')

function handleExit(er) {
	if (!er) {
		console.log("Finished script execution")
		process.exit(0)
	}
	console.error("Error: Script execution failed:")
	console.error(er.message)
	if (process.env.NODE_ENV === "development") {
		console.error(er.stack)
	}
	process.exit(1)
}

fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8', function (er, res) {
	if (er) {
		handleExit(er)
	}
	var pkg
	try {
		pkg = JSON.parse(res)
	} catch (er) {
		handleExit(er)
	}
	if (!(pkg && pkg.scripts)) {
		handleExit(new Error("No package.json or scripts!"))
	}
	function exec(cmd, args) {
		npmExec(cmd, args, pkg, process.cwd(), handleExit)
	}
	if (process.argv[2] === '--help') {
		console.log([
			'Usage',
    	'npm-exec [name] [args...]',
			'',
  		'Arguments',
    	'  name: Name of script to run or executable',
			'    If not provided, npm-exec will prompt you to give it a name',
			'  args: Arguments for the script [Default: None]',
			'',
  		'Examples',
    	'  $ npm-exec',
			'  $ npm-exec test',
			'  $ npm-exec eslint *.js'
		].join('\n'))
	}else if (process.argv[2]) {
		exec(process.argv[2], process.argv.slice(3))
	} else {
		console.log("Possible scripts to run:")
		console.log('  ' + Object.keys(pkg.scripts).join('\n  '))
		read({
			prompt: "What script to run?  ",
			default: "Exit"
		}, function (err, result, isDefault) {
			if (err) {
				handleExit(err)
			}
			if (isDefault) {
				console.log("Exiting...")
				process.exit(0)
			}
			exec(result, [])
		})
	}
})
