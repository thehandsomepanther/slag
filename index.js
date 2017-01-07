let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let slack = require('slack')
let timestamp = require('unix-timestamp')
let _ = require('lodash')
let fs = require('fs')
let path = require('path')
let {border, focusBorder} = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), { encoding: 'utf-8' }))

let {
  getTokens,
  getTeamData,
  sendMessage,
  formatMessage,
  handleMessage,
  logHistory } = require('./util')

let bot = slack.rtm.client()
let tokens = getTokens()
let t = 0
let token = tokens[t]
bot.listen({token})

let screen = blessed.screen({
  fullUnicode: true
})
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

if (tokens.length > 1) {
  screen.key(['C-t'], onTeamChange)
}

function onTeamChange(ch, key) {
  bot.close()
  token = tokens[(++t) % tokens.length]
  bot.listen({token})
  screen.destroy()
  screen = blessed.screen({
    fullUnicode: true
  })
  grid = new contrib.grid({
    rows: 12, cols: 12, screen: screen
  })
  screen.key(['C-t'], onTeamChange)
  getTeamData(token, (teamData) => {
    prepareScreen(teamData)
  })
}

getTeamData(token, (teamData) => {
  prepareScreen(teamData)
})

function prepareScreen(teamData) {
  _.extend(teamData, {
    userListInverted: _.invert(teamData.userList),
    channelListInverted: _.invert(teamData.channelList),
    token: token
  })

  let log = grid.set(0, 4, 11, 8, slackLog, {
    label: `#${teamData.channelList[teamData.currentChannel]}`,
    tags: true,
    scrollable: true,
    teamData: teamData
  })
  log.style.border = border

  let input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${teamData.channelList[teamData.currentChannel]}`,
  })
  input.style.border = border

  input.on('submit', (data) => {
    var message = formatMessage(teamData, input.getValue())
    input.clearValue()
    screen.render()
    sendMessage(teamData, message)
  })

  let tree = grid.set(0, 0, 12, 4, contrib.tree, {
    label: `${teamData.currentTeam}`,
    tags: true,
  })
  tree.style.border = border

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != teamData.currentChannel) {
      teamData.currentChannel = node.id
      input.setLabel(`Message ${teamData.currentChannel[0] == 'C' ? '#' : '@'}${teamData.channelList[teamData.currentChannel]}`)
      log.setLabel(`${teamData.currentChannel[0] == 'C' ? '#' : '@'}${teamData.channelList[teamData.currentChannel]}`)
      log.logLines = []
      log.clearItems()
      logHistory(teamData, log)
    }
  })

  tree.setData(teamData.channelTree)

  let now = parseFloat(timestamp.now())
  bot.message((message) => {
    if (parseFloat(message.ts) > now) {
      handleMessage(teamData, message, log)
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
    init(teamData, log)
  })

  init(teamData, log)
}

function init(teamData, log) {
  log.clearItems()
  logHistory(teamData, log)
}
