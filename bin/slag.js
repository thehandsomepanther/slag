#!/usr/bin/env node
let init = require('../index')
let yargs = require('yargs')
let fs = require('fs-extra')
let path = require('path')

const manPath = path.join(__dirname, '../assets/man.txt')

let ARGS = yargs.argv

if (ARGS.h || ARGS.help) {
  console.log(
    'slag                                   \tlaunch the slag client\n'+
    'slag --h                               \tbring up slag commands\n'+
    'slag --man                             \tlearn how to use slag\n'+
    'slag --set-tokens <path>               \tset a tokens.json file\n' +
    'slag --add-token <token> --team <team> \tadd a token to your tokens.json\n' +
    'slag --list-tokens                     \tprint a list of registered tokens')
  process.exit(0)
}

if (ARGS['list-tokens']) {
  process.env['LIST_TOKENS'] = true
}

if (ARGS['add-token']) {
  if (!ARGS['team']) {
    console.log('You must provide a team name! Try again with an arg passed to the --team flag')
    process.exit(0)
  }

  process.env['SLAG_TOKEN'] = ARGS['add-token']
  process.env['SLAG_TOKEN_TEAM'] = ARGS['team']
} else if (ARGS['set-tokens']) {
  let tokenpath = ARGS['set-tokens']
  if (!path.isAbsolute(tokenpath)) {
    tokenpath = path.join(process.cwd(), ARGS['set-tokens'])
  }
  process.env['SLAG_TOKENS_PATH'] = tokenpath
}

if (ARGS['man']) {
  console.log(fs.readFileSync(manPath, { encoding: 'utf-8' }))
  process.exit(0)
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
  process.exit(code)
})

init()
