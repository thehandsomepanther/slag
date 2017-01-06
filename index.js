let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let slack = require('slack')
let _ = require('lodash')
let {border, focusBorder} = require('jsonFile').readFileSync('./config.json')

let {
  getTokens,
  getTeamData,
  sendMessage,
  parseMessage,
  formatMessage,
  logHistory } = require('./util')

let bot = slack.rtm.client()
let tokens = getTokens()
let t = 0
let token = tokens[t]
bot.listen({token})

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

if (tokens.length > 1) {
  screen.key(['C-t'], (ch, key) => {
    token = tokens[(++t) % tokens.length]
    bot.listen({token})
    getTeamData(token, (teamData) => {
      prepareScreen(teamData)
    })
  })
}

getTeamData(token, (teamData) => {
  prepareScreen(teamData)
})

function prepareScreen(teamData) {
  let {
    currentUser,
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
    currentUser,
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
    sendMessage(token, currentChannel, message)
  })

  let tree = grid.set(0, 0, 12, 4, contrib.tree, {
    label: `${currentTeam}`,
    tags: true,
  })
  tree.style.border = border

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != currentChannel) {
      currentChannel = node.id
      input.setLabel(`Message ${currentChannel[0] == 'C' ? '#' : '@'}${channelList[currentChannel]}`)
      log.setLabel(`${currentChannel[0] == 'C' ? '#' : '@'}${channelList[currentChannel]}`)
      log.logLines = []
      log.clearItems()
      logHistory(token, log, currentChannel)
    }
  })

  tree.setData(channelTree)

  bot.message((message) => {
    if (message.channel == currentChannel) {
      log.logMessage(message)
    }
  })

  let foci = [tree, input]
  var currentFocus = 0

  foci[currentFocus].focus()
  foci[currentFocus].style.border = focusBorder

  screen.key(['tab'], (ch, key) => {
    foci[currentFocus].style.border = border
    currentFocus = (currentFocus + 1) % foci.length
    foci[currentFocus].focus()
    foci[currentFocus].style.border = focusBorder
    screen.render()
  })

  screen.key(['escape', 'C-c'], (ch, key) => {
    return process.exit(0)
  })

  screen.on('resize', () => {
    init(token, log, currentChannel)
  })

  init(token, log, currentChannel)
}

function init(token, log, currentChannel) {
  log.clearItems()
  logHistory(token, log, currentChannel)
}
