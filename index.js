let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let slack = require('slack')
let timestamp = require('unix-timestamp')
let _ = require('lodash')
let fs = require('fs')
let path = require('path')
let {border, focusBorder} = JSON.parse(fs.readFileSync(path.join(process.env['SLAG_TOKEN']), { encoding: 'utf-8' }))

let {
  getTokens,
  getTeamData,
  sendMessage,
  formatMessage,
  handleMessage,
  markRead,
  logHistory } = require('./util')

function onTeamChange(i) {
  t = i
  bot.close()
  screen.destroy()

  run()
}

function assignScreenEvents() {
  if (tokenList.length > 1) {
    screen.key(['C-t'], (ch, key) => {
      onTeamChange(++t)
    })
  }

  for (let i = 0; i < Math.min(teamSwitchKeys.length, tokenList.length); i++) {
    screen.key([`C-${teamSwitchKeys[i]}`], (ch, key) => {
      onTeamChange(teamSwitchKeys.indexOf(key.name))
    })
  }

  screen.key(['escape', 'C-c'], (ch, key) => {
    bot.close()
    screen.destroy()
    return process.exit(0)
  })
}

function prepareScreen(teamData) {
  _.extend(teamData, {
    userListInverted: _.invert(teamData.userList),
    channelListInverted: _.invert(teamData.channelList),
    token: token
  })

  let log = grid.set(0, 4, 11, 8, slackLog, {
    label: `#${teamData.channelList[teamData.currentChannel].name}`,
    tags: true,
    scrollable: true,
    teamData: teamData,
    mouse: true
  })
  log.style.border = border

  let input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${teamData.channelList[teamData.currentChannel].name}`,
  })
  input.style.border = border

  input.on('submit', (data) => {
    var message = formatMessage(teamData, input.getValue())
    input.clearValue()
    screen.render()
    sendMessage(teamData, message)
  })

  let tree = grid.set(0, 0, 8.5, 4, contrib.tree, {
    label: `${teamData.currentTeam}`,
    tags: true,
    template: {
      lines: true
    },
    mouse: true,
    interactive: true
  })
  tree.style.border = border

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != teamData.currentChannel) {
      teamData.currentChannel = node.id
      let channelObject = teamData.channelList[teamData.currentChannel]
      input.setLabel(`Message ${teamData.currentChannel[0] == 'C' ? '#' : '@'}${channelObject.name}`)
      log.setLabel(`${teamData.currentChannel[0] == 'C' ? '#' : '@'}${channelObject.name}`)
      log.logLines = []
      log.clearItems()
      logHistory(teamData, log)
      markRead(teamData, node.id, timestamp.now())
      tree.setData(teamData.channelTree)
      screen.render()
    }
  })

  tree.setData(teamData.channelTree)

  let teamDisplay = grid.set(8.5, 0, 4, 4, contrib.tree, {
    label: `Your Teams`,
    tags: true,
    template: {
      lines: true
    },
    mouse: true,
    interactive: true
  })
  teamDisplay.setData({
    extended: true,
    children: makeTeamDisplayChildren(tokenList)
  })
  teamDisplay.style.border = border

  teamDisplay.on('select', (node) => {
    onTeamChange(node.index)
  })

  let now = parseFloat(timestamp.now())
  bot.message((message) => {
    if (parseFloat(message.ts) > now) {
      handleMessage(teamData, message, log)
      tree.setData(teamData.channelTree)
    }
  })

  let foci = [tree, input, teamDisplay]
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

  screen.on('resize', () => {
    initScreen(teamData, log, tree)
  })

  initScreen(teamData, log, tree)
}

function initScreen(teamData, log, tree) {
  log.clearItems()
  logHistory(teamData, log)
  markRead(teamData, teamData.currentChannel, timestamp.now())
  tree.setData(teamData.channelTree)
  screen.render()
}

function makeTeamDisplayChildren(tokenList) {
  let children = {}
  for (let i = 0; i < tokenList.length; i++) {
    let item = tokenList[i]
    children[`${item.team} (⌃${teamSwitchKeys[i]})`] = _.extend(item, {index: i})
  }
  return children
}

function run() {
  token = tokenList[t % tokenList.length].token
  bot.listen({token})

  screen = blessed.screen({
    fullUnicode: true,
    scrollable: true
  })
  assignScreenEvents()

  grid = new contrib.grid({
    rows: 12, cols: 12, screen: screen
  })

  getTeamData(token, (teamData) => {
    prepareScreen(teamData)
  })
}

function init() {
  bot = slack.rtm.client()
  tokenList = getTokens()
  t = 0
  teamSwitchKeys = 'asdfghjkl'

  run()
}

module.exports = init
