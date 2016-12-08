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
	if (process.argv[2]) {
		npmExec(process.argv[2], pkg, process.cwd(), handleExit)
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
			npmExec(result, pkg, process.cwd(), handleExit)
		})
	}
})
