#!/usr/bin/env node
let init = require('../index')
let yargs = require('yargs')
let fs = require('fs')
let path = require('path')

let ARGS = yargs.argv

if (ARGS.h || ARGS.help) {
  console.log("help")
  process.exit(0)
}

if (ARGS['set-token']) {
  console.log(path.join(__dirname, ARGS['set-token']))
  // process.env['SLAG_TOKEN'] = path.join(__dirname, ARGS['set-token'])
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
