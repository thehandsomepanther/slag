let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let {border, focusBorder} = require('jsonFile').readFileSync('./config.json')

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

screen.key(['C-t'], (ch, key) => {
  if (tokens.length > 1) {
    token = tokens[(++t) % tokens.length]
    getTeamData(token, (teamData) => {
      prepareScreen(teamData)
    })
  }
})

getTeamData(token, (teamData) => {
  prepareScreen(teamData)
})

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

  let log = grid.set(0, 4, 11, 8, slackLog, {
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true,
    channelList,
    userList
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
  })

  screen.on('resize', () => {
    init(log, userList, channelList, currentChannel)
  })

  init(log, userList, channelList, currentChannel)
}

function init(log, userList, channelList, currentChannel) {
  log.clearItems()
  logHistory(log, userList, channelList, currentChannel)
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
      log.logMessage(message)
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
      gen.next("Oops! We weren't able to get messages right now. Try again later.")
    } else {
      if (data.messages.length > 0) {
        gen.next(data.messages.reverse())
      } else {
        gen.next('This channel has no messages!')
      }
    }
  })
}
