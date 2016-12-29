let blessed = require('blessed')
let contrib = require('blessed-contrib')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let wordwrap = require('wordwrap')
let wrap

let getTeamData = require('./util/getTeamData')

env(__dirname + '/.env')

let bot = slack.rtm.client()
let tokens = process.env.SLACK_TOKENS.split(" ")
let t = 0
let token = tokens[t]

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

let lastMessager = ''

getTeamData(token, (teamData) => {
  prepareScreen(teamData)
})

let border = {type: "line", fg: "white"}
let focusBorder = {type: "line", fg: "green"}

function prepareScreen(teamData) {
  let {
    channelTree,
    channelList,
    currentChannel,
    userList,
    currentTeam
  } = teamData

  let log = grid.set(0, 4, 11, 8, contrib.log, {
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true
  })
  log.style.border = border

  let input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
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
      log.clearItems()
      lastMessager = ''
      getHistory(currentChannel, log, userList)
      screen.render()
    }
  })

  tree.setData(channelTree)

  bot.message((message) => {
    if (message.channel == currentChannel) {
      logMessage(message, log, userList)
    }
  })

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
    init(currentChannel, log, userList)
  })

  init(currentChannel, log, userList)
}

function logMessage(message, log, userList) {
  let chatmessage = message.text != undefined ?
    wrap(parseMessage(message.text, userList)).split('\n') : ['']

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

  for (let chat of chatmessage) {
    log.log(`{white-fg}${chat}{/white-fg}`)
  }
}

function parseMessage(text, userList) {
  let message = text
  let userReg = /<@([^>\|]*)\|?([^>]*)>/g
  let groupReg = /<!([^>\|]*)\|?@?([^>]*)>/g

  let match
  while (match = userReg.exec(text)) {
    message = message.replace(match[0], `{red-fg}@${userList[match[1]]}{/red-fg}`)
    message = _.replace(message, match[0], `{red-fg}@${userList[match[1]]}{/red-fg}`)
  }
  while (match = groupReg.exec(text)) {
    message = _.replace(message, match[0], `{red-fg}@${match[2].length?match[2]:match[1]}{/red-fg}`)
  }
  return message
}

function init(currentChannel, log, userList) {
  log.clearItems()
  wrap = wordwrap(log.width-2)
  getHistory(currentChannel, log, userList)
  screen.render()
}

function getHistory(channel, log, userList) {
  let api = ''
  switch(channel[0]) {
    case 'C':
      api = 'channels'
      break
    case 'G':
      api = 'groups'
      break
    case 'D':
      api = 'im'
      break
    default:
      break
  }

  slack[api].history({
    token: token,
    channel: channel
  }, (err, data) => {
    if (err) console.log(err)
    for (let message of data.messages.reverse()) {
      logMessage(message, log, userList)
    }
  })
}
