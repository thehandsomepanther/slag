let blessed = require('blessed')
let contrib = require('blessed-contrib')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let wordwrap = require('wordwrap')
let wrap

let getChannels = require('./util/getChannels')
let getTeams = require('./util/getTeams')
let getUsers = require('./util/getUsers')

env(__dirname + '/.env')

let bot = slack.rtm.client()
let tokens = process.env.SLACK_TOKENS.split(" ")
let t = 0
let token = tokens[t]

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

let channelTree = {}
let channelList = {}
let currentChannel = ''
let userList = {}
let currentTeam = ''
let lastMessager = ''

let setup = [getTeams, getChannels, getUsers]

function* dataGenerator(n) {
  for (var i = 0; i < n; i++) {
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

function getData() {
  let gen = dataGenerator(setup.length)
  gen.next()
  for (let func of setup) {
    func(token, gen)
  }
}

getData()

let border = {type: "line", fg: "white"}
let focusBorder = {type: "line", fg: "green"}

function prepareScreen() {
  let log = grid.set(0, 4, 11, 8, contrib.log, {
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true
  })

  log.style.border = border

  bot.message((message) => {
    if (message.channel == currentChannel) {
      logMessage(message, log)
    }
  })

  var input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${channelList[currentChannel]}`,
  })
  input.style.border = border

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
    label: `${currentTeam}`,
    tags: true,
  })
  tree.style.border = border

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != currentChannel) {
      currentChannel = node.id
      input.setLabel(`Message #${channelList[currentChannel]}`)
      log.setLabel(`#${channelList[currentChannel]}`)
      log.logLines = []
      lastMessager = ''
      getHistory(currentChannel, log)
      screen.render()
    }
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

  screen.key(['C-t'], (ch, key) => {
    if (tokens.length > 1) {
      t = (t + 1) % tokens.length
      token = tokens[t]
      bot.listen({token})
      getData()
    }
  })

  screen.on('resize', () => {
    init(currentChannel, log)
  })

  init(currentChannel, log)
}

function init(currentChannel, log) {
  log.clearItems()
  wrap = wordwrap(log.width-2)
  getHistory(currentChannel, log)
  screen.render()
}

function getHistory(channel, log) {
  switch(channel[0]) {
    case 'C':
      slack.channels.history({
        token: token,
        channel: channel
      }, (err, data) => {
        if (err) return

        for (let message of data.messages.reverse()) {
          logMessage(message, log)
        }
      })
      break
    case 'G':
      slack.groups.history({
        token: token,
        channel: channel
      }, (err, data) => {
        if (err) return

        for (let message of data.messages.reverse()) {
          logMessage(message, log)
        }
      })
      break
    case 'D':
      slack.im.history({
        token: token,
        channel: channel
      }, (err, data) => {
        if (err) return

        for (let message of data.messages.reverse()) {
          logMessage(message, log)
        }
      })
      break
    default:
      break
  }
}

function logMessage(message, log) {
  var chatmessage = message.text != undefined ?
    wrap(parseMessage(message.text)).split('\n') : ['']

  if (message.subtype != undefined) {
    switch(message.subtype) {
      case 'bot_message':
        lastMessager = message.bot_id
        log.log(`{green-fg}${message.username ? message.username : `A Bot (${message.bot_id})`}{/green-fg}`)
        if (message.attachments != undefined) {
          chatmessage = []
          for (let attachment of message.attachments) {
            chatmessage.push(parseMessage(attachment.text).split('\n'))
          }
        }
        break
      default:
        break
    }
  } else {
    if (message.user != lastMessager) {
      log.log(`{green-fg}${userList[message.user]}{/green-fg}`)
      lastMessager = message.user
    }
  }

  for (var chat in chatmessage) {
    log.log(`{white-fg}${chatmessage[chat]}{/white-fg}`)
  }
  screen.render()
}

function parseMessage(text) {
  let message = text
  let userReg = /<@([^>\|]*)\|?([^>]*)>/g
  let groupReg = /<!([^>\|]*)\|?@?([^>]*)>/g

  let match
  while (match = userReg.exec(text)) {
    message = _.replace(message, match[0], `{red-fg}@${userList[match[1]]}{/red-fg}`)
  }
  while (match = groupReg.exec(text)) {
    message = _.replace(message, match[0], `{red-fg}@${match[2].length?match[2]:match[1]}{/red-fg}`)
  }
  return message
}
