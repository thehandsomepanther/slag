let blessed = require('blessed')
let contrib = require('blessed-contrib')
let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

let tree = grid.set(0, 0, 12, 4, contrib.tree, {
  fg: 'green',
  label: 'Channels',
  tags: true,
  border: {type: "line", fg: "cyan"}
})

tree.setData({
  extended: true,
  children: {
    'Starred': {
      extended: true,
      children: {
        'general': {},
        'random': {}
      }
    },
    'Channels': {
      children: {
        'other-channel': {},
        'another-channel': {}
      }
    },
    'Direct Messages': {
      children: {
        'Josh Shi': {},
        'Someone Else': {}
      }
    }
  }
})

var log = grid.set(0, 4, 11, 8, contrib.log, {
  fg: "green",
  label: 'Server Log',
  tags: true,
  border: {type: "line", fg: "cyan"},
  scrollable: true
})

var input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
  keys: true,
  label: "Message"
})

input.focus()

input.on('submit', function(data) {
  var message = input.getValue()
  input.clearValue()
  log.log('{white-fg}' + message + '{/white-fg}')
})

var i = 0
setInterval(function() {log.log("new {red-fg}log{/red-fg} line " + i++)}, 500)

screen.render()

screen.key(['escape', 'C-c'], function(ch, key) {
  return process.exit(0);
});
