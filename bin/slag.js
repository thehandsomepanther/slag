#! /usr/bin/env node
let init = require('../index')
let yargs = require('yargs')
let fs = require('fs-extra')
let path = require('path')

let ARGS = yargs.argv

if (ARGS.h || ARGS.help) {
  console.log(
    'slag                   \t\tlaunch the slag client\n'+
    'slag --set-token <path>\t\tset a tokens.json file')
  process.exit(0)
}

if (ARGS['set-token']) {
  fs.copySync(path.join(process.cwd(), ARGS['set-token']), './tokens.json')
  console.log('tokens.json created successfully')
  process.exit(0)
}

process.on('uncaughtException', function (err) {
  console.error(`[${(new Date).toUTCString()}] ${err.name}: ${err.message}\n`)
  console.error(err.stack)
  process.exit(1)
})

process.on('exit', function (code) {
  console.log('Exiting your Slag client...\n')
  process.exit(code)
})

init()
