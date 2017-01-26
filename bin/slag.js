#!/usr/bin/env node
let init = require('../index')
let yargs = require('yargs')
let fs = require('fs-extra')
let path = require('path')

const manPath = path.join(__dirname, '../assets/man.txt')

let ARGS = yargs.argv

if (ARGS.h || ARGS.help) {
  console.log(
    'slag                   \t\tlaunch the slag client\n'+
    'slag --set-tokens <path>\t\tset a tokens.json file')
  process.exit(0)
}

if (ARGS['set-tokens']) {
  let tokenpath = ARGS['set-tokens']
  if (!path.isAbsolute(tokenpath)) {
    tokenpath = path.join(process.cwd(), ARGS['set-tokens'])
  }
  process.env['SLAG_TOKENS'] = tokenpath
}

if (ARGS['man']) {
  console.log(fs.readFileSync(manPath, { encoding: 'utf-8' }))
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
