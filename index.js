let blessed = require('blessed')
let contrib = require('blessed-contrib')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let wordwrap = require('wordwrap')
let wrap

let getTeamData = require('./util/getTeamData')
let parseMessage = require('./util/parseMessage')
let formatMessage = require('./util/formatMessage')

env(__dirname + '/.env')

let bot = slack.rtm.client()
let tokens = process.env.SLACK_TOKENS.split(" ")
let t = 0
let token = tokens[t]
bot.listen({token})

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

  let userListInverted = _.invert(userList)
  let channelListInverted = _.invert(channelList)

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
    var message = formatMessage(input.getValue(), userListInverted, channelListInverted, currentChannel)
    input.clearValue()
    screen.render()
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
      logHistory(log, userList, channelList, currentChannel)
    }
  })

  tree.setData(channelTree)

  bot.message((message) => {
    if (message.channel == currentChannel) {
      logMessage(message, log, userList, channelList)
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
      getTeamData(token, (teamData) => {
        prepareScreen(teamData)
      })
    }
  })

  screen.on('resize', () => {
    init(log, userList, channelList, currentChannel)
  })

  init(log, userList, channelList, currentChannel)
}

function init(log, userList, channelList, currentChannel) {
  log.clearItems()
  wrap = wordwrap(log.width-2)
  logHistory(log, userList, channelList, currentChannel)
}

function logMessage(message, log, userList, channelList) {
  let chatmessage = message.text != undefined ?
    wrap(parseMessage(message.text, userList, channelList)).split('\n') : ['']

  if (message.subtype != undefined) {
    switch(message.subtype) {
      case 'bot_message':
        lastMessager = message.bot_id
        // need a better way to handle bot names
        log.log(`{green-fg}${message.username ? message.username : `A Bot (${message.bot_id})`}{/green-fg}`)
        if (message.attachments != undefined) {
          chatmessage = []
          for (let attachment of message.attachments) {
            if (attachment.text) {
              chatmessage = wrap(parseMessage(attachment.text, userList, channelList)).split('\n')
            }
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

function logHistory(log, userList, channelList, channel) {
  let gen = historyGen(log, userList, channelList)
  gen.next()
  getHistory(channel, log, gen)
}

function* historyGen(log, userList, channelList) {
  log.log('Fetching messages...')
  let history = yield
  log.clearItems()
  log.logLines = []
  if (Array.isArray(history)) {
    for (let message of history) {
      logMessage(message, log, userList, channelList)
    }
  } else {
    log.log(history)
  }
}

function getHistory(channel, log, gen) {
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
    if (err) {
      log.log(err)
    } else {
      if (data.messages.length > 0) {
        gen.next(data.messages.reverse())
      } else {
        gen.next('This channel has no messages!')
      }
    }
  })
}
