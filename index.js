let blessed = require('blessed')
let contrib = require('blessed-contrib')
let env = require('node-env-file')
let slack = require('slack')

let getChannels = require('./getChannels')
let getTeams = require('./getTeams')
let getUsers = require('./getUsers')

env(__dirname + '/.env')

let bot = slack.rtm.client()
let token = process.env.SLACK_TOKEN
// bot.listen({token})

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

let channelTree = {}
let channelList = {}
let currentChannel = ''
let userList = {}
let currentTeam = ''

function* screenGenerator() {
  var i = 0
  for (var i = 0; i < 3; i++) {
    var data = yield

    switch(Object.keys(data)[0]) {
      case 'getChannels':
        [channelTree, channelList, currentChannel] = data['getChannels']
        break
      case 'getUsers':
        userList = data['getUsers']
        break
      case 'getTeams':
        currentTeam = data['getTeams']
        break
      default:
        break
    }
  }

  prepareScreen()
}

let gen = screenGenerator()

let lastMessager = ''

gen.next()
getTeams(token, gen)
getChannels(token, gen)
getUsers(token, gen)

let border = {type: "line", fg: "cyan"}
let focusBorder = {type: "line", fg: "green"}

function prepareScreen() {
  var log = grid.set(0, 4, 11, 8, contrib.log, {
    border: border,
    fg: "green",
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true
  })

  bot.message((message) => {
    if (message.channel == currentChannel) {
      if (message.user != lastMessager) {
        log.log(userList[message.user])
        lastMessager = message.user
      }
      log.log(`{white-fg}${message.text}{/white-fg}`)
    }
  })

  var input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${channelList[currentChannel]}`,
    border: border
  })

  input.on('submit', (data) => {
    var message = input.getValue()
    input.clearValue()
    slack.chat.postMessage({
      token: token,
      channel: currentChannel,
      text: message,
      as_user: true
    }, (err, data) => {
      if (err) {
        console.log(err)
      }
    })
  })

  let tree = grid.set(0, 0, 12, 4, contrib.tree, {
    fg: 'green',
    label: `${currentTeam}`,
    tags: true,
    border: border
  })

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != currentChannel) {
      currentChannel = node.id
      input.setLabel(`Message #${channelList[currentChannel]}`)
      log.setLabel(`#${channelList[currentChannel]}`)
      log.clearItems()
      lastMessager = ''
    }

    screen.render()
  })

  tree.setData(channelTree)

  let foci = [tree, input]
  var currentFocus = 0

  foci[0].focus()
  foci[0].style.border = focusBorder

  screen.key(['tab'], (ch, key) => {
    foci[currentFocus].style.border = border
    currentFocus = (currentFocus + 1) % foci.length
    foci[currentFocus].focus()
    foci[currentFocus].style.border = focusBorder
    screen.render()
  })

  screen.key(['escape', 'C-c'], (ch, key) => {
    return process.exit(0);
  });

  screen.render()
}
