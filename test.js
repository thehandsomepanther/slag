let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let {border, focusBorder} = require('jsonFile').readFileSync('./config.json')
let wordwrap = require('wordwrap')
let wrap

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

screen.key(['escape', 'C-c'], (ch, key) => {
  return process.exit(0);
})

let sLog = grid.set(0, 4, 11, 8, slackLog, {
  tags: true,
  scrollable: true
})
console.log(sLog.width)
// log.style.border = border

let log = grid.set(0, 4, 11, 8, contrib.log, {
  tags: true,
  scrollable: true
})
// console.log(log.width)
